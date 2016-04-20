

jsPsych.plugins['visualnback'] = (function(){

  var plugin = {};
  plugin.targets = [];
  
  function getRandomArbitrary(min, max){
	  
	  return Math.random()*(max-min)+min;
  }
  
  plugin.init = function(targetcount){
	  var height = jsPsych.getDisplayElement().heigth();
	  var width = jsPsych.getDisplayElement().width();
	  var smallest = Math.min(height,width);
	  var size = smallest/(targetcount+2);
	  allTargets = [];	
	  
	  for(var i = 0; i < targetcount; i++){
		  	var $target = allTargets[i] = $("<div></div>");
		  	  	
		  	var X = getRandomArbitrary(size,width-size);
		  	var Y = getRandomArbitrary(size, height-size);
		  	
		  	if(i > 0){	
		  		for(var j = 0; j < i ; j){
		  			if (abs(allTargets[j].X - allTargets[i].X) > size/2 && abs(allTargets[j].Y - allTargets[i].Y) > size/2){
		  					if(X < (width - 2*size)){
		  						X = X + size/2;
		  					}	
		  					else X = size;
		  					j=0;
		  				}
		  			j++
		  			}
		  		}
		  	} 
	    	
	  }
  /* 1. attribuer une couleur aux target
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
   * */
  

	  
	  
	  
  }

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial(data);
  }

  return plugin;

})();