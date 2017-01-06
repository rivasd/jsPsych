/**
 * Plugin implementing a forced choice paradigm where a user is presented with 2 stimuli simultaneously and must click on either one
 * @author Daniel Rivas
 */

jsPsych.plugins["forcedchoice"] = (function() {

  var plugin = {};
  
  
  plugin.showRow = function(display_element, items){
	  var flexCont = $("<div>", {id: 'jspsych-forcedchoice-row','class': 'jspsych-row'});
	  flexCont.css({
		  'margin': '0 auto',
		  'justify-content': 'center',
		  'align-items': 'center',
		  'width': '100%',
		  'display': 'flex'
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
	  data.chosen = data.chosen_idx;
	  data.first = trial.stimuli[0];
	  data.last = trial.stimuli[trial.stimuli.length-1];
	  
	  jsPsych.finishTrial(data);
  };
  
  plugin.trial = function(display_element, trial) {

    // set default values for parameters
    trial.is_html = trial.is_html || false;
    trial.timing_stim = trial.timing_stim || 1000;
    trial.timing_fixation = trial.timing_fixation || 500;
    trial.prompt = trial.prompt || "Choose one of the images";
    trial.keyboard = trial.keyboard || false; //tells if the participant has to click on the chosen stimulus or press a key associated to it
    trial.key_choices = trial.key_choices || ['a','l'];

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
    	display_element.prepend($('<span class="jspsych-prompt">' + trial.prompt + "</span>"));
    	
    	var choices = [];
    	var sending_data = {};
    	
    	//if the participant has to answer by pressing a key associated with the chosen stimulus
    	if(trial.keyboard){
    		
    		var coded_keychoices = [];
    		
    		trial.key_choices.forEach(function(key_label){
    			var key_code = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(key_label);
    			coded_keychoices.push(key_code);
    		});
    		
    		trial.stimuli.forEach(function(elt, idx, array) {
        		var stimImage;
        		var stimSpace = $("<div>", {'class' : 'jspsych-forcedchoice-stimHandler'});
        		
        		if(!trial.is_html){
        			stimImage = $("<img>", {'src':elt, 'class': 'jspsych-forcedchoice-stim'});
        		}
        		else{
        			stimImage = $(elt).addClass('jspsych-forcedchoice-stim');
        		}
        		var stimKeyLabel = $("<span>");
        		
        		if(trial.key_choices[idx]){
        			stimKeyLabel.text(trial.key_choices[idx]);	
        		}
        		
        		stimSpace.append(stimImage);
        		stimSpace.append(stimKeyLabel);
        		
        		
        		choices.push(stimSpace);
        	});
    		
    		jsPsych.pluginAPI.getKeyboardResponse({	
    			'callback_function': function(data) {
	        			//end of the trial, clear all pending setTimeouts
	        			setTimeoutHandlers.forEach(function(elt, i, array) {
	        				clearTimeout(elt);
	        			});
	        			
	        			setTimeoutHandlers = [];
	        			
	        			sending_data.chosen_idx = (function(){
	        				for(var j=0; j < coded_keychoices.length; j++){
	        					if(data.key == coded_keychoices[j]){
	        						return j;
	        					}
	        				};
	        			})();
	        			display_element.empty();
	        			
	        			plugin.end(trial, display_element, sending_data);
    				}, 
    			'valid_responses': coded_keychoices,
    			'persist': false
    		});	
    		
    	}
    	
    	//if the participant has to answer by clicking on the stimuli
    	else{
    		
    		trial.stimuli.forEach(function(elt, idx, array) {
        		var stimImage;
        		if(!trial.is_html){
        			stimImage = $("<img>", {'src':elt, 'class': 'jspsych-forcedchoice-stim'});
        		}
        		else{
        			stimImage = $(elt).addClass('jspsych-forcedchoice-stim');
        		}
        		
        		
        		stimImage.on('click', function(evt) {
        			//end of the trial, clear all pending setTimeouts
        			setTimeoutHandlers.forEach(function(elt, i, array) {
        				clearTimeout(elt);
        			});
        			setTimeoutHandlers = [];
        			
        			sending_data.chosen_idx = idx;
        			display_element.empty();
        			plugin.end(trial, display_element, sending_data);
        		});
        		stimImage.css("cursor", "pointer");
        		choices.push(stimImage);
        	});
    	}
    	
    	plugin.showRow(display_element, choices, sending_data);
    	sending_data.startTime = Date.now();  	
    	
    }, trial.timing_fixation));
  };

  return plugin;
})();