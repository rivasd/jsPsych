jsPsych.plugins['visualnback'] = (function(){

  var plugin = {};

  plugin.trial = function(display_element, trial){
    jsPsych.finishTrial();
  }

  return plugin;

})();