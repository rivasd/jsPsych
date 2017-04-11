# jspsych-audio-similarity plugin

In the audio-similarity plugin, two sounds are played and the subject have to use a slide-bar to scale the similarity between them.

## Parameters

This table lists the parameters associated with this plugin. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
stimuli | array | *undefined* | Array of two sounds (mp3, wav, etc.). The sounds cannot be served from the file system, they need to be hosted in a server. 
labels | array of strings | ["Not at all similar", "Identical"] | An array of tags to label the slider. must be eclosed in square brackets. Each label must be enclosed in double quotation marks.
intervals | numeric |100 | How many different choices are available on the slider. For example, 5 will limit the options to 5 different places on the slider
prompt | string | "" | This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the subject is supposed to take (e.g. which key to press).
timing_gap | numeric | 500 | How long to wait between each sound in milliseconds.
timing_first_stim | numeric | -1 | How long to play the first sound for in milliseconds. If the value of this parameter is -1, then the sound will play until its done.
timing_second_stim | numeric | -1 | How long to play the second sound for in milliseconds. If the value of this parameter is -1, then the sound will play until its done.
timeout | numeric | -1 | The maximum duration to wait for a response in milliseconds, measured from the end of the third sound. If -1, then the trial will wait indefinitely for a response.
timeout_message | string | "Please respond faster" | A message to indicate to the participant that the time left to answer ran out. Will be shown only if a timeout is set.
timeout_message_timing | numeric | 1000 | How long to show the timeout feedback for in milliseconds.

## Data Generated

In addition to the [default data collected by all plugins](overview#datacollectedbyplugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
firstStim | string | The sound presented in first
secondStim | string | The sound presented in second
sim_score | numeric | A number that indicates the similarity score the subject gave to the sounds.
rt | numeric | The response time in milliseconds for the subject to make a response. The time is measured from the end of the last sound.

## Examples

#### Doing an audio similarity task

```javascript
var block = {
	type: 'audio-similarity',
	stimuli: ['sound1.wav', 'sound2.wav'],
	prompt: "How similar are these two sounds ?",
}
```
