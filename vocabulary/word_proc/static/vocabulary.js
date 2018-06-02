let alert = undefined;
let answer = {
	0: "created",
	1: "It doesn't look like english word!",
	2: "The word is already in vocabulary.",
};
let tableData = {};
let transUpdateList = {};
let transChanged = false;
let removedWords = [];
let visibleRows = [];
let visiblePnt = 0;
let inSearch = false;
let searchRows = [];
let WORDS_PER_PAGE = 13;


$(function(){
	// some usefull woodo magic
	alert = $("#alert_add_word").removeClass('hide').hide();
	$("#add_word").click(sendWord);
	$("#save_button").click(applyTransChanges);
	$("#left_arrow").click(leftArrowEvent);
	$("#right_arrow").click(rightArrowEvent);
	$("#table_hug").css("height", 65 + 43 * WORDS_PER_PAGE + "px")

	fillWordTable();
})

function sendWord(){
	if($("#add_word").attr("class").indexOf("disabled") != -1)
		return;

	alert.hide();
	if($("#english_word").val().match(/[a-zA-Z]/i) == null){
		showAlert("It don't looks like a word");
		return;
	}

	let post = {
		"word" : $("#english_word").val(),
		"user_trans" : $("#additional").val()
	};
	setCSRF();
	$("#add_word").addClass("disabled");
	$.ajax({
		success: handleResponse,
		error: () => {showAlert("an error occure");},
		complete : () => {$("#add_word").removeClass("disabled")},
		type : "post",
		url : $("#url_add_word").html(),
		data : post
	})
}

function handleResponse(res){
	if(res.result == "success"){
		word = res.word;
		addWordToTable(word[0], word[1], word[2])
		$("#english_word").val("");
		$("#additional").val("");
	} else if(res.result == "error"){
		if(res.answer == answer[1]){
			showAlert(res.answer);
		} else if(res.answer == answer[2]){
			showAlert(res.answer + " It could means <i>" + res.trans + "</i>.")
		} else {
			console.log(res)
		}
	} else {
		console.log(res);
	}
}

function addWordToTable(word, autoTrans, userTrans){
	tableData.unshift({eng_word: word, rate: 10000, trans:[autoTrans, userTrans]})
	buildTable();
}

function removeWordFromTable(){
	for (let i = tableData.length - 1; i >= 0; i--) {
		if(removedWords.includes(tableData[i].eng_word)){
			tableData.splice(i, 1);
		}
	}
	buildTable();
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

function showAlert(message){
	alert.html("<p class='text-centered'><b>" + message + "</b></p>").show()
}

function fillWordTable(){
	setCSRF();
	$.ajax({
		url: $("#url_get_word_list").html(),
		type: "post",
		success: (data) => {
			tableData = parseData(data);
			tableData.sort((a, b) => b.order - a.order)
			buildTable();
		},
		error: (res) => console.log(res),
	});
}

function parseData(data){
	result = []
	for(w in data){
		curItem = {}
		curItem["eng_word"] = w;
		curItem["for_remove"] = false;
		// a little bit silly but i really desired to try extend function
		$.extend(true, curItem, data[w]);
		result.push(curItem)
	}
	return result
}

function buildTable(){
	tbody = $("#word_list");
	tbody.children().remove();
	for(i in tableData){
		curW = tableData[i];
		id = "row_" + i;
		tbody.append(generateTableRow(curW.eng_word, curW.trans[0], curW.trans[1], id));
	}
	setupFullPageOfRows();
	updateVisibleRows();
}

function generateTableRow(word, auto_trans, user_trans, id){
	let getTd = () => $("<td></td>");
	let getP = (s) => $("<p></p>").text(s)
	let getTrash = () => $($("#trash_icon").children()[0]).clone()
	curRow = $("<tr></tr>").attr("id", id);
	trashSpan = getTrash().addClass("trash_deactivated trash_label").attr("index", id).click(trashClicked);
	curRow.append(getTd().append(trashSpan).append(getP(word))).append(getTd().append(getP(auto_trans)));
	inp = $("<input></input>").on("input", handleTransChange).addClass("form-control table_input").addClass("").attr("eng_word", word).attr("type", "input").val(user_trans);
	curRow.append(getTd().append(inp).addClass("table_row").css("padding", "0px"))
	return curRow
}
function trashClicked(smth){
	let element = $(smth.currentTarget)
	let id = +element.attr("index").split("_")[1];
	let curObj = tableData[id];
	curObj.for_remove = !curObj.for_remove;
	if(curObj.for_remove){
		element.removeClass("trash_deactivated").addClass("trash_activated");
		removedWords.push(curObj.eng_word);
	} else {
		element.removeClass("trash_activated");
		element.addClass("trash_deactivated");
		index = removedWords.indexOf(curObj.eng_word);
		removedWords.splice(index, 1)
	}
	if(removedWords.length > 0){
		$("#save_button").removeClass("disabled");
	} else if(!transChanged){
		disableSaveButton();
	}
}

function handleTransChange(smth){
	curInput = $(smth.currentTarget);
	transUpdateList[curInput.attr("eng_word")] = curInput.val();
	transChanged = true;
	$("#save_button").removeClass("disabled")
}

function disableSaveButton(){
	$("#save_button").addClass("disabled");
}

function applyTransChanges(){
	if($("#save_button").attr("class").indexOf("disabled") != -1)
		return;

	setCSRF();
	if(transChanged){
		$.ajax({
			url: $("#url_change_user_trans").html(),
			type: "post",
			data: transUpdateList,
			success: () => {
				transUpdateList = {};
				disableSaveButton();
				transChanged = false;
			},
			error: (res) => {
				console.log(res)
			},
		});
	}

	if(removedWords.length > 0){
		$.ajax({
			url: $("#url_remove_user_words").html(),
			type: "post",
			data: {"removed_words": removedWords},
			success: () => {
				$(".trash_label").removeClass("trash_activated").addClass("trash_deactivated");
				removeWordFromTable();
				removedWords = [];
				disableSaveButton();},
			error: (res) => {console.log(res);},
		});
	}
}

function hideEverything(){
	for(let i = 0; i < tableData.length; i++){
		$("#row_" + i).hide();
	}
}

function updateVisibleRows(){
	hideEverything();
	for(i in visibleRows){
		$("#row_" + visibleRows[i]).show();
	}

}

function setupFullPageOfRows(){
	visibleRows = []
	for(let i = visiblePnt; i < visiblePnt + WORDS_PER_PAGE; i++){
		if(i < tableData.length){
			visibleRows.push(i);
		}
	}
	updateArrows();
}

function leftArrowEvent(){
	numOfItems = inSearch ? searchRows : tableData.length;
	if(visiblePnt - WORDS_PER_PAGE < 0){
		return;
	}
	visiblePnt -= WORDS_PER_PAGE;
	updateArrows();
	// $("#right_arrow").removeClass("disabled");
	// if(visiblePnt - WORDS_PER_PAGE < 0){
	// 	$("#left_arrow").addClass("disabled");
	// }
	setupFullPageOfRows();
	updateVisibleRows();
}

function rightArrowEvent(){
	numOfItems = inSearch ? searchRows : tableData.length;
	if(visiblePnt + WORDS_PER_PAGE >= numOfItems){
		return;
	}
	visiblePnt += WORDS_PER_PAGE;
	updateArrows();
	// $("#left_arrow").removeClass("disabled");
	// if(visiblePnt + WORDS_PER_PAGE >= numOfItems){
	// 	$("#right_arrow").addClass("disabled");
	// }
	setupFullPageOfRows();
	updateVisibleRows();
}

function updateArrows(){
	$("#left_arrow").removeClass("disabled");
	if(visiblePnt - WORDS_PER_PAGE < 0){
		$("#left_arrow").addClass("disabled");
	}

	$("#right_arrow").removeClass("disabled");
	numOfItems = inSearch ? searchRows : tableData.length;
	if(visiblePnt + WORDS_PER_PAGE >= numOfItems){
		$("#right_arrow").addClass("disabled");
	}
}