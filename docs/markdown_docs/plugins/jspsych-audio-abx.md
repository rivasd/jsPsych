# jspsych-audio-abx plugin

In the audio-abx plugin, three sounds are played and the subject have to press one of two keys to choose if it was the first or the second sound that was the same as the third.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Array of three sounds (mp3, wav, etc.). They will be heard in this order : [A,B,X]. The sounds cannot be served from the file system, they need to be hosted in a server. 
key_first | numeric or string | *undefined* | Which key the subject should press to indicate that the target is the first sound.
key_second | numeric or string | *undefined* | Which key the subject should press to indicate that the target is the second sound.
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_gap | numeric | 500 | How long to wait between each sound in milliseconds.
timing_ab | numeric | -1 | How long to show A and B in milliseconds. If the value of this parameter is -1, then the stimuli will remain on the screen until a response is given.
timeout | numeric | -1 | The maximum duration to wait for a response in milliseconds, measured from the end of the third sound. If -1, then the trial will wait indefinitely for a response.
timeout_feedback | string | "Please respond faster" | A message to indicate to the participant that the time left to answer ran out. Will be shown only if a timeout is set.
timing_feedback | numeric | 1000 | How long to show the timeout feedback for in milliseconds.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
A | string | The sound presented in first
B | string | The sound presented in second
X | string | The sound presented in last (the target).
key_press | numeric | Indicates which key the subject pressed. The value is the [numeric key code](http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes) corresponding to the subject's response.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from when the A and B stimuli first appear on the screen until the subject's response.
correct | boolean | True if the subject picks the correct answer.

## Examples

#### Doing an audio discrimination task

```javascript
var block = {
	type: 'audio-abx',
	stimuli: ['sound1.wav', 'sound2.wav', 'sound3.wav'],
	prompt: "Press A if the first sound is like the last or press B if it was the second sound that is like the last.",
  key_first : 'a',
  key_second : 'b'
}
```

