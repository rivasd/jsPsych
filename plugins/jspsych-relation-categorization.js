/**
 * jspsych-relation-categorization
 * Josh de Leeuw
 *
 * plugin for showing a pair of stimuli at the same time and recording a 'same' or 'different' response
 *
 * documentation: docs.jspsych.org
 *
 */

jsPsych.plugins['relation-categorization'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('relation-categorization', 'stimuli', 'image',function(t){ return !t.is_html || t.is_html == 'undefined'});



  plugin.trial = function(display_element, trial) {

    // default parameters
    trial.same_key = trial.same_key || 81; // default is 'q'
    trial.different_key = trial.different_key || 80; // default is 'p'
    trial.choices = [trial.same_key, trial.different_key]
    // timing parameters
    trial.timing_stims = trial.timing_stims || 1000; // if -1, the first stim is shown until any key is pressed
    trial.timing_after = trial.timing_after || 500;
    // optional parameters
    trial.is_html = (typeof trial.is_html === 'undefined') ? false : trial.is_html;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;
    
    trial.timeout_feedback = trial.timeout_feedback || 'too long!';
    trial.timeout = trial.timeout || -1;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    
    var display_element = $(display_element);
   
    
    /** showFixationCross()
	 *  function that makes a fixation cross appear on the screen
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
    
    function showImages(){
	    if (!trial.is_html) {
	      display_element.append($('<img>', {
	        "src": trial.stimuli[0],
	        "id": 'jspsych-relcat-stim1',
	        'class': 'jspsych-genstim',
	        'class': 'jspsych-relcat-image1'
	      }));
	      display_element.append($('<img>', {
  	        "src": trial.stimuli[1],
  	        "id": 'jspsych-relcat-stim2',
  	        'class': 'jspsych-genstim',
  	        'class': 'jspsych-relcat-image2'
  	      }));
	    } 
	    else {
	      display_element.append($('<div>', {
	        "html": trial.stimuli[0],
	        "id": 'jspsych-relcat-stim',
	        'class': 'jspsych-genstim',
	        'class': 'jspsych-relcat-image1'
	      }));
	      display_element.append($('<div>', {
		        "html": trial.stimuli[1],
		        "id": 'jspsych-relcat-stim',
		        'class': 'jspsych-genstim',
		        'class': 'jspsych-relcat-image2'
		  }));
	    
	    }
    }
    
    function acceptResponse(){
    	//start the response time calculation
    	if(! (typeof trial.prompt == 'undefined')){
    		display_element.append($(trial.prompt).attr("id", "jspsych-relcat-prompt"));
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
		    	  $("#jspsych-relcat-prompt").remove();
		    	  $("#jspsych-relcat-stim").remove();
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
    	//Show Stimuli
    	showImages();
   					    		
    		if(!trial.response_wait){
    			acceptResponse();
    		}
    		else{
    			jsPsych.pluginAPI.setTimeout(function(){
    				acceptResponse();
    			}, trial.timing_stims);
    		}
    	
    }, trial.timing_fixation_cross);
    

      var after_response = function(info) {

        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
        


        var correct = false;

        var skey = typeof trial.same_key == 'string' ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.same_key) : trial.same_key;
        var dkey = typeof trial.different_key == 'string' ? jsPsych.pluginAPI.convertKeyCharacterToKeyCode(trial.different_key) : trial.different_key;

        if (info.key == skey && trial.answer == 'same') {
          correct = true;
        }

        if (info.key == dkey && trial.answer == 'different') {
          correct = true;
        }

        var prefetched_data = {
          "rt": info.rt,
          "correct": correct,
          "key_press": info.key
        };

        display_element.html('');
        
        // kill keyboard listeners
        jsPsych.pluginAPI.cancelAllKeyboardResponses();

        end_trial(prefetched_data);
      }
      
      
      
 	 var end_trial = function(prefetched_data) {

         // gather the data to store for the trial
         var trial_data = {
           "rt": prefetched_data.rt,
           "answer": trial.answer,
           "key_press": prefetched_data.key_press,
           "correct": prefetched_data.correct
         };
       	  trial_data.A = trial.stimuli[0];
       	  trial_data.B = trial.stimuli[1];

         // move on to the next trial
         jsPsych.finishTrial(trial_data);
       };


  };

  return plugin;
})();
