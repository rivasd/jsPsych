jsPsych.plugins["rating"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('single-stim', 'stimulus', 'image');
  

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
    
    trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
    trial.intervals = trial.intervals || 100;
    trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];
    
    // display stimulus
    if (!trial.is_html) {
      display_element.append($('<img>', {
        src: trial.stimulus,
        id: 'jspsych-single-stim-stimulus'
      }));
    } else {
      display_element.append($('<div>', {
        html: trial.stimulus,
        id: 'jspsych-single-stim-stimulus'
      }));
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }
  
    show_response_slider(display_element, trial);
    
    function show_response_slider(display_element, trial) {

        var startTime = (new Date()).getTime();

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

        // if prompt is set, show prompt
        if (trial.prompt !== "") {
          display_element.append(trial.prompt);
        }  
        
        if(trial.timeout > 0){
      	  trial.setTimeoutHandlers.push(setTimeout(function(){
          	  endTrial({rt:-1});
            }, trial.timeout));
        }
        
        $("#next").click(function(){
      	  var endTime = (new Date()).getTime();
            var response_time = endTime - startTime;
      	  endTrial({
      		  rt: response_time,
      		  sim_score: $("#slider").slider("value")
      	  });
        });
     }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      //jsPsych.data.write(trial_data);

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      $("#jspsych-single-stim-stimulus").addClass('responded');

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (JSON.stringify(trial.choices) != JSON.stringify(["none"])) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // hide image if timing is set
    if (trial.timing_stim > 0) {
      var t1 = setTimeout(function() {
        $('#jspsych-single-stim-stimulus').css('visibility', 'hidden');
      }, trial.timing_stim);
      setTimeoutHandlers.push(t1);
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.timing_response);
      setTimeoutHandlers.push(t2);
    }

  };

  return plugin;
})();