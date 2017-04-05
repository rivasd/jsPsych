/**
 * jspsych-abx.js
 * Catherine Prévost
 *
 * This plugin create a trial where you see three picture and then have to press a button if the first one was the same as the last one, and an other button if it was the second one that was the same as the last one.
 *
 *
 */

jsPsych.plugins.abx = (function() {
	
	var plugin = {};
	  
	jsPsych.pluginAPI.registerPreload('abx', 'stimuli', 'image');
	
	plugin.trial = function(display_element, trial) {
		
		
		//TODO: remove jQuery dependency
		display_element = $(display_element);
		
		// default parameters
		trial.timing_stims = trial.timing_stims || 1000; // duration of the appearance of the three stimuli
		trial.timing_gap = trial.timing_gap || 500; // default 1000ms
		trial.timeout = trial.timeout || 3000 //how much time do the subject have to answer after the sound began to play before the trial ends. If -1 the trial won't end until the subject give an answer.
		trial.timeout_feedback = trial.timeout_feedback || "Please respond faster";
		trial.timeout_message_timing = trial.timeout_message_timing || 1000
		trial.choices = trial.choices || ['a','b'];
		trial.choices = trial.choices.map(function(el){
			if(typeof el === "string"){
				return jsPsych.pluginAPI.convertKeyCharacterToKeyCode(el);
			}
			else return el;
		})
		
		
		trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
		trial.key_first = (typeof trial.key_first === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_first) : trial.key_first;
		trial.key_second = (typeof trial.key_second === 'string') ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_second) : trial.key_second;
		trial.timing_fixation_cross = trial.timing_fixation_cross || 1500;
		trial.prompt_position = trial.prompt_position || 1;
		trial.response_wait = (typeof trial.response_wait == "undefined") ? false : trial.response_wait;
		trial.return_stim = (typeof trial.return_stim == 'undefined') ? true : trial.return_stim;
		
		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
		

	    var rt_start_time;
	    var prefetched_data = {};
	    
	    // store response
	    var response = {
	      rt: -1,
	      key: -1
	    };
		
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
		 *  BRAVO CATHERINE!!
		 */
	    
	    function showImage(image_position_in_trial){
	        if(image_position_in_trial < 1){
	    	    if (!trial.is_html) {
	    	      display_element.append($('<img>', {
	    	        "src": trial.stimuli[image_position_in_trial],
	    	        "id": 'jspsych-abx-stim',
	    	        'class': 'jspsych-genstim',
	    	        'class': 'jspsych-abx-image'+image_position_in_trial
	    	      }));
	    	    } 
	    	    else {
	    	      display_element.append($('<div>', {
	    	        "html": trial.stimuli[image_position_in_trial],
	    	        "id": 'jspsych-abx-stim',
	    	        'class': 'jspsych-genstim',
	    	        'class': 'jspsych-abx-image'+image_position_in_trial
	    	      }));
	    	    }
	        }
	        else{
	        	if (!trial.is_html) {
	                $('#jspsych-abx-stim').attr({
	                	'src': trial.stimuli[image_position_in_trial],
	                	'class': 'jspsych-abx-image'+image_position_in_trial
	                });
	            } 
	        	else {
	                $('#jspsych-abx-stim').html(trial.stimuli[image_position_in_trial]);
	            }

                $('#jspsych-abx-stim').css({
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
	        
	        prefetched_data.correct = (function evaluate_correctness(){
	        	if ((trial.stimuli[0] === trial.stimuli[2] && response.key == trial.choices[0]) || (trial.stimuli[1] === trial.stimuli[2] && response.key == trial.choices[1])){
			      	   return true;
			    }
			    else {
			      	  return false;
	            }		        
	        })()	
	      	end_trial(prefetched_data);
	      };    

		/** The actual trial
		 * 
		 * 
		 */
	    
	      
	    function acceptResponse(){
	    	//start the response time calculation
	    	if(! (typeof trial.prompt == 'undefined')){
	    		display_element.append($(trial.prompt).attr("id", "jspsych-abx-prompt"));
	    	}
	    	
			rt_start_time = Date.now();
	    	// start the response listener
		    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
		      callback_function: after_response,
		      valid_responses: trial.choices,
		      persist: false,
		      allow_held_key: false,
		    });
		    
		    //start calculating the timeout
		    if (trial.timeout > 0) {
			      jsPsych.pluginAPI.setTimeout(function() {
			    	  jsPsych.pluginAPI.cancelAllKeyboardResponses();
			    	  var $timeoutFeedback = $('<p></p>', {id:'timeoutFeedback'});
			    	  $timeoutFeedback.text(trial.timeout_feedback);
			    	  $("#jspsych-abx-prompt").remove();
			    	  $("#jspsych-abx-stim").remove();
			    	  display_element.append($timeoutFeedback);
			    	  prefetched_data.correct = false;
			    	  prefetched_data.rt = -1;
			    	  
			    	  jsPsych.pluginAPI.setTimeout(function() {
			    		  jsPsych.pluginAPI.clearAllTimeouts();
			  	          display_element.empty();
			        	  end_trial(prefetched_data);
			          }, trial.timing_feedback); 
				
			      },trial.timeout);
			};
	    }
	      
	    
	    //show the fixation cross
		showFixationCross();
		//After the amount of time determined for the fixation cross
		
		jsPsych.pluginAPI.setTimeout(function(){
			//take the fixation cross of the screen
	    	display_element.empty();
	    	//Show A
	    	showImage(0);
	    	
	    	//after a customized number of time
	    	jsPsych.pluginAPI.setTimeout(function(){
	    		//hide A
	    		$('#jspsych-abx-stim').css('visibility', 'hidden');
	    		
	    		jsPsych.pluginAPI.setTimeout(function(){
		    		//show B
		    		showImage(1);
		    		
		    		//after a customized number of time
		    		jsPsych.pluginAPI.setTimeout(function(){
		    			//hide B
			    		$('#jspsych-abx-stim').css('visibility', 'hidden');
			    		
			    		jsPsych.pluginAPI.setTimeout(function(){
				    		//show X
				    		showImage(2);
				    		
				    		if(!trial.response_wait){
				    			acceptResponse();
				    		}
<<<<<<< HEAD
				    		
				    		
				    		setTimeout(function(){
				    			//hide X
					    		$('#jspsych-sim-stim').css('visibility', 'hidden');
					    		//show the prompt if the researcher want it to be at this time in the trial
								if (trial.prompt !== "" && trial.prompt_position === 2) {
									display_element.append(trial.prompt);
								}
					    		//start the response time calculation
				    			rt_start_time = Date.now();
						    	// start the response listener
							    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
							      callback_function: after_response,
							      valid_responses: trial.choices,
							      persist: false,
							      allow_held_key: false,
							    });
							    //start calculating the timeout
							    if (trial.timeout > 0) {
								      jsPsych.pluginAPI.setTimeout(function() {
								    	  jsPsych.pluginAPI.cancelAllKeyboardResponses();
								    	  var $timeoutFeedback = $('<p></p>', {id:'timeoutFeedback'});
								    	  $timeoutFeedback.text(trial.timeout_feedback);
								    	  display_element.append($timeoutFeedback);
								    	  prefetched_data.correct = false;
								    	  prefetched_data.rt = -1;
								    	  
								    	  jsPsych.pluginAPI.setTimeout(function() {
								    		  jsPsych.pluginAPI.clearAllTimeouts();
								  	          display_element.empty();
								        	  end_trial(prefetched_data);
								          }, trial.timing_feedback); 
									
								  },trial.timeout);};
					    		if(trial.response_wait){
					    			acceptResponse();
					    		}
							    						    
				    		},trial.timing_stims);
=======
				    		else{
				    			jsPsych.pluginAPI.setTimeout(function(){
				    				acceptResponse();
				    			}, trial.timing_stims);
				    		}
>>>>>>> branch 'UQAM' of https://github.com/rivasd/jsPsych
				    		
			    		}, trial.timing_gap);
			    		
			    	}, trial.timing_stims);
		    		
	    		}, trial.timing_gap)
	    		
	    	}, trial.timing_stims);
	    	
	    }, trial.timing_fixation_cross);
		
		/** end_trial(prefetched_data)
		 * function to clear the screen and end the trial
		 * 
		 */	
		
	 var end_trial = function(prefetched_data) {

          // kill any remaining setTimeout handlers
          jsPsych.pluginAPI.clearAllTimeouts();


          // kill keyboard listeners
          jsPsych.pluginAPI.cancelAllKeyboardResponses();

          // gather the data to store for the trial
          var trial_data = {
            "rt": prefetched_data.rt,
            "key_press": response.key,
            "correct": prefetched_data.correct
          };
          if(trial.return_stim){
        	  trial_data.A = trial.stimuli[0];
        	  trial_data.B = trial.stimuli[1];
        	  trial_data.X = trial.stimuli[2];
          }
          // clear the display
          display_element.html('');

          // move on to the next trial
          jsPsych.finishTrial(trial_data);
        };	
				
		
	};	
	return plugin;	
})();