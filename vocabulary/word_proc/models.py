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
	rating = models.IntegerField()
	success_run = models.IntegerField()
	last_drilled = models.DateTimeField(auto_now_add=True)
	last_rating_update = models.DateTimeField(auto_now_add=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	learned = models.BooleanField(default=False)

	MAX_RATE = 2000
	@staticmethod
	def rate_function(rate, time):
		t0 = 1000
		p0 = 100
		tp = 1.3
		n = 3
		v = 1
		time_desend = v * (p0 ** n) * (time / t0) ** 1.3
		pp = rate ** (n + 1)
		return (pp - time_desend) ** (1 / (n + 1)) if time_desend < pp else 0

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
	date = models.DateTimeField(auto_now_add=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)