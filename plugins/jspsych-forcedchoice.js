/**
 * Plugin implementing a forced choice paradigm where a user is presented with 2 stimuli simultaneously and must click on either one
 * @author Daniel Rivas
 */

jsPsych.plugins["forcedchoice"] = (function() {

  var plugin = {};
  
  
  plugin.showRow = function(display_element, items){
	  var flexCont = $("<div>", {id: 'jspsych-forcedchoiceStim','class': 'jspsych-row', display:'flex'});
	  flexCont.css({
		  'margin': '0 auto',
		  'justify-content': 'center',
		  'align-items': 'center',
		  'width': '100%'
	  });
	  
	  items.forEach(function(elem, id, arr){
		  flexCont.append(elem);
	  });
	  
	  display_element.append(flexCont);
  }
  
  plugin.showFixation = function(display_element){
    	if(display_element.css("position")==="static"){
    		display_element.css("position", "relative");
    	}
    	
        var $paragraph = $("<p>+</p>", {'id':'jspsych-fixationCross'});
        display_element.append($paragraph);
        $paragraph.css({
        	"font-size":"350%",
    	    "position":"absolute",
    	    "left": "50%",
    	    "top": "50%",
    	    "transform": "translate(-50%, -50%)"   
        });  	
  }
  
  plugin.end = function(trial, display_el, data){
	  
	  data.rt = Date.now() - data.startTime;
	  delete data.startTime;
	  data.chosen = trial.stimuli[data.chosen_idx];
	  
	  jsPsych.finishTrial(data);
  };
  
  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trials.is_html = trial.is_html || false;
    trial.timing_stim = trial.timing_stim || 1000;
    trial.timing_fixation = trial.timing_fixation || 500;
    trial.prompt = trial.prompt || "Click on one of the images";
    

    // allow variables as functions
    // this allows any trial variable to be specified as a function
    // that will be evaluated when the trial runs. this allows users
    // to dynamically adjust the contents of a trial as a result
    // of other trials, among other uses. you can leave this out,
    // but in general it should be included
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
    var setTimeoutHandlers = [];
    
    // Trial execution
    plugin.showFixation(display_element);
    setTimeoutHandlers.push(setTimeout(function(){
    	display_element.empty();
    	display_element.append($("<span>" + trial.prompt + "</span>", {'class': "jspsych-prompt"}));
    	
    	var choices = [];
    	var data= {};

		trial.stimuli.forEach(function(elt, i, array) {
    		var stimImage;
    		if(!trial.is_html){
    			stimImage = $("<img>", {'src':elt, 'class': 'jspsych-forcedchoiceStim'});
    		}
    		else{
    			stimImage = $(elt);
    		}
    		
    		stimImage.on('click', function(evt) {
    			//end of the trial, clear all pending setTimeouts
    			setTimeoutHandlers.forEach(function(elt, i, array) {
    				clearTimeout(elt);
    			});
    			setTimeoutHandlers = [];
    			
    			data.chosen_idx = i;
    			display_element.empty();
    			plugin.end(trial, display_element, data);
    		});
    		choices.push(stimImage);
    	});

    	plugin.showRow(display_element, choices);
    	data.startTime = Date.now();
    	
    }, trial.timing_fixation));
  };

  return plugin;
})();