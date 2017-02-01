/**
 * jspsych-abx.js
 * Catherine Prévost
 *
 * This plugin create a trial where you see three picture and then have to press a button if the first one was the same as the last one, and an other button if it was the second one that was the same as the last one.
 *
 *
 */

jsPsych.plugins["abx"] = (function() {
	
	var plugin = {};
	  
	jsPsych.pluginAPI.registerPreload('abx', 'stimuli', 'image');
	
	plugin.trial = function(display_element, trial) {
		
		
		// default parameters
		trial.timing_stims = trial.timing_stims || 1000; // duration of the appearance of the three stimuli
		trial.timing_gap = trial.timing_gap || 500; // default 1000ms
		trial.timeout = trial.timeout || 3000 //how much time do the subject have to answer after the sound began to play before the trial ends. If -1 the trial won't end until the subject give an answer.
		trial.timeout_feedback = trial.timeout_message || "<p>Please respond faster</p>";
		trial.timeout_message_timing = trial.timeout_message_timing || 1000
		trial.choices = trial.choices || ['a','b'];			
		trial.prompt = (typeof trial.prompt === 'undefined') ? '' : trial.prompt;
		
		
		trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
		
		
		
		
		
		
		
		
		
		
	};
	
	return plugin;
	
});