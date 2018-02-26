/**
 * jspsych-cloze plugin
 * @author Daniel Rivas
 *
 * Plugin to implement a [cloze test]{@link https://en.wikipedia.org/wiki/Cloze_test}, a reading comprehension task where a text is presented with
 * certain words removed. In their place, a selection box with multiple choice is inserted. The participant must select the correct word that completes the text.
 *
 * documentation: soon...
 *
 */

jsPsych.plugins['cloze'] = (function(){

  var plugin = {};

  plugin.info = {
	name: 'cloze',
	description: 'Implements a cloze test, showing a text with some words removed and replaced with a select box.',
	parameters:{
		text:{
			type:[jsPsych.plugins.parameterType.STRING],
			default: undefined,
			no_function: false,
			description: ''
		},
		prompt:{
			type: [jsPsych.plugins.parameterType.STRING],
	        default: '',
	        no_function: false,
	        description: ''
		},
		submit_text:{
			default: "Submit Answers",
			no_function : false,
			type:[jsPsych.plugins.parameterType.STRING]

		},
	}
  }

  plugin.questionRegex = /\$\{\s*(.*?)\s*\}/g; //magic!


  plugin.trial = function(display_element, trial){

	//trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
	trial.button_label = trial.button_label || "Submit Answers";


	var replacementCount = 0;
	var ansKey = [];
	var startTime;

	function replacer(match, p1, offset, string){ //see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
	  var injectedString = '<span><select class="jspsych-cloze-question" id="jspsych-cloze-question-'+replacementCount+'" required=true><option default=true></option>';
	  var hasCorrect = false;

	  p1.split('~').forEach(function(option){
		  var content = option;

		  if(content.startsWith("=")){
			  content = content.substr(1);
			  ansKey.push(content);
			  hasCorrect = true;
		  }

		  injectedString += '<option>'+content+'</option>';
	  });

	  if(!hasCorrect){
		  ansKey.push(null);
	  }

	  injectedString += "</select></span>";
	  replacementCount++;
	  return injectedString;
	};

	function collect(evt){
		submit_btn.removeEventListener('click', collect);
		evt.preventDefault();

		var results = [];
		var totalScore = 0;

		document.querySelectorAll(".jspsych-cloze-question").forEach(function(question, idx){
			var givenAns = question.options[question.selectedIndex].value;
			results.push(givenAns);
			if(ansKey[idx] !== null && ansKey[idx] === givenAns){
				totalScore++;
			}
		})


		var data = {
			rt: Date.now() - startTime,
			answers : JSON.stringify(results),
			score: totalScore
		};
		content.remove();
		jsPsych.finishTrial(data);
	};

	//create the cloze text with <select> elements and everything
	var renderedContent = trial.text.replace(plugin.questionRegex, replacer);
	var content = document.createElement("div");
	content.innerHTML = renderedContent+'<br/>';
	content.className = "jspsych-cloze-stimulus";

	//create the submit button
	var submit_btn = document.createElement("button");
	submit_btn.className = "jspsych-cloze-submit";
	submit_btn.id = "jspsych-cloze-submit";
	submit_btn.textContent = trial.button_label;
	content.appendChild(submit_btn);


	//show the modified text
	display_element.appendChild(content);
	//start listening for the submit button press
	submit_btn.addEventListener("click", collect)
	startTime = Date.now();



  }

  return plugin;

})();
