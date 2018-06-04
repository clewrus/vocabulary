from django.urls import path
from . import views_vocabulary, views_drills

urlpatterns = [
	path('vocabulary/', views_vocabulary.vocabulary, name='vocabulary'),
	path('add_word/', views_vocabulary.add_word, name='add_word'),
	path('get_word_list/', views_vocabulary.get_word_list, name='get_word_list'),
	path('change_user_trans/', views_vocabulary.change_user_trans, name='change_user_trans'),
	path('remove_user_words/', views_vocabulary.remove_user_words, name='remove_user_words'),
	path('drills/', views_drills.drills, name='drills'),
	path('get_unlearned_word/', views_drills.get_unlearned_word, name='get_unlearned_word'),
	path('set_word_as_learned/', views_drills.set_word_as_learned, name='set_word_as_learned')
]