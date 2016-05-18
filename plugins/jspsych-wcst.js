/**
 * A plugin to implement the Wisconsin Card Sorting Task
 * 
 * @author Daniel Rivas
 * @author Cahterine Prevost
 */


jsPsych.plugins['wcst'] = (function(){

  var plugin = {};
  var initialized = false;
  /**@type {string} represents which dimension serves currently as the rule*/
  plugin.rule= undefined;
  plugin.wins;
  plugin.consecutive;
  /**@type {number} holds the number of consecutive correct answers, useful to know when to change the rule*/
  plugin.totalErrors;
  /**@type {string} holds the value of the last rule, useful to identify perseveration errors*/
  plugin.lastRule = undefined;
  
  plugin.justChanged = true;
  
  
  
  /**
   * A module to generate the card stimuli on-the-fly using a hidden HTML5 canvas element. 
   * Eliminates the need for researchers to find, create, and store images on their server and prevents having to specify and handle naming conventions
   * just to find and present the right card (e.g. forcing to name cards like <number>_<color>_<shape>.png or what not).
   * Multiple options for card creation can be specified, allowing expansion of experimental designs and maybe reuse for further stimuli generation tasks.
   * 
   * 
   */
  function CardGenerator(opts){
	  var module = {};
	  
	  var height = opts.height;
	  var width = opts.width;
	  var size = Math.floor(width/4);
	  var backgroundColor = opts.backgroundColor;
	  
	  var canvas;
	  var context;
	  var vault={};
	  var numberOfCards=0;
	  var keyPoints={};
	  
	  var numbers=['1', '2', '3', '4'];
	  var shapes=['triangle', 'square', 'circle', 'cross'];
	  var colors=['red', 'yellow', 'blue', 'green'];
	  var ready=false;
	  
	  /**
	   * Initializes the data structure that will hold our card images in a nicely indexed way.
	   */
	  function setupVault(){
		  numbers.forEach(function(number, i, array) {
			  vault[number]= {};
		  	shapes.forEach(function(shape, j, array) {
		  		vault[number][shape] = {};
		  		colors.forEach(function(color, k, array) {
		  			var cardImg = new Image();
		  			vault[number][shape][color] = cardImg;
		  			numberOfCards++;
		  		});
		  	});
		  });
	  }
	  
	  /**
	   * Specifies in advance all the positions on the card (equivalently, the canvas) where we might want to draw a centered figure.
	   * Computes all the positions used when drawing one to four figures on a card and stores them in the keyPoints private object.
	   */
	  function findKeyPoints(){
		  //we defined that exactly 5 shape-widths should fit along the width of a card, allowing for 1 width's worth of clearance on both sides + 3 possible horizontal positions
		  var shapeWidth = Math.floor(width/5);
		  //the min distance a shape's center should be from the card edge
		  var clearance = Math.ceil(shapeWidth*1.3);
		  var acrossX = 2*shapeWidth;
		  
		  keyPoints.center = [Math.floor(width/2), Math.floor(height/2)];
		  keyPoints.topLeft = [Math.floor(clearance), Math.floor(clearance)];
		  keyPoints.topRight = [Math.floor(width-clearance), Math.floor(clearance)];
		  keyPoints.lowLeft = [Math.floor(clearance), Math.floor(height-clearance)];
		  keyPoints.lowRight = [Math.floor(width-clearance), Math.floor(height-clearance)];
		  keyPoints.centerRight = [Math.floor(width-clearance), Math.floor(height/2)];
	  }
	  
	  
	  function drawSquare(pos, color){
		  context.fillStyle = color;
		  context.fillRect(pos[0]-(size/2), pos[1]-(size/2), size, size);
	  }
	  
	  function drawCircle(pos, color){
		  context.fillStyle = color;
		  context.beginPath();
		  context.arc(pos[0], pos[1], size/2, 0, Math.PI*2, false);
		  context.fill();
	  }
	  
	  function drawCross(pos, color){
		  
		  var slimFactor = 0.3; //one of my best variable names yet :)
		  var smallSide = Math.floor(slimFactor * size);
		  var verticalRectOrigin = [pos[0]-(smallSide/2), pos[1]-(size/2)];
		  var horizontalRectOrigin = [pos[0]-(size/2), pos[1]-(smallSide/2)];
		  
		  context.fillStyle = color;
		  context.fillRect(verticalRectOrigin[0], verticalRectOrigin[1], smallSide, size);
		  context.fillRect(horizontalRectOrigin[0], horizontalRectOrigin[1], size, smallSide);
	  }
	  
	  function drawTriangle(pos, color){
		  //never thought I'd have to brush up my trig for this...
		  var smallGap = Math.floor(size*(Math.tan(Math.PI/6)/2));
		  var bigGap = Math.floor((size/2) / Math.cos(Math.PI/6));
		  
		  context.fillStyle = color;
		  context.beginPath();
		  context.moveTo(pos[0]+(size/2), pos[1]+smallGap);
		  context.lineTo(pos[0]-(size/2), pos[1]+smallGap);
		  context.lineTo(pos[0], pos[1]-bigGap);
		  context.fill();
	  }
	  
	  function drawShapeAt(shape, pos, color){
		  var drawFunc;
		  if(shape === 'square'){
			  drawFunc = drawSquare;
		  }
		  else if(shape === 'circle'){
			  drawFunc = drawCircle;
		  }
		  else if(shape === 'cross'){
			  drawFunc = drawCross;
		  }
		  else if(shape ==='triangle'){
			  drawFunc = drawTriangle;
		  }
		  
		  drawFunc(pos, color);
	  }
	  
	  function getPointSet(qtt){
		  var points;
		  switch (qtt){
		  case 1:
			  points=[keyPoints.center];
			  break;
		  case 2:
			  points=[keyPoints.topLeft, keyPoints.lowRight];
			  break;
		  case 3:
			  points=[keyPoints.topLeft, keyPoints.lowLeft, keyPoints.centerRight];
			  break;
		  case 4:
			  points=[keyPoints.topLeft, keyPoints.topRight, keyPoints.lowLeft, keyPoints.lowRight];
			  break;
		  default:
			  throw "We do not support more than 4 figures in the card";
			  break;
		  	
		  }
		  return points;
	  }
	  
	  /**
	   * Main function that actually executes the drawing
	   */
	  function generate(shape, color, number){
		  var positions = getPointSet(number); //get a list of all the coords. where we will need to draw an image
		  context.clearRect(0, 0, width, height); //clear the canvas before starting
		  
		  context.fillStyle = backgroundColor; // drawing the background of the card
		  context.fillRect(0, 0, width, height); 
		  
		  positions.forEach(function(position, i, array) {
		  	drawShapeAt(shape, position, color); //draw the shapes
		  });
		  var card = canvas[0].toDataURL();
		  return card;
	  }
	  
	  /***************************************** PUBLIC API **********************************/
	  
	  /**
	   * Sets up the vault with empty images, creates and appends the canvas element that will be used to draw the cards.
	   */
	  module.init = function(){
		  setupVault();
		  findKeyPoints();
		  canvas = $('<canvas height="'+height+'" width="'+width+'"></canvas>', {
			 class: 'jspsych-wcst-canvas',
			 id:'wcst-canvas'
		  });
		  canvas.css("display", "none");
		  opts.target.append(canvas);
		  context = canvas[0].getContext("2d");
	  }
	  
	  /**
	   * Creates the whole set of cards as img elements 
	   */
	  module.makeDeck = function(){
		  
		  numbers.forEach(function(number, i, array) {
		  	shapes.forEach(function(shape, j, array) {
		  		colors.forEach(function(color, k, array) {
		  			vault[number][shape][color].src = generate(shape, color, parseInt(number));
		  		});
		  	});
		  });
		  ready=true;
	  }
	  
	  /**
	   * Retrieve an card img element specified by the number, shape, and color
	   */
	  module.get = function(number, shape, color){
		  return $(vault[number][shape][color]);
	  }
	  
	  module.init();
	  return module;
  }
  
  plugin.init = function(opts){
	  plugin.viewport = $("<table></table>");
	  plugin.cards = $("<tr></tr>");
	  plugin.viewport.append(plugin.cards);
	  var secondrow = $("<tr></tr>");
	  plugin.target = $("<td></td>");
	  secondrow.append(plugin.target);
	  plugin.viewport.append(secondrow);
	  var thirdrow = $("<tr></tr>");
	  plugin.feedback = $("<td></td>");
	  thirdrow.append(plugin.feedback);
	  plugin.viewport.append(thirdrow);
	  
	  jsPsych.getDisplayElement().append(plugin.viewport);
	  
	  plugin.generator = CardGenerator({
		  width: 150,
		  height: 200,
		  backgroundColor: 'grey',
		  target:jsPsych.getDisplayElement()
	  });
	  plugin.generator.makeDeck();
	  
	  
	  plugin.choices = []
	  for(var i=0;i<4;i++){
		  plugin.choices[i] = {}
	  }
	  plugin.wins = 0;
	  plugin.consecutive = 0;
	  plugin.totalErrors = 0;
	  var ruleSamples = ['number','color', 'shape'];
	  plugin.rule = ruleSamples[Math.floor(Math.random()*3)];
	  //plugin.viewport.append(plugin.generator.get('2', 'cross', 'green'));
	  initialized = true;
  }
    
  var numbers=['1', '2', '3', '4'];
  var shapes=['triangle', 'square', 'circle', 'cross'];
  var colors=['red', 'yellow', 'blue', 'green'];
  var rules = ['number', 'color', 'shape'];
  
  plugin.trial = function(display_element, trial){
	  trial.streak = trial.streak || 4;
	  /**
	   * Generates an abstract card where the value of all 3 dimensions are set randomly
	   */
	  function generateCard(board){
		  var chosenShape = shapes[Math.floor(Math.random()* shapes.length)];
		  var chosenNumber = numbers[Math.floor(Math.random()* numbers.length)];
		  var chosenColor = colors[Math.floor(Math.random()* colors.length)];
		  
		   targetCard = {
					  shape: chosenShape,
					  number: chosenNumber,
					  color: chosenColor,
					  img: plugin.generator.get(chosenNumber, chosenShape, chosenColor)		  
		   }
		  
		  function isSame(board, targetCard){
			  var same = false;
			  board.forEach(function(boardCard){
				  if (targetCard.shape === boardCard.shape && targetCard.color === boardCard.color
				  &&targetCard.number === boardCard.number){
					  return same = true;
				  }
			 
			  });
			  return same;
		  }
		  
		  while(isSame(board, targetCard)){
			  chosenShape = shapes[Math.floor(Math.random()* shapes.length)];
			  chosenNumber = numbers[Math.floor(Math.random()* numbers.length)];
			  chosenColor = colors[Math.floor(Math.random()* colors.length)];
			  
			  targetCard = {
					  shape: chosenShape,
					  number: chosenNumber,
					  color: chosenColor,
					  img: plugin.generator.get(chosenNumber, chosenShape, chosenColor)		  
			  }
			  
		  }
		  return targetCard;
		 
	  }
	  
	  /**
	   * Takes an abstract representation of a card and gives a string pointing to the name of the image file on the server.
	   * 
	   */
	  function render(spec){
		  return plugin.generator.get(spec.number, spec.shape, spec.color);
	  }
	  
	  
	  /**
	   * Gives an array of 4 abstract cards among which all values of all dimensions are used exactly once
	   * Make sure to keep plugin.choices up to date!
	   */
	  function getBoard(){
		numbers = jsPsych.randomization.shuffle(numbers);
		shapes = jsPsych.randomization.shuffle(shapes);
		colors = jsPsych.randomization.shuffle(colors);
		
		var cards=[];
		for(var i=0;i<4;i++){
		  cards.push({
			  number:numbers[i],
			  color: colors[i],
			  shape: shapes[i],
			  img: plugin.generator.get(numbers[i], shapes[i], colors[i])
		  });
		}
		return cards
	  }
	  
	  /**
	   * Sets the relevant dimension to be different than the one currently active
	   */
	  function changeRule(){
		  
		  jsPsych.randomization.shuffle(rules);
		  plugin.lastRule = plugin.rule;
		  
		  if( rules[0] !== plugin.rule){
			  plugin.rule = rules[0];
		  }
		  else plugin.rule = rules[1];
		  plugin.justChanged = true;
		  plugin.wins++;
		  plugin.consecutive = 0;
	  }
	  
	  /**
	   * Given to abstract cards, returns whether the candidate matches the target given the current dimension rule
	   */
	  function verify(candidate, target, rule){
	  	  if(target[rule] === candidate[rule]){
	  	  	return true;
	  	  	}
		  else return false;  
	  }
	  
	  /**
	   * Verifies if the card chosen match the last rule
	   */
	  function checkPerseveration(card, target){
		  var persever = false;
		  if (plugin.lastRule !== undefined && plugin.justChanged === false){ 
			  //when the rule hadn't change yet, it 
			  //can't be perseveration and the first error after a rule change cannot really be counted as 
			  //a perseveration since there is no prior warning that the rule is now invalid
			     persever = verify(card, target, plugin.lastRule);  
			 }
		  return persever;
	  }
	  /**
	   * Updates the consecutive correct answers counter, or sets it to zero if the answer was wrong
	   */
	  function keepScore(answer){
		  if(answer){
			  plugin.consecutive++;
		  }
		  else plugin.consecutive = 0;
	  }
	  
	  /**
	   * Fires when the subject chooses a card that he/she thinks matches the target
	   */
	  function clickListener(evt){
		  this.id //card-3
		  plugin.choices[this.id];
		  //bla blabla
	  }
	  
	  if(!initialized){
		  plugin.init();
	  }
	  
	  //Create and draw four cards  on top of the page
	  var board=getBoard();
	  //Create and draw a card on the middle of the page
	  var target = generateCard(board);
	  plugin.target.append(target.img);
	  
	  var beginning = new Date();
	  beginning = Date.now();
	  
	  

	  //Ties the card on the board with the DOM and wait for someone to click on a board card
	  board.forEach(function(card, idx, arr){
		  var cell = $("<td></td>");
		  cell.append(card.img);
		  plugin.cards.append(cell);
		  //When user clicks on a board card, the answer is verified and a feedback is given
		  card.img.click(function(evt){
			 var correct = verify(target, card, plugin.rule);
			 keepScore(correct);
			 var reactionTime = new Date();
			 reactionTime = Date.now();
			 if(correct){
				 //montrer: CORRECT!
				 plugin.feedback.text("Correct!");
			 }
			 else{
				 //montrer INCORRECT!
				 plugin.feedback.text("Incorrect");
			 }
			 var data = {
				 "rt": reactionTime - beginning,
				 "correct": correct,
				 "perseveration": checkPerseveration(card,target),
				 "rule": plugin.rule
			 }
			 setTimeout(function(){
				 plugin.target.empty();
				 plugin.cards.empty();
				 plugin.feedback.empty();
				 jsPsych.finishTrial(data);
				 if(plugin.consecutive >= trial.streak){
				 	changeRule();
				 }
			 },1500); //TODO customising time in trials
		  });
	  });  
  }
  
  return plugin;

})();