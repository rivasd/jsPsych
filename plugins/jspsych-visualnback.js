/**
 * A plugin to present a classic visual n-back task, an index of visual working memory
 * 
 * @author Daniel Rivas
 * @author Catherine Prévost
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
  
  plugin.init = function(targetcount){
	  var dElement = jsPsych.getDisplayElement();
	  var height = dElement.height(); 
	  if(height==0){
		  //It is possible for the display element to have zero height, if, as often happens, it is empty and has no fixed height set by css
		  //we need to give a non-zero, default height for the plugin to work 
		  height=400;
		  dElement.height(height);
	  }
	  var width = dElement.width();
	  var smallest = Math.min(height,width);
	  var size = Math.floor(smallest/(targetcount+2));
	  var allTargets = [];	

	  for(var i = 0; i < targetcount; i++){
		  	var $target = $("<div></div>", {"class": "nbackstim"});
		  	$target.css("position","relative");
		  	
		  	var point = {
		  		node: $target,
		  		X: 0,
		  		Y: 0		
		  	}
		  	
		  	allTargets[i]=point;	
		  	point.X = getRandomArbitrary(size,width-size);
		  	point.Y = getRandomArbitrary(size,height-size);
		  	
		  	if(i > 0){	
		  		for(var j = 0; j < i ; j++){
		  			if ((Math.abs(allTargets[j].X - allTargets[i].Y) > size/2) && (Math.abs(allTargets[j].Y - allTargets[i].Y)) > size/2){
	  					if(point.X < (width - 2*size)){
	  						point.X += Math.floor(size/2);
	  					}	
	  					else{ 
	  						point.X = size;
	  						j=0;
	  					}
		  			}
		  		}
		  	}     	
	  }
	  
	  allTargets.forEach(function(point){
		  jsPsych.getDisplayElement().append(point.node);
		  point.node.css({
			  'position': 'relative',
			  'left': point.X,
			  'top': point.Y,
			  'background-color': 'indigo',
			  'height': size,
			  'width': size,
			  'border-radius': '100px' //classic hack to created a round div: give it infinitely round borders 
		  });
	  });
	  
	  plugin.targets = allTargets;
	  
  }

  plugin.trial = function(display_element, trial){
	  if(!plugin.started){
		  //this is the first time we run a visualnback trial, we must place the stimuli and generate an empty queue of past answers
		  plugin.init(trial.stimuli);
	  }
	  
	  function selectingTarget(){
		  
		  trial.n = trial.n || 2;
		  
		  var idx = Math.floor(Math.random()*plugin.targets.length);
		  var currentAnswer = allTargets[idx].node;  
		  answers.push(currentAnswer);
		  
		  currentAnswer.css("background-color","red");
	  } 
	  
	  function clear(){
		  plungin.targets.forEach(function(point){
			 point.node.css("background-color","indigo");  
		  });
	  }
	  
	  function verify(chosen){
		  var isCorrect = false; 
		  if(plugin.answers[plugin.answers.length-trial.n] == chosen){
			  isCorrect = true;
		  }
		  return isCorrect;
	  }
	  
	var data = {}; //just a placeholder data ibject for now
    jsPsych.finishTrial(data);
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