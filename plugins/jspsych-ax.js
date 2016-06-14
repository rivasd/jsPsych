jsPsych.plugins['ax'] = (function(){

  var plugin = {};

  plugin.trial = function(display_element, trial){
	  
	  trial.response_key = trial.response_key || 81; // defaults to 'q'
	  trial.timing_first_stim = trial.timing_first_stim || 1000; // defaults to 1000msec.
	  trial.timing_second_stim = trial.timing_second_stim || 1000; // defaults to 1000msec.
	  trial.timing_response = trial.timing_response || -1; //
	  trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
	  trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
	  trial.isi = trial.isi || 1000;
	  
	  
	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	
    function handleStim(){
    	for(var i=0;i<trial.stimuli.length; i++){
    		if(trial.is_html){
    			trial.stimuli[i] = $("<div>", {
    				'class': "jspsych-ax-stimulus",
    				'html': trial.stimuli[i]
    			});
    		}
    		else{
    			trial.stimuli[i]= $("<img>", {
    				'class': 'jspsych-ax-stimulus',
    				'src': trial.stimuli[i]
    			});
    		}
    	}
    }
	
    handleStim();
    
	var setTimeoutHandlers = [];
	var fixationCross = $("<span>+</span>", {"class":"jspsych-fixation"});
	
	
    function showFixCross(){
    	display_element.append(fixationCross);
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