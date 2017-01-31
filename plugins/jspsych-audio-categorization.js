/**
 * jspsych-audio-categorize
 * Catherine Prevost
 *
 * plugin for building a categorization task with audio stimuli
 *
 **/

jsPsych.plugins["audio-categorization"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-categorization', 'stimulus', 'audio');
  
  

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    trial.key_answer = trial.key_answer || jsPsych.pluginAPI.convertKeyCharacterToKeyCode('f'); // key associated to the category
    if(typeof trial.key_answer === "string"){
      trial.key_answer = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_answer);
    }
    
    trial.timing_feedback = trial.timing_feedback || 200; //duration of the appereance of the feedback (in ms)
    trial.timeout_feedback = trial.timeout_feedback || 'Answer faster!';
    trial.show_icon = trial.show_icon || false;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    
    var prefetched_data = {};
    var keyboardListener;
    var $speaker_icon = $('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255.797 255.797" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 255.797 255.797"><g><path d="m211.424,97.447h-8.701v-71.345c0.001-13.921-12.18-26.102-26.101-26.102-5.22,0-10.441,1.74-15.661,5.22l-83.143,67.865h-50.847c-5.22,0-8.701,3.48-8.701,8.701v92.226c0,5.22 3.48,8.701 8.701,8.701h50.846l83.143,67.865c3.48,3.48 10.441,5.22 15.661,5.22 13.921,0 26.102-12.181 26.102-24.362v-76.566h8.701c13.921,0 26.102-12.181 26.102-26.102v-5.22c2.84217e-14-13.92-12.18-26.101-26.102-26.101zm-140.95,67.864h-34.802v-74.825h34.802v74.825zm113.108,64.385c0,8.701-8.701,10.441-13.921,6.96l-81.786-67.865v-83.525l81.786-67.865c5.22-3.48 13.921-1.74 13.921,6.96v205.335zm36.543-100.927c0,5.22-3.48,8.701-8.701,8.701h-8.701v-22.621h8.701c5.22,0 8.701,3.48 8.701,8.701v5.219z"/></g></svg>');

    // play stimulus
    
    var context = jsPsych.pluginAPI.audioContext();
    var source = context.createBufferSource();
    source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
    source.connect(context.destination);
    var startTime = context.currentTime + 0.1;
    source.start(startTime);
    var rt_start_time = Date.now();


    // show prompt if there is one
    if (trial.prompt !== "") {
        display_element.append(trial.prompt);
    }
    if (trial.show_icon){
    	display_element.append($speaker_icon);
    }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    var end_trial = function(prefetched_data) {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      source.stop();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // gather the data to store for the trial
      var trial_data = {
        "rt": prefetched_data.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "result": prefetched_data.result
      };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {
      prefetched_data.rt = Date.now() - rt_start_time;
      jsPsych.pluginAPI.clearAllTimeouts();

      // only record the first response
      if (response.key == -1) {
        response = info;
      }
      if (info.key == trial.key_answer){
    	  var $correctFeedback = $('<p></p>', {id:'correctFeedback'});
    	  $correctFeedback.text(trial.correct_feedback);
    	  display_element.append($correctFeedback);
    	  prefetched_data.result = 'correct';
      }
      else {
    	  if (info.key)
    	  var $incorrectFeedback = $('<p></p>', {id:'incorrectFeedback'});
    	  $incorrectFeedback.text(trial.incorrect_feedback);
    	  display_element.append($incorrectFeedback);
    	  prefetched_data.result = 'incorrect';
      }
      
      jsPsych.pluginAPI.setTimeout(function() {
    	  end_trial(prefetched_data);
      }, trial.timing_feedback);   
    };
    source.onended = function(){
    		if (trial.show_icon){
    			$speaker_icon.remove();
    		}
    		  
    	      keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
    	      callback_function: after_response,
    	      valid_responses: trial.choices,
    	      rt_method: 'audio',
    	      persist: false,
    	      allow_held_key: false,
    	      audio_context: context,
    	      audio_context_start_time: startTime
    	    }); 
    	    // end trial if time limit is set
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
    	      	  
    	        }, trial.timing_response);
    	    }
    }


  };

  return plugin;
})();
