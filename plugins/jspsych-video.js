/* jspsych-video.js
 * Josh de Leeuw
 *
 * This plugin displays a video. The trial ends when the video finishes.
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins.video = (function() {

  var plugin = {};

  plugin.info = {
    name: 'video',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Sources',
        array: true,
        default: undefined,
        description: 'The video file to play.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: undefined,
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: undefined,
        description: 'The height of the video display in pixels.'
      },
      autoplay: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Autoplay',
        default: true,
        description: 'If true, the video will begin playing as soon as it has loaded.'
      },
      controls: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Controls',
        default: false,
        description: 'If true, the subject will be able to pause the video or move the playback to any point in the video.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the video content.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      stop: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stop',
        default: null,
        description: 'Time to stop the clip.'
      }
    }
  }


    


  plugin.trial = function(display_element, trial) {

    // set default values for the parameters
    trial.prompt = trial.prompt || "";
    trial.autoplay = typeof trial.autoplay == 'undefined' ? true : trial.autoplay;
    trial.controls = typeof trial.controls == 'undefined' ? false : trial.controls;
    trial.choices = trial.choices || ["q", "p"];
    trial.hide_onend = (typeof trial.hide_onend == "undefined") ? true : false;
    trial.timing_feedback = trial.timing_feedback || 1000;
    trial.correct_text = trial.correct_text || "response recorded";
    trial.incorrect_text = trial.incorrect_text || "response recorded";

    
    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    
    // display stimulus
    var video_html = '<video id="jspsych-video-player" width="'+trial.width+'" height="'+trial.height+'" '
    if(trial.autoplay){
      video_html += "autoplay "
    }
    if(trial.controls){
      video_html +="controls "
    }
    video_html+=">"
    for(var i=0; i<trial.sources.length; i++){
      var s = trial.sources[i];
      if(s.indexOf('?') > -1){
        s = s.substring(0, s.indexOf('?'));
      }
      var type = s.substr(s.lastIndexOf('.') + 1);
      type = type.toLowerCase();

      // adding start stop parameters if specified
      video_html+='<source src="'+trial.sources[i]

      if (trial.start !== null) {
        video_html+= '#t=' + trial.start;
      } else {
        video_html+= '#t=0';
      }

      if (trial.stop !== null) {
        video_html+= ',' + trial.stop
      }

      video_html+='" type="video/'+type+'">';
    }
    video_html +="</video>"

    //show prompt if there is one
    if (trial.prompt !== null) {
      video_html += trial.prompt;
    }

    display_element.innerHTML = video_html;

    display_element.querySelector('#jspsych-video-player').onended = function(){
      jsPsych.pluginAPI.getKeyboardResponse({
    	callback_function : end_trial,
    	valid_responses: trial.choices
      });
      if(trial.hide_onend){
    	  this.style.display = "none";
      }
      //end_trial();
    }

    // event handler to set timeout to end trial if video is stopped
    display_element.querySelector('#jspsych-video-player').onplay = function(){
      if(trial.stop !== null){
        if(trial.start == null){
          trial.start = 0;
        }
        jsPsych.pluginAPI.setTimeout(end_trial, (trial.stop-trial.start)*1000);
      }
    }

    // function to end trial when it is time
    var end_trial = function(info) {

      // gather the data to store for the trial
      var trial_data = {
        stimulus: JSON.stringify(trial.sources),
        rt: info.rt,
        key_press: info.key
      };
      if(trial.key_answer){
    	 trial_data.correct = info.key === jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.key_answer); 
    	 
      }
      // clear the display
      display_element.innerHTML = '';
      
      if(trial.key_answer){
    	  //show feedback
    	  display_element.innerHTML = '<p class="jspsych-feedback jspsych-feedback-' + (trial_data.correct ? 'correct' : 'incorrect')+'"> '+(trial_data.correct? trial.correct_text : trial.incorrect_text) +'</p>';
    	  jsPsych.pluginAPI.setTimeout(function(){
    		  display_element.innerHTML = '';
    		  jsPsych.finishTrial(trial_data);
    	  }, trial.timing_feedback)
      }
      else{
    	// move on to the next trial
          jsPsych.finishTrial(trial_data);
      }

      
    };

  };

  return plugin;
})();
