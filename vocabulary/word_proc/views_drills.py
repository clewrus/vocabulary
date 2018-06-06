from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from datetime import datetime
from .models import UserWords, Dictionary, Drills
from math import log

def drills(request):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse('main_page'), {'error': "You are not authenticated"})

	update_words_rating(request.user)
	unlearned_words = UserWords.objects.filter(learned=False, user=request.user).count()
	return render(request, 'drills.html', {'user': request.user, 'unlearned_words':unlearned_words})

def get_unlearned_word(request):
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'You are not authenticated'})
	unlearned_words = UserWords.objects.filter(learned=False, user=request.user)
	return getResponseDict(unlearned_words)

def set_word_as_learned(request):
	if not request.user.is_authenticated or not request.POST:
		return JsonResponse({'error': 'You are not authenticated'})

	learned_word = request.POST.get('word')
	try:
		word_record = Dictionary.objects.get(eng=learned_word)
		us_word = UserWords.objects.get(user=request.user, word=word_record)
		us_word.learned = True
		us_word.last_drilled = datetime.now()
		us_word.last_rating_update = datetime.now()
		us_word.success_run = 0
		us_word.rating = 220.0
		us_word.save()
	except Dictionary.DoesNotExist:
		print('Word does not exist ({w})'.format(w=learned_word) )
	except UserWords.DoesNotExist:
		print('User({u}) have not such word({w})'.format(u=request.user.username, w=learned_word))

	return JsonResponse({'result': 'succsess', 'answer': 'saved'})

def get_drill_words(request):
	if not request.user.is_authenticated or not request.POST:
		return JsonResponse({'error': 'You are not authenticated'})

	num = int(request.POST['num_of_words'])
	word_list = UserWords.objects.filter(user=request.user, learned=True).order_by('rating')
	drill_set = word_list[: num if num <= len(word_list) else len(word_list)]
	return getResponseDict(drill_set)

def update_words_rating(user):
	user_w_rec = UserWords.objects.filter(user=user, learned=True)
	now_ = datetime.now()
	updated = False
	for w in user_w_rec:
		diff = (now_ - w.last_rating_update).total_seconds()
		if(diff > 43200):
			updated = True
			w.update_rating(now_)
		else:
			continue
	if updated:
		print('Rating updateв. User: {u}'.format(u=user.username))
	return

def handle_drill_result(request):
	if not request.user.is_authenticated or not request.POST:
		return JsonResponse({'error': 'You are not authenticated'})

	drill_res = dict(request.POST)
	drill_size = int(drill_res['drill_size'][0])
	del drill_res['drill_size']
	correct_answers = 0

	for w in drill_res.keys():
		try:
			cur_res = int(drill_res[w][0])
			word_record = Dictionary.objects.get(eng=w)
			user_w_rec = UserWords.objects.get(user=request.user, word=word_record)
			new_rate = get_new_rate(user_w_rec.get_rating(), user_w_rec.success_run, cur_res)
			user_w_rec.set_rating(new_rate)
			user_w_rec.success_run = (user_w_rec.success_run + 1) if cur_res == 2 else 0
			correct_answers += 1 if cur_res == 2 else 0
			if new_rate == 0:
				user_w_rec.learned = False
			user_w_rec.last_drilled = datetime.now()
			user_w_rec.save()
		except Dictionary.DoesNotExist:
			print("User ({u}) tryed to update word ({w}). It does not exist.".format(u=request.user.username, w=w))
			continue
		except UserWords.DoesNotExist:
			print("User ({u}) tryed to update word ({w}). He didn't add it to his voc.".format(u=request.user.username, w=w))
			continue

	Drills.objects.create(user=request.user, num_of_tests = drill_size, num_of_corect = correct_answers)
	return JsonResponse({'answer': 'success'})

def get_new_rate(old_rate, success_run, drill_res):
	if drill_res == 2:
		nw_rate = log((success_run + 1) * 2.5 + 1) * 200 + old_rate
		return nw_rate
	elif drill_res == 1 or success_run != 0:
		return old_rate
	else:
		return 0

def getResponseDict(userWords_queryset):
	i = 0
	response = {}
	for w in userWords_queryset:
		response.update({i: {'eng':w.word.eng, 'auto':w.word.rus, 'custom':w.user_trans}})
		i += 1
	return JsonResponse(response)