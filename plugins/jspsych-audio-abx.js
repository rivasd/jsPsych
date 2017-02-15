/**
 * jspsych-audio-abx
 * Catherine Prevost
 *
 * plugin for building a abx task with audio stimuli
 *
 **/

jsPsych.plugins["audio-abx"] = (function() {
	
	var plugin = {};
	  
	jsPsych.pluginAPI.registerPreload('audio-abx', 'stimuli', 'audio');

	plugin.trial = function(display_element, trial){
	
			// default parameters		
			trial.timing_gap = trial.timing_gap || 500; 
			trial.timeout = trial.timeout || 3000 //how much time do the subject have to answer after the sound began to play before the trial ends. If -1 the trial won't end until the subject give an answer.
			trial.timeout_feedback = trial.timeout_feedback || "<p>Please respond faster</p>";
			trial.timing_feedback = trial.timing_feedback || 1000 // how long to show the timeout feedback for
			trial.choices = trial.choices || ['a','b'];			
			trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
			trial.key_first = (typeof trial.key_first === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_first) : trial.key_first;
			trial.key_second = (typeof trial.key_second === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_second) : trial.key_second;
			
			
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
	    	    
	    	  //send the correct stimulus presentation trigger
	    	    if(jsPsych.pluginAPI.hardwareConnected && !trial.is_practice){
	    	    	jsPsych.pluginAPI.hardware({
	    	    		target: 'parallel',
	    	    		action: 'trigger',
	    	    		payload: soundOrder + 1
	    	    	});
	    	    }
	        };
	        
		    function after_response(info) {
		    	if(jsPsych.pluginAPI.hardwareConnected && !trial.is_practice){
	    	    	jsPsych.pluginAPI.hardware({
	    	    		target: 'parallel',
	    	    		action: 'trigger',
	    	    		payload: 10
	    	    	});
	    	    }
		        prefetched_data.rt = Date.now() - rt_start_time;
		        jsPsych.pluginAPI.clearAllTimeouts();
		        display_element.empty();
		        
		        if (response.key == -1) {
		            response = info;
		          }
		        
		        prefetched_data.correct = function evaluate_correctness(){
		        	if ((trial.stimuli[0] === trial.stimuli[2] && response.key == trial.key_first) || (trial.stimuli[1] === trial.stimuli[2] && response.key == trial.key_second)){
				      	   return true;
				    }
				    else {
				      	  return false;
		            }		        
		        }	
		      	end_trial(prefetched_data);
		      };
		      
			//show the prompt
			if (trial.prompt !== "") {
				display_element.append(trial.prompt);
			}     
			playSound(0); //playing sound A
			source.onended = function(){
				setTimeout(
					function(){
						playSound(1) //playing sound B
						source.onended = function(){
							setTimeout(function(){
									playSound(2); //playing sound X
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
									    if (trial.timeout > 0) {
									      jsPsych.pluginAPI.setTimeout(function() {
									    	  jsPsych.pluginAPI.cancelAllKeyboardResponses();
									    	  var $timeoutFeedback = $('<p></p>', {id:'timeoutFeedback'});
									    	  $timeoutFeedback.text(trial.timeout_feedback);
									    	  display_element.append($timeoutFeedback);
									    	  prefetched_data.correct = false;
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
		            "correct": prefetched_data.correct
		          };

		          // clear the display
		          display_element.html('');

		          // move on to the next trial
		          jsPsych.finishTrial(trial_data);
		        };	
		}	
	return plugin; 
})();
