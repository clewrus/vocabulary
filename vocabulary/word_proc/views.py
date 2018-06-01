from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import UserWords, Dictionary
import googletrans
import string

# def check_auth(request):
# 	if not request.user.is_authenticated:
# 		return HttpResponseRedirect(reverse('main_page'), {'error': "You are not authenticated"})
# 	return None

def vocabulary(request):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse('main_page'), {'error': "You are not authenticated"})
	return render(request, 'vocabulary.html', {'user': request.user})

def add_word(request):
	if not request.user.is_authenticated or not request.POST:
		return None

	word = request.POST['word']
	user_trans = request.POST['user_trans'] if len(request.POST['user_trans']) <= 32 else ''

	record = None

	try:
		# check whether user already added the word to his vocabulary
		record = Dictionary.objects.get(pk=word)
		if UserWords.objects.filter(word=record, user=request.user).exists():
			answer = {
			'result' : 'error',
			'answer' : 'The word is already in vocabulary.',
			'trans' : record.rus,
			}
			return JsonResponse(answer)

	except Dictionary.DoesNotExist:
		# creating a Dictionary record
		trans = googletrans.Translator()
		detected = trans.detect(word)

		not_eng_word_response = JsonResponse({'result' : 'error','answer':"It doesn't look like english word!"})

		if detected.lang == 'en' and detected.confidence >= 0.5:
			rus_transtate = trans.translate(word, src='en', dest='ru').text
			if check_for_eng_laters(rus_transtate):
				print('new word occured')
				record = Dictionary.objects.create(eng=word, rus=rus_transtate)
			else:
				return not_eng_word_response
		else:
			return not_eng_word_response
	# adding the record to User's vocadulary
	UserWords.objects.create(word=record, user_trans=user_trans, rating=10000, user=request.user)
	return JsonResponse({'result' : 'success', 'answer' : 'created', 'word':[record.eng, record.rus, user_trans]})

def get_word_list(request):
	if not request.user.is_authenticated:
		return None
	user_words = UserWords.objects.filter(user=request.user)
	word_list = {w.word.eng: {'trans':[w.word.rus, w.user_trans], 'rate': w.rating, 'order': w.id} for w in user_words}
	return JsonResponse(word_list)

def change_user_trans(request):
	if not request.user.is_authenticated or not request.POST:
		return None

	for word in request.POST.keys():
		try:
			dictNote = Dictionary.objects.get(eng=word);
			record = UserWords.objects.get(user=request.user, word=dictNote)
			record.user_trans = request.POST[word]
			record.save()
		except Dictionary.DoesNotExist:
			print('Warning! ' + request.user.username + ' tried to change non-existent word (' + word + ')')
			continue
		except UserWords.DoesNotExist:
			print('Warning! ' + request.user.username + ' tried to change word that not in his vocabulary (' + word + ')')
			continue

	return JsonResponse({'result' : 'success', 'answer' : 'changed'})

def check_for_eng_laters(word):
	for letter in word:
		if letter in string.ascii_letters:
			return False
	return True