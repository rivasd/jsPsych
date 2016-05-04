/**
 * A plugin to implement the Wisconsin Card Sorting Task
 * 
 * @author Daniel Rivas
 * @author Cahterine Prevost
 */


jsPsych.plugins['wcst'] = (function(){

  var plugin = {};
  
  /**@type {string} represents which dimension serves currently as the rule*/
  plugin.rule= undefined;
  
  /**@type {number} holds the number of consecutive correct answers, useful to know when to change the rule*/
  plugin.consecutive = 0;
  
  /**@type {string} holds the value of the last rule, useful to identify perseveration errors*/
  plugin.lastRule = undefined;
  
  function ImageGenerator(canvas){
	  var module = {};
	  
	  module.init = function(){
		  
	  }
	  
	  module.get = function(number, colour, shape){
		  
	  }
	  
	  return module;
  }
  
  plugin.init = function(){
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
	  
	  var canvas = $("<canvas></canvas>");
	  
	  jsPsych.getDisplayTarget().append(plugin.viewport);
	  
	  plugin.generator = ImageGenerator();
	  
	  plugin.choices = []
	  for(var i=0;i<4;i++){
		  choices[i] = {}
		  choices[i].img = new Image()
		  choices[i].img= 'card-'+i.toString();
	  }
	  
  }
  
 
  
  plugin.trial = function(display_element, trial){
	  
	  /**
	   * Generates an abstract card where the value of all 3 dimensions are set randomly
	   */
	  function generateCard(){
		  
	  }
	  
	  /**
	   * Takes an abstract representation of a card and gives a string pointing to the name of the image file on the server.
	   */
	  function render(spec){
		  
	  }
	  
	  /**
	   * Gives an array of 4 abstract cards among which all values of all dimensions are used exactly once
	   * Make sure to keep plugin.choices up to date!
	   */
	  function getBoard(){
		  
	  }
	  
	  /**
	   * Sets the relevant dimension to be different than the one currently active
	   */
	  function changeRule(){
		  
	  }
	  
	  /**
	   * Given to abstract cards, returns whether the candidate matches the target given the current dimension rule
	   */
	  function verify(candidate, target, rule){
		  
	  }
	  
	  /**
	   * Updates the consecutive correct answers counter, or sets it to zero if the answer was wrong
	   */
	  function keepScore(answer){
		  
	  }
	  
	  /**
	   * Fires when the subject chooses a card that he/she thinks matches the target
	   */
	  function clickListener(evt){
		  this.id //card-3
		  plugin.choices[this.id];
		  //bla blabla
	  }
	  
    jsPsych.finishTrial();
  }
  
  return plugin;

})();