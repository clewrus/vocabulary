from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse

def main_page(request):
	if  not request.user.is_authenticated :
		return render(request, 'mainPage_base_unautenticated.html', {})
	user = request.user;
	print('hey')
	return render(request, 'mainPage_base.html', {'user': user})
		
def registration(request):
	username = request.POST['username']
	password = request.POST['password']
	repeat_password = request.POST['repeat_password']

	if len(User.objects.filter(username=username)) != 0 or len(password) <= 8 or repeat_password != password:
		print("ni")
		return HttpResponseRedirect(reverse('main_page'), {'error': "Попробуйте еще раз"})

	password_hash = auth.hashers.make_password(password)
	user = User.objects.create(username=username, password=password_hash)
	auth.login(request, user)
	return HttpResponseRedirect(reverse('main_page'))

def check_username(request):
	username = request.GET.get('username')
	valid = User.objects.filter(username=username).count() == 0
	return JsonResponse({'valid': valid})

def log_in(request):
	username = request.POST['username']
	password = request.POST['password']
	user = auth.authenticate(request, username=username, password=password)

	if user is not None:
		auth.login(request, user)
	return HttpResponseRedirect(reverse('main_page'))

def log_out(request):
	auth.logout(request)
	return HttpResponseRedirect(reverse('main_page'))