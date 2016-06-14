jsPsych.plugins['ax'] = (function(){

  var plugin = {};

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial();
    
    function showFixCross(){
    	display_element.append("<p>+</p>");
    }
    
    function showA(){
    	display_element.empty();
    	display_element.append(trial.stimuli[0]);
    }
    
    function showX(){
    	display_element.empty();
    	display_element.append(trial.stimuli[1]);
    }
    
    function end(){
    	
    }
    
    //putting it all together
    
    
    
  }

  return plugin;

})();