from django.urls import path
from . import views

urlpatterns = [
	path('', views.main_page, name='main_page'),
	path('login/', views.log_in, name='log_in'),
	path('logout/', views.log_out, name='log_out'),
	path('registration/', views.registration, name='registration'),
	path('check_username/', views.check_username, name='check_username'),
]