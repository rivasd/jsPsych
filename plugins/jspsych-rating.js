
jsPsych.plugins["rating"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('rating', 'stimulus', 'image');
  
  //div that will contain all UI elements involved in getting a response from a subject. Useful to cache and quickly hide those elements
  plugin.response_element = $("<div>", {'class': 'jspsych-response', 'id': 'jspsych-rating-response'});
  plugin.active = false;
  
  plugin.show_response = function(display_element, trial){
	if(!plugin.active){
		display_element.append(plugin.response_element);
		if(trial.response === 'slider'){
			plugin.response_slider(display_element, trial);
		}
		else if(trial.response === 'boxes'){
			plugin.response_boxes(display_element, trial);
		}
		plugin.active = true;
	}
	plugin.response_element.show();
  };
  
  plugin.response_boxes = function(display_element, trial){
	  plugin.response_element.empty();
	  plugin.choices = $("<ul>", {'class': 'jspsych-choice-list'});
	  plugin.choices.css({
		 'list-style': 'none',
		 'margin': 'none'
	  });
	  
	  trial.choices.forEach(function(elt){
		  var option = $("<li>", {'class': 'jspsych-choice-item'});
		  option.css({
			  'display': 'inline-block',
			  'cursor': 'pointer',
			  'border': 'solid black',
			  'margin': '10px',
			  'padding': '5px',
			  'width' : '20px',
			  'height': '20px',
			  'text-align': 'center'
		  });
		  option.text(elt);
		  plugin.choices.append(option);
	  });
	  
	  plugin.response_element.append(plugin.choices);
	  
	  
  };
  
  plugin.response_slider = function (display_element, trial) {
	  
	  plugin.response_element.empty();
	  
      // create slider
      plugin.slider = $('<div>', {
        "id": 'slider',
        "class": 'sim'
      });
      
      plugin.response_element.append(plugin.slider);

      $("#slider").slider({
        value: Math.ceil(trial.intervals[1] / 2),
        min: trial.intervals[0],
        max: trial.intervals[1],
        step: 1,
      });

      // show tick marks
      if (trial.show_ticks) {
        for (var j = 1; j < trial.intervals - 1; j++) {
          $('#slider').append('<div class="slidertickmark"></div>');
        }

        $('#slider .slidertickmark').each(function(index) {
          var left = (index + 1) * (100 / (trial.intervals - 1));
          $(this).css({
            'position': 'absolute',
            'left': left + '%',
            'width': '1px',
            'height': '100%',
            'background-color': '#222222'
          });
        });
      }

      // create labels for slider
      plugin.response_element.append($('<ul>', {
        "id": "sliderlabels",
        "class": 'sliderlabels',
        "css": {
          "width": "100%",
          "height": "3em",
          "margin": "10px 0px 0px 0px",
          "padding": "0px",
          "display": "block",
          "position": "relative"
        }
      }));

      for (var j = 0; j < trial.labels.length; j++) {
        $("#sliderlabels").append('<li>' + trial.labels[j] + '</li>');
      }

      // position labels to match slider intervals
      var slider_width = $("#slider").width();
      var num_items = trial.labels.length;
      var item_width = slider_width / num_items;
      var spacing_interval = slider_width / (num_items - 1);

      $("#sliderlabels li").each(function(index) {
        $(this).css({
          'display': 'inline-block',
          'width': item_width + 'px',
          'margin': '0px',
          'padding': '0px',
          'text-align': 'center',
          'position': 'absolute',
          'left': (spacing_interval * index) - (item_width / 2)
        });
      });

      //  create button
      plugin.response_element.append($('<button>', {
        'id': 'next',
        'class': 'sim',
        'html': 'Submit Answer'
      }));
   }
  
   plugin.endTrial = function(data, trial, display_element) {

       // kill any remaining setTimeout handler
       for (var i = 0; i < trial.setTimeoutHandlers.length; i++) {
    	   clearTimeout(trial.setTimeoutHandlers[i]);
       }
   
	   data.timeout = false; //quick hack for something I need right now
	   if(data.rating === undefined){
		   data.rating = null;
		   data.timeout = true;
	   }
	   
	   
	   
	   data.stimulus = trial.stim_name || trial.stimulus;
	   
	   // goto next trial in block
	   plugin.response_element.hide();
	   $("#jspsych-single-stim-stimulus").remove();
	   if(plugin.prompt) plugin.prompt.remove();
	   plugin.stim.remove();
	   
	   //remove previous event handlers
	   if(trial.response === 'slider'){
		   $("#next").off('click');
	   }
	   else if(trial.response === 'boxes'){
		   $("li.jspsych-choice-item").off('click');
	   }
	   
	   
	   if(data.rt === -1){
	   	//this was a timeout
		   	display_element.append(trial.timeout_message);
		   	trial.setTimeoutHandlers.push(setTimeout(function(){
		   		//display_element.empty();
		   		jsPsych.finishTrial(data);
		   	},trial.timeout_message_timing))
	   }
	   else{
		   jsPsych.finishTrial(data);
	   }
    };
  

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set default values for the parameters
    trial.choices = trial.choices || [];
    trial.response_ends_trial = (typeof trial.response_ends_trial == 'undefined') ? true : trial.response_ends_trial;
    trial.timing_response = trial.timing_response || -1;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt = trial.prompt || "";
    
    trial.labels = (typeof trial.labels === 'undefined') ? ["Hate", "Love"] : trial.labels;
    trial.intervals = trial.intervals || [-3,3];
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;
    trial.return_stim = trial.return_stim || true;
    trial.response = trial.response || 'slider'; //type of response you give (slider or boxes)
    
    
    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    trial.setTimeoutHandlers = [];
    
    //Show the stimulus
    if (!trial.is_html) {
    	plugin.stim = $('<img>', {src: trial.stimulus, 'class': 'jspsych-single-stim-stimulus'});
    	display_element.prepend(plugin.stim);
	} 
    else {
    	plugin.stim = $('<div>', {
	        html: trial.stimulus,
	        'class': 'jspsych-single-stim-stimulus'
	      });
    	display_element.prepend(plugin.stim);
	}
    
    // show the slider
    plugin.show_response(display_element, trial);
    
    var startTime = (new Date()).getTime();
    
    //show the prompt
    if (trial.prompt !== "") {
    	plugin.prompt = $("<p>", {'class': 'jspsych-prompt'});
    	plugin.prompt.text(trial.prompt)
        display_element.append(plugin.prompt);
    }
    
    //if there is a timeout, schedule the trial end    
    if(trial.timeout > 0){
    	trial.setTimeoutHandlers.push(setTimeout(function(){
    		plugin.endTrial({rt:-1}, trial, display_element);
        }, trial.timeout));
    }
    // wait for a response    
    
    	if(trial.response === 'slider'){
        	//TODO: attach listener only once!
        	$("#next").click(function(){
    	  	  var endTime = (new Date()).getTime();
    	        var response_time = endTime - startTime;
    	  	  plugin.endTrial({
    	  		  rt: response_time,
    	  		  rating: $("#slider").slider("value")
    	  	 }, trial, display_element)
        	 });
        }else if(trial.response === 'boxes'){
        	$("li.jspsych-choice-item").click(function(evt){
        		var endTime = (new Date()).getTime();
    	        var response_time = endTime - startTime;
    	  	  	plugin.endTrial({
    	  		  rt: response_time,
    	  		  rating: $(this).text()
    	  	  	}, trial, display_element)
        	 });
        };
    
    
  };
  
  return plugin;
})()