let wordsToLearn = [];
let curWord = undefined;


$(function(){
	$("#button_hug").children().hide();
	setCSRF();
	$("#learn_button").click(handleLearnEvent);
	$("#drill_button").click(handleDrillEvent);
	$("#show_trans_button").click(showTranslation);
	$(".learn_buttons").click(learnResult);
	$(".drill_buttons").click(drillResult);
});

// have to handle situation when there are too many words
function handleLearnEvent(){
	hideStartButtons();
	setupLearnInterphase();
	$.ajax({
		url: $("#url_get_unlearned_word").html(),
		type: "post",
		success: (res) => {
			wordsToLearn = getWordArray(res);
			nextLearningWord();
		},
		error: (res) => {
			console.log(res);
		}
	});
}

function getWordArray(res){
	arr = [];
	for(w in res){
		res[w].success_run = 0;
		arr.push(res[w]);
	}
	return arr;
}

function setupLearnInterphase(){
	$(".drill_buttons").hide();
	$(".learn_buttons").show();
	$("#show_trans_button").show();
	$("#title_phrase").text("What is the translation?")
}

function nextLearningWord(){
	// to let last words sometime appear at the screen
	curWord = wordsToLearn.splice(Math.random() > 0.8 ? -1 : 0, 1)[0];
	$("#word").text(curWord.eng);
	hideTranslation();
	disableAnswerButtons();

	$("#auto_trans").text(curWord.auto);
	$("#custom_trans").text(curWord.custom);
}

function learnResult(context){
	let elem = $(context.currentTarget);
	if(elem.attr("class").includes("disabled")){
		return;
	}
	let result = elem.attr("result");
	if(result === "+"){
		curWord.success_run++;
	} else if(result === "-"){
		curWord.success_run = 0;
	} else {
		console.log("error", context);
	}

	if(curWord.success_run >= 2){
		setWordAsLearned();
	} else {
		let position = Math.floor((Math.random() + 1) * wordsToLearn.length / 2.0);
		wordsToLearn.splice(position, 0, curWord);
	}
	curWord = undefined;
	nextLearningWord();
}

function setWordAsLearned(){
	$.ajax({
		url: $("#url_set_word_as_learned").html(),
		data: {"word": curWord.eng},
		type: "post",
		success: () => {},
		error: (res) => {console.log(res)},
	});
}

function handleDrillEvent(){

}

function drillResult(context){

}

function setCSRF(){
	$.ajaxSetup({ 
	     beforeSend: function(xhr, settings) {
	         function getCookie(name) {
	             var cookieValue = null;
	             if (document.cookie && document.cookie != '') {
	                 var cookies = document.cookie.split(';');
	                 for (var i = 0; i < cookies.length; i++) {
	                     var cookie = jQuery.trim(cookies[i]);
	                     // Does this cookie string begin with the name we want?
	                     if (cookie.substring(0, name.length + 1) == (name + '=')) {
	                         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                         break;
	                     }
	                 }
	             }
	             return cookieValue;
	         }
	         xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
	     } 
	});
}

function hideStartButtons(){
	$("#start_buttons").hide();
}

function showStartButtons(){
	$("#start_buttons").show();
}

function hideTranslation(){
	$("#translation").hide();
}

function showTranslation(){
	$("#translation").show();
	enableAnswerButtons();
}

function disableAnswerButtons(){
	$(".drill_buttons").addClass("disabled");
	$(".learn_buttons").addClass("disabled");
}

function enableAnswerButtons(){
	$(".drill_buttons").removeClass("disabled");
	$(".learn_buttons").removeClass("disabled");
}