/**
 * jspsych-audio-abx
 * Catherine Prevost
 *
 * plugin for building a abx task with audio stimuli
 *
 **/

jsPsych.plugins["audio-abx"] = (function() {
	
	var plugin = {};
	  
	jsPsych.pluginAPI.registerPreload('audio-similarity', 'stimuli', 'audio');

	plugin.trial = function(display_element, trial){
	
			// default parameters		
			trial.timing_gap = trial.timing_gap || 500; // default 1000ms
			trial.timeout = trial.timeout || 3000 //amount of time the response slider will be showing
			trial.timeout_feedback = trial.timeout_message || "<p>Please respond faster</p>";
			trial.timeout_message_timing = trial.timeout_message_timing || 1000
			trial.choices = trial.choices || ['a','b'];			
			trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
			trial.key_answer = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_answer) || convertKeyCharacterToKeyCode('f'); // key associated to the category
			
			
			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			var context;
		    var source;
		    var rt_start_time;
		    var prefetched_data = {};
		    
		    // store response
		    var response = {
		      rt: -1,
		      key: -1
		    };
		    
		    trial.setTimeoutHandlers = [];
		    
		    function playSound(soundOrder){
	        	context = jsPsych.pluginAPI.audioContext();
	    	    source = context.createBufferSource();
	    	    source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[soundOrder]);
	    	    source.connect(context.destination);
	    	    startTime = context.currentTime + 0.1;
	    	    source.start(startTime);
	        };
	        
		    function after_response(info) {
		        prefetched_data.rt = Date.now() - rt_start_time;
		        jsPsych.pluginAPI.clearAllTimeouts();
		        display_element.empty();

		        if (response.key == -1) {
		            response = info;
		          }
		        
		        if (info.key == trial.key_answer){
		      	  prefetched_data.result = 'correct';
		        }
		        else {
		      	  if (info.key)
		      	  prefetched_data.result = 'incorrect';
		        }	
		      	end_trial(prefetched_data);
		      };	
	              
			playSound(0);
			source.onended = function(){
				setTimeout(
					function(){
						if (trial.prompt !== "") {
							display_element.append(trial.prompt);
						}
						playSound(1)
						source.onended = function(){
							setTimeout(function(){
									playSound(2);
									
								    // end trial if time limit is set
								    source.onended = function(){
								    	rt_start_time = Date.now();
								    	// start the response listener
									    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
									      callback_function: after_response,
									      valid_responses: trial.choices,
									      persist: false,
									      allow_held_key: false,
									    });
									    //set timeout if needed
									    if (trial.timing_response > 0) {
									      jsPsych.pluginAPI.setTimeout(function() {
									    	  jsPsych.pluginAPI.cancelAllKeyboardResponses();
									    	  var $timeoutFeedback = $('<p></p>', {id:'timeoutFeedback'});
									    	  $timeoutFeedback.text(trial.timeout_feedback);
									    	  display_element.append($timeoutFeedback);
									    	  prefetched_data.result = 'timeout';
									    	  prefetched_data.rt = -1;
									    	  
									    	  jsPsych.pluginAPI.setTimeout(function() {
									        	  end_trial(prefetched_data);
									          }, trial.timing_feedback); 
										
									     },trial.timeout);};
										
								   }
								
								}
							,trial.timing_gap);
						};
					
					}
				,trial.timing_gap);
			};
			
			
		
						
		      var end_trial = function(prefetched_data) {

		          // kill any remaining setTimeout handlers
		          jsPsych.pluginAPI.clearAllTimeouts();

		          // stop the audio file if it is playing
		          source.stop();

		          // kill keyboard listeners
		          jsPsych.pluginAPI.cancelAllKeyboardResponses();

		          // gather the data to store for the trial
		          var trial_data = {
		            "rt": prefetched_data.rt,
		            "A": trial.stimuli[0],
		            "B": trial.stimuli[1],
		            "X": trial.stimuli[2],
		            "key_press": response.key,
		            "result": prefetched_data.result
		          };

		          // clear the display
		          display_element.html('');

		          // move on to the next trial
		          jsPsych.finishTrial(trial_data);
		        };	
		}	
	return plugin; 
})();
