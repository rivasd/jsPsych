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
	  
	  trial.response_key = trial.response_key || [81]; // defaults to 'q'
	  trial.timing_first_stim = trial.timing_first_stim || 1000; // defaults to 1000msec.
	  trial.timing_second_stim = trial.timing_second_stim || 1000; // defaults to 1000msec.
	  trial.timing_response = trial.timing_response || -1; //
	  trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
	  trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
	  trial.isi = trial.isi || 1000;
	  trial.timing_cross = trial.timing_cross || 500;
	  trial.correct = (typeof trial.correct === 'undefined') ? false : trial.correct;
	  
	  
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
    
    function showBlank(){
    	display_element.empty();
    }
    
    function end(data){
    	data = data || {rt:-1, key: undefined};
    	jsPsych.pluginAPI.cancelAllKeyboardResponses();
    	setTimeoutHandlers.forEach(function(key){
    		clearTimeout(key);
    	});
    	display_element.empty();
    	
    	if(trial.correct && data.key !== undefined){
    		data.correct = true;
    	}
    	else{
    		data.correct = false;
    	}
    	
    	jsPsych.finishTrial(data);
    }
    
    function waitForKeypress(){
    	var keylistener = jsPsych.pluginAPI.getKeyboardResponse({
    		callback_function: function(resp){
    			display_element.empty();
    			end(resp);
    		},
    		valid_responses: trial.response_key,
    		persist:false
    	});
    };
    
    //putting it all together
    
    showFixCross();
    setTimeoutHandlers.push(setTimeout(function(){
    	showA();
    	setTimeoutHandlers.push(setTimeout(function(){
    		showBlank();
    		setTimeoutHandlers.push(setTimeout(function(){
    			showX();
    			waitForKeypress();
    			setTimeoutHandlers.push(setTimeout(function(){
    				end();
    			}, trial.timing_second_stim));
    		}, trial.isi));
    	}, trial.timing_first_stim));
    }, trial.timing_cross))
    
  }

  return plugin;

})();