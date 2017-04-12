# jspsych-audio-categorization

This plugin is similar to the [jspsych-categorize](https://github.com/rivasd/jsPsych/edit/UQAM/docs/markdown_docs/plugins/jspsych-categorize.md) plugin, but tailored for audio stimuli. **Note that you cannot use audio stimuli served from the filsystem**, audio files must be provided by some sort of server.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimulus | string | *undefined* | The URL to the audio file to be played.
key_answer | numeric | *undefined* | The [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) indicating the correct response.
choices | array of keycodes | `jsPsych.ALL_KEYS` | This array contains the keys that the subject is allowed to press in order to respond to the stimulus. Keys can be specified as their [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) or as characters (e.g. `'a'`, `'q'`). The default value of `jsPsych.ALL_KEYS` means that all keys will be accepted as valid responses. Specifying `jsPsych.NO_KEYS` will mean that no responses are allowed.
text_answer | string | "" | A label that is associated with the correct answer. Used in conjunction with the `correct_text` and `incorrect_text` parameters.
correct_text | string | "Correct." | String to show when the correct answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
incorrect_text | string | "Wrong." | String to show when the wrong answer is given. Can contain HTML formatting. The special string `%ANS%` can be used within the string. If present, the plugin will put the `text_answer` for the trial in place of the %ANS% string (see example below).
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_feedback_duration | numeric | 2000 | How long to show the feedback for (milliseconds).
timing_response | numeric | -1 | The maximum time allowed for a response. If -1, then the experiment will wait indefinitely for a response.
timeout_feedback | string | "Answer faster" | The message to be displayed if the participant does not respond before the timeout.
show_icon | boolean | false | `true` if you wish to display a speaker icon during the playback of the sound.
forced_listening | boolean | `false` | `true` if you want to wait after sound end before subjects can reponse.


## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
stimulus | string | The URL of the audio file the subject heard on this trial.
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the stimulus first appears on the screen until the subject's response.
correct | boolean | `true` if the subject got the correct answer, `false` otherwise.

## Examples

#### Categorizing HTML content

```javascript
var audiocateorization_trial = {
    type: 'audio-categorization',
    stimulus: '/media/music/chopin.mp3',
    key_answer: 80
    choices: [80, 81],
    correct_text: "Correct",
    incorrect_text: "Incorrect"
    prompt: "Press P for Chopin. Press Q for Mozart."
};
```
