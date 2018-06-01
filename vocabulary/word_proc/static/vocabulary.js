let alert = undefined;
let answer = {
	0: "created",
	1: "It doesn't look like english word!",
	2: "The word is already in vocabulary.",
};
let tableData = {};
let transUpdateList = {};
let visibleRows = [];
let visiblePnt = 0;
let inSearch = false;
let searchRows;
const WORDS_PER_PAGE = 13;


$(function(){
	// some usefull woodo magic
	alert = $("#alert_add_word").removeClass('hide').hide();
	$("#add_word").click(sendWord);
	$("#save_button").click(applyTransChanges);
	$("#left_arrow").click(leftArrowEvent)
	$("#right_arrow").click(rightArrowEvent)

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
	})
}

function parseData(data){
	result = []
	for(w in data){
		curItem = {}
		curItem["eng_word"] = w;
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
	curRow = $("<tr></tr>").attr("id", id);
		curRow.append(getTd().text(word)).append(getTd().text(auto_trans));
		inp = $("<input></input>").on("input", handleTransChange).addClass("form-control").addClass("table_input").attr("eng_word", word).attr("type", "input").val(user_trans);
		curRow.append(getTd().append(inp).addClass("table_row").css("padding", "0px"))
	return curRow
}

function handleTransChange(smth){
	curInput = $(smth.currentTarget);
	transUpdateList[curInput.attr("eng_word")] = curInput.val();
	$("#save_button").removeClass("disabled")
}

function applyTransChanges(){
	if($("#save_button").attr("class").indexOf("disabled") != -1)
		return;

	setCSRF();
	$.ajax({
		url: $("#url_change_user_trans").html(),
		type: "post",
		data: transUpdateList,
		success: () => {
			transUpdateList = {};
			$("#save_button").addClass("disabled")
		},
		error: (res) => {
			console.log(res)
		},
	});
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
}

function leftArrowEvent(){
	numOfItems = inSearch ? searchRows : tableData.length;
	if(visiblePnt - WORDS_PER_PAGE < 0){
		return;
	}
	visiblePnt -= WORDS_PER_PAGE;
	$("#right_arrow").removeClass("disabled");
	if(visiblePnt - WORDS_PER_PAGE < 0){
		$("#left_arrow").addClass("disabled");
	}
	setupFullPageOfRows();
	updateVisibleRows();
}

function rightArrowEvent(){
	numOfItems = inSearch ? searchRows : tableData.length;
	if(visiblePnt + WORDS_PER_PAGE >= numOfItems){
		return;
	}
	visiblePnt += WORDS_PER_PAGE;
	$("#left_arrow").removeClass("disabled");
	if(visiblePnt + WORDS_PER_PAGE >= numOfItems){
		$("#right_arrow").addClass("disabled");
	}
	setupFullPageOfRows();
	updateVisibleRows();
}