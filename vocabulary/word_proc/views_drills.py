from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import UserWords, Dictionary

def drills(request):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse('main_page'), {'error': "You are not authenticated"})

	updateWordsRating(request.user)
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
		user_word_record = UserWords.objects.get(user=request.user, word=word_record)
		user_word_record.learned = True
		user_word_record.save()
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

def updateWordsRating(user):

	return

def handle_drill_result(request):
	if not request.user.is_authenticated or not request.POST:
		return JsonResponse({'error': 'You are not authenticated'})

	print(request.POST)
	return JsonResponse({'answer': 'success'})

def getResponseDict(userWords_queryset):
	i = 0
	response = {}
	for w in userWords_queryset:
		response.update({i: {'eng':w.word.eng, 'auto':w.word.rus, 'custom':w.user_trans}})
		i += 1
	return JsonResponse(response)