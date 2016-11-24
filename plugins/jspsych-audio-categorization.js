/**
 * jspsych-audio-categorize
 * Catherine Prevost
 *
 * plugin for building a categorization task with audio stimuli
 *
 **/

jsPsych.plugins["single-audio"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-categorize', 'stimulus', 'audio');

  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.choices = trial.choices || jsPsych.ALL_KEYS;
    trial.response_ends_trial = (typeof trial.response_ends_trial === 'undefined') ? true : trial.response_ends_trial;
    trial.trial_ends_after_audio = (typeof trial.trial_ends_after_audio === 'undefined') ? false : trial.trial_ends_after_audio;
    trial.timing_response = trial.timing_response || -1; // if -1, then wait for response forever
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    trial.key_answer = convertKeyCharacterToKeyCode(trial.key_answer) || convertKeyCharacterToKeyCode('f'); // key associated to the category
    trial.timing_feedback = trial.timing_feedback || 200; //duration of the appereance of the feedback (in ms)

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // play stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var source = context.createBufferSource();
    source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
    source.connect(context.destination);
    startTime = context.currentTime + 0.1;
    source.start(startTime);


    // show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      source.stop();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt * 1000,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
      if (response.key == -1) {
        response = info;
      }
      if (info.key == trial.key_answer){
    	  var $correctFeedback = $('<p >Correct</p>', {id:'correctFeedback'});
    	  display_element.append($correctFeedback);
      }
      else {
    	  if (info.key)
    	  var $incorrectFeedback = $('<p>Incorrect</p>', {id:'incorrectFeedback'});   	  
    	  display_element.append($incorrectFeedback);   	  
      }
      
      jsPsych.pluginAPI.setTimeout(function() {
    	  if (trial.response_ends_trial) {
    	        end_trial();
    	      }
        }, trial.timing_feedback);   
    };

    // start the response listener
    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
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
        end_trial();
      }, trial.timing_response);
    }

  };

  return plugin;
})();
