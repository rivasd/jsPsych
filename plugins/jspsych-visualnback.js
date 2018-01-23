/**
 * A plugin to present a classic visual n-back task, an index of visual working memory
 * 
 * @author 	Daniel Rivas
 * @author 	Catherine Prévost
 * @date 	May 2016
 */

jsPsych.plugins['visualnback'] = (function(){

  var plugin = {};
  plugin.targets = [];
  plugin.answers = [];
  
  /** @type {boolean} flag to indicate that the experiment has been initialized and we can use the list of past answers*/
  plugin.started=false;

  
  function getRandomArbitrary(min, max){
	  
	  return Math.floor(Math.random()*(max-min)+min);
  }
  
  plugin.init = function(trial){
	  var targetcount = trial.stimuli;
	  
	  var dElement = $("<div></div>", {id: 'jspsych-nbackviewport'}).css({
		  'display':'block',
		  'width': '100%'
	  });
	  
	  var height = dElement.height(); 
	  if(height==0){
		  //It is possible for the display element to have zero height, if, as often happens, it is empty and has no fixed height set by css
		  //we need to give a non-zero, default height for the plugin to work 
		  height=400;
		  dElement.height(height);
	  }
	  var width = jsPsych.getDisplayElement().width();
	  var smallest = Math.min(height,width);
	  var size = Math.floor(smallest/(targetcount+2));
	  var allTargets = [];	
	  
	  /**
	   * Detects whether a given point will intersect any of the points previously placed on the display, given its position and size.
	   * Since it assumes that we use circular stimuli, this is basically an implementation of [the circle collision algorithm]{@link https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection}
	   * @param	{point}	point	The point to test
	   * @returns {boolean}
	   */
	  function collides(point){
		  var collDetected = false;
		  allTargets.forEach(function(prev){
			  if(prev === point){
				  return;
			  }
			  var diffX = point.X - prev.X;
			  var diffY = point.Y - prev.Y;
			  
			  if(Math.sqrt( diffX*diffX + diffY*diffY) <= size*2){
				  //TODO: should we return return more than a boolean?
				  collDetected =  true;
			  }
		  });
		  return collDetected;
	  }
	  
	  function place(point){
		  point.X = getRandomArbitrary(size,width-size);
		  point.Y = getRandomArbitrary(size,height-size);
	  }
	  
	  for(var i = 0; i < targetcount; i++){
		  	var $target = $("<div></div>", {"class": "jspsych-nbackstim"});
		  	var point = {
		  		node: $target,
		  		X: 0,
		  		Y: 0		
		  	}
		  	
		  	allTargets[i]=point;	
		  	place(point);
		  	
		  	if(i > 0){	
		  		for(var j = 0; j < i ; j++){
		  			if (collides(point)){
	  					place(point);
	  					j=0;
		  			}
		  		}
		  	}     	
	  }
	  plugin.viewport = dElement;
	  plugin.feedback = $("<p></p>", {class: 'feedback'});
	  jsPsych.getDisplayElement().append(dElement).append(plugin.feedback);
	  
	  allTargets.forEach(function(point){
		  dElement.append(point.node);
		  point.node.css({
			  'position': 'absolute',
			  'left': point.X,
			  'top': point.Y,
			  'background-color': 'indigo',
			  'height': size,
			  'width': size,
			  'border-radius': '100px' //classic hack to created a round div: give it infinitely round borders 
		  });
	  });
	  
	  plugin.targets = allTargets;
	  plugin.started = true;
  }

  plugin.trial = function(display_element, trial){
	  
	  jsPsych.getDisplayElement().append(plugin.viewport);
	  // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	  trial.n = trial.n || 2;
	  trial.response_key = trial.response_key || [13];
	  
	  if(!plugin.started){
		  //this is the first time we run a visualnback trial, we must place the stimuli and generate an empty queue of past answers
		  plugin.init(trial);
	  }
	  
	  /**
	   * randomly chooses a target and paints it a different color, and remembers the choice
	   */
	  function selectTarget(){
		  var idx = Math.floor(Math.random()*plugin.targets.length);
		  var currentAnswer = plugin.targets[idx].node;  
		  plugin.answers.push(currentAnswer);
		  
		  currentAnswer.css("background-color","red");
		  return currentAnswer;
	  } 
	  
	  /**
	   * Makes all target the same colour
	   */
	  function clear(){
		  plugin.targets.forEach(function(point){
			 point.node.css("background-color","indigo");  
		  });
	  }
	  
	  /**
	   * Determines whether the chosen target is the same as n trials in the past
	   */
	  function verify(chosen){
		  return (chosen === plugin.answers[plugin.answers.length-trial.n]);
	  }
	  
	  //holds the IDs for the setTimeout calls
	  var setTimeoutHandlers= [];
	  //Show the targets
	  //TODO: check effect of this repeated DOM insertion on accuracy of reaction times?
	  display_element.append(plugin.viewport);
	  //Choose a target at random, paint it red
	  var selected = selectTarget();
	  //will be true if the subject presses the response key
	  var hasHit = false;
	  //reaction time, will be >0 if subject presses the response key
	  var rt = -1;
	  
	  //Start counting down until timeout
	  setTimeoutHandlers.push(setTimeout(function(){
		  end();
	  }, trial.timeout));
	  
	  //At the same time, start listening for a key press
	  var keyListener = jsPsych.pluginAPI.getKeyboardResponse({
		  callback_function: function(data){
			  hasHit = true;
			  rt = data.rt;
			  jsPsych.pluginAPI.cancelKeyboardResponse(keyListener);
		  },
		  valid_responses: trial.response_key,
		  rt_method: 'date',
		  persist: true
	  });
	  
	  //This is executed after the period of time the subject had to press the key
	  function end(){
		  jsPsych.pluginAPI.cancelKeyboardResponse(keyListener);
		  var data={
			response: hasHit,
			rt: rt,
			hit: verify(selected),
			back: trial.n
		  }
		  
		  function next(){
			  
			 clear();
			 plugin.viewport.detach();
			 plugin.feedback.detach();
			 setTimeoutHandlers.forEach(function(h){
				 clearTimeout(h);
			  });
			  jsPsych.finishTrial(data);
			  
		  }
		  
		  
		  if(trial.show_feedback){
			  if(plugin.answers.length < trial.n){
				  plugin.feedback.text(trial.invalid_message);
			  }
			  else{
				  plugin.feedback.text(data.response == data.hit ? trial.correct : trial.incorrect); //matches hits and correct rejections
			  }
			  display_element.append(plugin.feedback);
			  setTimeoutHandlers.push(setTimeout(function(){
				  next();
			  }, trial.timing_feedback));
		  }else{
			  next();
		  }  
	  }
  }

  return plugin;

})();
/**1. attribuer une couleur aux target
 * 2. Pour n+1 fois
 * 	2.1 changer la couleur d'un target (aléatoirement?)
 * 	2.2 mettre le no. du target qui a changé de couleur dans un tableau
 * 3. Pour le nombre de fois désirées du trial
 * 	3.1 changer la couleur
 * 	3.2 mettre le no. du target qui a changé de couleur dans un tableau
 * 	3.3 demander à l'utilisateur le target qui a changé de couleur n fois avant
 * 	3.4 mettre la réponse dans un tableau
 * 	3.5 Comparer les tableaux
 * 		3.5.1 Si la réponse est pareille que le n-back
 * 			3.5.1.1 Afficher une réussite 
 * 			3.5.1.2 Afficher un échec
 * 	3.6 Enregistrer les données 
 * **/