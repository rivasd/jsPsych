/**
 * @author Daniel Rivas
 * 
 * Version 6.0 broke many, many things and should be considered an entirely different library altogether
 * here I collect some patches to try and keep some functionality of the core library portable from v5
 * THIS IS NOT EXHAUSTIVE, I only update what I want to keep so that user scripts do not break
 */


 //jsPsych.randomization.sample was removed, quick fix

 jsPsych.randomization.sample = function(arr, sampleSize, withReplacement){
    if(withReplacement){
        return jsPsych.randomization.sampleWithReplacement(arr, sampleSize);
    }
    else{
        return jsPsych.randomization.sampleWithoutReplacement(arr, sampleSize);
    }
}