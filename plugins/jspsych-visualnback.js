jsPsych.plugins['visualnback'] = (function(){
	/**Première fois que le trial roule placer les target(ronds) 9? sur la page 
	 * -Pour chaque trial
	 *       Changer la couleur d'une image
	 *       
	 * 
	 * 
	 * 
	 * 
	 * 
	 * **/
	

  var plugin = {};
  plugin.targets = [];
  
  plugin.init = function(targetcount){
	  var height = jsPsych.getDisplayElement().heigth();
	  var width = jsPsych.getDisplayElement().width();
	  var smallest = Math.min(height,width);
	  var size = smallest/(targetcount+2);
	  
	  for(var i = 0; i< targetcount; i++){
		  	var $target = $("<div></div>");
	  }
  }

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial();
  }

  return plugin;

})();