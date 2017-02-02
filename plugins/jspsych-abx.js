/**
 * jspsych-abx.js
 * Catherine Prévost
 *
 * This plugin create a trial where you see three picture and then have to press a button if the first one was the same as the last one, and an other button if it was the second one that was the same as the last one.
 *
 *
 */

jsPsych.plugins["abx"] = (function() {
	
	var plugin = {};
	  
	jsPsych.pluginAPI.registerPreload('abx', 'stimuli', 'image');
	
	plugin.trial = function(display_element, trial) {
		
		
		// default parameters
		trial.timing_stims = trial.timing_stims || 1000; // duration of the appearance of the three stimuli
		trial.timing_gap = trial.timing_gap || 500; // default 1000ms
		trial.timeout = trial.timeout || 3000 //how much time do the subject have to answer after the sound began to play before the trial ends. If -1 the trial won't end until the subject give an answer.
		trial.timeout_feedback = trial.timeout_message || "<p>Please respond faster</p>";
		trial.timeout_message_timing = trial.timeout_message_timing || 1000
		trial.choices = trial.choices || ['a','b'];			
		trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
		trial.key_first = (typeof trial.key_first === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_first) : trial.key_first;
		trial.key_second = (typeof trial.key_second === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_second) : trial.key_second;
		
		
		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
		

	    var rt_start_time;
	    var prefetched_data = {};
		
		/** showFixationCross()
		 *  fucntion that makes a fixation cross appear on the screen
		 *
		 */
	    function showFixationCross(){
	    	display_element.empty();
	    
	    	if(display_element.css("position")==="static"){
	    		display_element.css("position", "relative");
	    	}
		
	        var $paragraph = $('<p> + </p>');
	        
	        display_element.append($paragraph);
	        $paragraph.css({
	        	"font-size":"350%",
	        	"display": 'flex',
	        	"justify-content": "center", /* align horizontal */
	        	"align-items": "center" /* align vertical */
	    	    //"position":"absolute",
	    	    //"left": "50%"
	    	    //"top": "50%",
	    	    //"transform": "translate(-50%, -50%)"   
	        });
	        $paragraph.addClass('jspsych-genstim');
	    }
	    
		/** showImage(image_position_in_trial)
		 *  function that takes the position of the image in the trial (0,1,2) 
		 *  and append the appropriate stimuli on the screen
		 */
	    
	    function showImage(image_position_in_trial){
	        if(image_position_in_trial < 1){
	    	    if (!trial.is_html) {
	    	      display_element.append($('<img>', {
	    	        "src": trial.stimuli[image_position_in_trial],
	    	        "id": 'jspsych-sim-stim',
	    	        'class': 'jspsych-genstim',
	    	        'class': 'jspsych-abx-image'+image_position_in_trial
	    	      }));
	    	    } 
	    	    else {
	    	      display_element.append($('<div>', {
	    	        "html": trial.stimuli[image_position_in_trial],
	    	        "id": 'jspsych-sim-stim',
	    	        'class': 'jspsych-genstim',
	    	        'class': 'jspsych-abx-image'+image_position_in_trial
	    	      }));
	    	    }
	        }
	        else{
	        	if (!trial.is_html) {
	                $('#jspsych-sim-stim').attr({
	                	'src': trial.stimuli[image_position_in_trial],
	                	'class': 'jspsych-abx-image'+image_position_in_trial
	                });
	            } 
	        	else {
	                $('#jspsych-sim-stim').html(trial.stimuli[image_position_in_trial]);
	            }

                $('#jspsych-sim-stim').css({
            	    "align-self":'center',  
            	    visibility:'visible'  
              	});
	        }
    	    //stimuli has been shown, send first trigger
    	    if(jsPsych.pluginAPI.hardwareConnected){
    	    	jsPsych.pluginAPI.hardware({
    	    		target: 'parallel',
    	    		action: 'trigger',
    	    		payload: image_position_in_trial + 1
    	    	});
    	    }
	    }
	    
		/** after_response()
		 * function to prepare the data to be sent
		 * 
		 */
	    
	    
	    function after_response() {
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
	    
	    
	    
	    

		/** The actual trial
		 * 
		 * 
		 */
	    
	    
	    //show the fixation cross
		showFixationCross();
		//After the amount of time determined for the fixation cross
		
		setTimeout(function(){
			//take the fixation cross of the screen
	    	display_element.empty();
	    	//show the prompt
			if (trial.prompt !== "") {
				display_element.append(trial.prompt);
			}
	    	//Show A
	    	showImage(0);
	    	
	    	//after a customized number of time
	    	setTimeout(function(){
	    		//hide A
	    		$('#jspsych-sim-stim').css('visibility', 'hidden');
	    		
	    		setTimeout(function(){
		    		//show B
		    		showImage(1);
		    		
		    		//after a customized number of time
		    		setTimeout(function(){
		    			//hide B
			    		$('#jspsych-sim-stim').css('visibility', 'hidden');
			    		
			    		setTimeout(function(){
				    		//show X
				    		showImage(2);
				    		
				    		setTimeout(function(){
				    			//hide X
					    		$('#jspsych-sim-stim').css('visibility', 'hidden');
					    		//start the response time calculation
				    			rt_start_time = Date.now();
						    	// start the response listener
							    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
							      callback_function: after_response,
							      valid_responses: trial.choices,
							      persist: false,
							      allow_held_key: false,
							    });
							    
							    if (trial.timing_response > 0) {
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
							    						    
				    		},trial.timing_stims);
				    		
			    		}, trial.timing_gap);
			    		
			    	}, trial.timing_stims);
		    		
	    		}, trial.timing_gap)
	    		
	    	}, trial.timing_stims);
	    	
	    }, trial.timing_fixation_cross);		
		
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
				
		
	};	
	return plugin;	
});