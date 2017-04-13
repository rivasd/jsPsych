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
        type: [jsPsych.plugins.parameterType.STRING],
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      width: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        no_function: false,
        description: ''
      },
      height: {
        type: [jsPsych.plugins.parameterType.INT],
        default: undefined,
        no_function: false,
        description: ''
      },
      autoplay: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: true,
        no_function: false,
        description: ''
      },
      controls: {
        type: [jsPsych.plugins.parameterType.BOOL],
        default: false,
        no_function: false,
        description: ''
      },
      prompt: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
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
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

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
      var type = s.substr(s.lastIndexOf('.') + 1);
      type = type.toLowerCase();
      video_html+='<source src="'+s+'" type="video/'+type+'">';
    }
    video_html +="</video>"

    display_element.innerHTML += video_html;

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

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
    	  display_element.innerHTML = '<p class="jspsych-feedback jspsych-feedback-' + trial_data.correct ? 'correct' : 'incorrect'+'"> '+trial_data.correct? trial.correct_text : trial.incorrect_text +'</p>';
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
