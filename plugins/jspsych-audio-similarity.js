/**
 * jspsych-audio-similarity.js
 * Catherine Prévost
 *
 * This plugin create a trial where two sounds are played sequentially, and the subject rates their similarity using a slider controlled with the mouse.
 *
 */

jsPsych.plugins["audio-similarity"] = (function() {

	  var plugin = {};
	  
	  jsPsych.pluginAPI.registerPreload('audio-similarity', 'stimuli', 'audio');
  
	  plugin.trial = function(display_element, trial){
	
		  //TODO: remove jQuery dependency
		  display_element = $(display_element);
			// default parameters
			trial.labels = (typeof trial.labels === 'undefined') ? ["Not at all similar", "Identical"] : trial.labels;
			trial.intervals = trial.intervals || 100;
			trial.show_ticks = (typeof trial.show_ticks === 'undefined') ? false : trial.show_ticks;
			
			
			trial.timing_first_stim = trial.timing_first_stim || 1000; // default 1000ms
			trial.timing_second_stim = trial.timing_second_stim || -1; // -1 = inf time; positive numbers = msec to display second image.
			trial.timing_gap = trial.timing_gap || 1000; // default 1000ms
			trial.timeout = trial.timeout || 3000 //amount of time the response slider will be showing
			trial.timeout_message = trial.timeout_message || "<p>Please respond faster</p>";
			trial.timeout_message_timing = trial.timeout_message_timing || 1000;
			if(trial.categories){
				trial.categories.forEach(function(category, idx){
					if(typeof category === "string"){
					    category = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(category);
					    }
				});	
			}
					
			trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
			
			// if any trial variables are functions
			// this evaluates the function and replaces
			// it with the output of the function
			trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			var context;
		    var source;
		    
		    trial.setTimeoutHandlers = [];
            //jouer son 1		   
		    playSound(0);
	    	if(trial.timing_first_stim > 0){
		    	setTimeout(function(){    		
		    		source.stop();
		    		setTimeout(function(){
		    			playSound(1);
			        	if(trial.timing_second_stim > 0){
				        	setTimeout(function(){
				        		source.stop();
				        		show_response_slider(display_element, trial);
				            }, trial.timing_second_stim);
			        	}
			        	else {
			        		source.onended = function(){
	    					show_response_slider(display_element, trial); 			        		
			        	    }
			        	}		    			
		    		}, trial.timing_gap);
		        	
		        }, trial.timing_first_stim);
	    	}
	    	else{
	    		source.onended = function(){
	    			setTimeout(function(){
	    				playSound(1);
	    				if(trial.timing_second_stim > 0){
		    				setTimeout(function(){
		    					source.stop();
				        		show_response_slider(display_element, trial);
				            }, trial.timing_second_stim);
		    			}
		    			else{
		    				source.onended = function(){
		    					show_response_slider(display_element, trial);
		    				} 				
		    			}
	    			}, trial.timing_gap);    			    			
	    		}
	    	}
	    	
	    	
	    	function playSound(soundOrder){
	        	context = jsPsych.pluginAPI.audioContext();
	    	    source = context.createBufferSource();
	    	    source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimuli[soundOrder]);
	    	    source.connect(context.destination);
	    	    startTime = context.currentTime + 0.1;
	    	    source.start(startTime);
	    	    
	    	  //send the correct stimulus presentation trigger if the chrome extension is active, you are not in a practice block and you have access to the category of the stimuli
	    	    if(jsPsych.pluginAPI.hardwareConnected && !trial.is_practice && !(typeof trial.categories[soundOrder] === 'undefined')){
	    	    	jsPsych.pluginAPI.hardware({
	    	    		target: 'parallel',
	    	    		action: 'trigger',
	    	    		payload: categories[soundOrder]
	    	    	});
	    	    }
	        };
			
	        function show_response_slider(display_element, trial) {

	            var startTime = (new Date()).getTime();

	            // create slider
	            display_element.append($('<div>', {
	              "id": 'slider',
	              "class": 'sim',
	              "align-self":'flex-end'
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
	                jsPsych.pluginAPI.clearAllTimeouts();
	                
	          	  endTrial({
	          		  rt: response_time,
	          		  sim_score: $("#slider").slider("value"),
	          		  firstStim: trial.stimuli[0],
	          		  secondStim: trial.stimuli[1]
	          	  });
	            });
	          }
	          
	        
	        function endTrial(data){
	            
	            // kill any remaining setTimeout handler
	    	        for (var i = 0; i < trial.setTimeoutHandlers.length; i++) {
	    	          clearTimeout(trial.setTimeoutHandlers[i]);
	    	        }
	            
	    	    data.timeout = false; //quick hack for something I need right now
	    	    if(data.sim_score === undefined){
	    	    	data.sim_score = 0;
	    	    	data.timeout = true;
	    	    }
	            
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
	  };
      return plugin;  
})();