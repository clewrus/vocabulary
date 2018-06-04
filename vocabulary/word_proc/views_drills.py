from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from .models import UserWords, Dictionary

def drills(request):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse('main_page'), {'error': "You are not authenticated"})
	unlearned_words = UserWords.objects.filter(learned=False, user=request.user).count()
	return render(request, 'drills.html', {'user': request.user, 'unlearned_words':unlearned_words})

def get_unlearned_word(request):
	if not request.user.is_authenticated:
		return JsonResponse({'error': 'You are not authenticated'})

	unlearned_words = UserWords.objects.filter(learned=False, user=request.user)
	i = 0
	response = {}
	for w in unlearned_words:
		response.update({i: {'eng':w.word.eng, 'auto':w.word.rus, 'custom':w.user_trans}})
		i += 1
	return JsonResponse(response)

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