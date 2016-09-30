jsPsych.plugins["rating"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('single-stim', 'stimulus', 'image');
  

  plugin.show_response_slider = function (display_element, trial) {


      // create slider
      display_element.append($('<div>', {
        "id": 'slider',
        "class": 'sim'
      }));

      $("#slider").slider({
        value: Math.ceil(trial.intervals / 2),
        min: 1,
        max: trial.intervals,
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
      display_element.append($('<ul>', {
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
      display_element.append($('<button>', {
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
	   display_element.html('');
	   
	   if(data.rt === -1){
	   	//this was a timeout
		   	display_element.append(trial.timeout_message);
		   	trial.setTimeoutHandlers.push(setTimeout(function(){
		   		display_element.empty();
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
    trial.timing_stim = trial.timing_stim || -1;
    trial.timing_response = trial.timing_response || -1;
    trial.is_html = (typeof trial.is_html == 'undefined') ? false : trial.is_html;
    trial.prompt = trial.prompt || "";
    
    trial.labels = (typeof trial.labels === 'undefined') ? ["Hate", "Love"] : trial.labels;
    trial.intervals = trial.intervals || 7;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;
    trial.return_stim = trial.return_stim || true;

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    trial.setTimeoutHandlers = [];
    
    //Show the stimulus
    if (!trial.is_html) {
    	display_element.append($('<img>', {
    		src: trial.stimulus,
	        id: 'jspsych-single-stim-stimulus'
	    	}));
	    } 
    else {
	      display_element.append($('<div>', {
	        html: trial.stimulus,
	        id: 'jspsych-single-stim-stimulus'
	      }));
	}
    
    // show the slider
    plugin.show_response_slider(display_element, trial);
    
    var startTime = (new Date()).getTime();
    
    //show the prompt
    if (trial.prompt !== "") {
          display_element.append(trial.prompt);
        }  
    //if there is a timeout, schedule the trial end    
    if(trial.timeout > 0){
    	trial.setTimeoutHandlers.push(setTimeout(function(){
    		plugin.endTrial({rt:-1}, trial, display_element);
        }, trial.timeout));
    }
    // wait for a response    
    $("#next").click(function(){
  	  var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;
  	  plugin.endTrial({
  		  rt: response_time,
  		  rating: $("#slider").slider("value")
  	 }, trial, display_element)
    });
  };
  
  return plugin;
})();