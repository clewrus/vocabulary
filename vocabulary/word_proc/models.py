from django.db import models
from django.contrib.auth.models import User 

# Create your models here.
class Dictionary(models.Model):
	eng = models.CharField(max_length=32, primary_key=True)
	rus = models.CharField(max_length=32)

	def __str__(self):
		return self.eng + ' - ' + self.rus

class UserWords(models.Model):
	word = models.ForeignKey(Dictionary, on_delete=models.CASCADE)
	user_trans = models.CharField(max_length=32)
	rating = models.IntegerField() # 10000 on begining
	last_drilled = models.DateField(auto_now_add=True)
	last_rating_update = models.DateField(auto_now_add=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	learned = models.BooleanField(default=False)

	def __str__(self):
		return self.word.eng + '(' + self.user.username + ')' + (' adds: '+self.user_trans if self.user_trans!='' else '')

# this two tables may be realised in the main page

class UserStatistic(models.Model):
	num_of_drills = models.IntegerField()
	corect_rate = models.IntegerField() # 10000 percent
	user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

class Drills(models.Model):
	num_of_tests = models.IntegerField()
	num_of_corect = models.IntegerField()
	date = models.DateField(auto_now_add=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)