let wordsToLearn = [];
let drillWords = [];
let curWord = undefined;
let drillWordsNumberInput = undefined;
let drillResultList = {};

$(function(){
	$("#button_hug").children().hide();
	setCSRF();
	$("#learn_button").click(handleLearnEvent);
	$("#drill_button").click(handleDrillEvent);
	$("#show_trans_button").click(showTranslation);
	$(".learn_buttons").click(learnResult);
	$(".drill_buttons").click(drillResult);

	$("#word").html("Welcome to the drills.<br>You can either learn words or get some drills.")
});

// have to handle situation when there are too many words
function handleLearnEvent(){
	cleanEventScreen();
	setupLearnInterphase();
	$.ajax({
		url: $("#url_get_unlearned_word").html(),
		type: "post",
		success: (res) => {
			wordsToLearn = getWordArray(res);
			nextWord(wordsToLearn);
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
		res[w].appeared_on_screen = 0;
		arr.push(res[w]);
	}
	return arr;
}

function setupLearnInterphase(){
	$(".learn_buttons").show();
	$("#show_trans_button").show();
	$("#title_phrase").text("What is the translation?")
}

function nextWord(srcList){
	// to let last words sometime appear at the screen
	if(srcList.length == 0){
		if(srcList === wordsToLearn){
			endOfLearn();
		} else if(srcList === drillWords){
			endOfDrill();
		}
		return;
	}

	curWord = srcList.splice(Math.random() > 0.8 ? -1 : 0, 1)[0];
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
	curWord.appeared_on_screen++;
	if(curWord.success_run >= 2){
		setWordAsLearned();
	} else {
		let position = Math.floor((Math.random() + 1) * wordsToLearn.length / 2.0);
		wordsToLearn.splice(position, 0, curWord);
	}
	curWord = undefined;
	nextWord(wordsToLearn);
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

function endOfLearn(){
	cleanEventScreen();
	$("#title_phrase").text("You learn all this words!");
	$("#word").text("Congratulations. Now you can go to drills.")
}

function handleDrillEvent(){
	cleanEventScreen();
	showDrillSetuper();
}

function showDrillSetuper(){
	$("#title_phrase").text("How many words will be in the drill?");
	input = $("<input></input>").attr("id", "drill_words_number").addClass("temperary").val(20);
	drillWordsNumberInput = input;
	$("#word_graph").append(input);
	agreeButton = $("<button></button>").addClass("btn btn-success temperary").css("font-size", "xx-large").css("display", "table-cell").text("Go to drill").click(startDrill);
	$("#answer_buttons").append(agreeButton);
}

function startDrill(){
	drillSize = drillWordsNumberInput.val();
	drillResultList.drill_size = drillSize;
	$.ajax({
		url: $("#url_get_drill_words").html(),
		data: {"num_of_words": drillSize},
		type: "post",
		success: (res) => {
			drillWords = getWordArray(res);
			cleanEventScreen();
			setupDrillInterphase();
			nextWord(drillWords);
		},
		error: (res) => {console.log(res)},
	});
}

function setupDrillInterphase(){
	$(".drill_buttons").show();
	$("#show_trans_button").show();
	$("#title_phrase").text("Do you remember the word?")
}

function drillResult(context){
	let elem = $(context.currentTarget);
	if(elem.attr("class").includes("disabled")){
		return;
	}
	let result = elem.attr("result");
	curWord.appeared_on_screen++;
	if(result === "+"){
		curWord.success_run++;
	}
	if(curWord.appeared_on_screen >= 2){
		drillResultList[curWord.eng] = curWord.success_run;
	} else {
		let position = Math.floor((Math.random() + 1) * drillWords.length / 2.0);
		drillWords.splice(position, 0, curWord);
	}
	curWord = undefined;
	nextWord(drillWords);
}

function endOfDrill(){
	cleanEventScreen();
	$("#title_phrase").text("It's all. Just save your result.");
	saveButton = $("<button></button>").addClass("btn btn-success temperary").css("font-size", "xx-large").css("display", "table-cell").text("Save drill result").click(() => {
		$.ajax({
			url: $("#url_handle_drill_result").html(),
			data: drillResultList,
			type: "post",
			success: () => {
				cleanEventScreen();
				$("#title_phrase").text("Your result was saved. Now you can take drill one more time.");
			},
			error: (res) => {
				console.log(res);
			}
		});
	});
	$("#answer_buttons").append(saveButton);
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

function cleanEventScreen(){
	$("#button_hug").children().hide();
	$(".temperary").remove();
	hideTranslation();
	$("#title_phrase").text("")
	$("#word").text("")
}