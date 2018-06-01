from django.urls import path
from . import views

urlpatterns = [
	path('vocabulary/', views.vocabulary, name='vocabulary'),
	path('add_word/', views.add_word, name='add_word'),
	path('get_word_list/', views.get_word_list, name='get_word_list'),
	path('change_user_trans/', views.change_user_trans, name='change_user_trans'),
]