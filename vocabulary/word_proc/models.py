from django.db import models
from django.contrib.auth.models import User 
import decimal

# Create your models here.
class Dictionary(models.Model):
	eng = models.CharField(max_length=32, primary_key=True)
	rus = models.CharField(max_length=32)

	def __str__(self):
		return self.eng + ' - ' + self.rus

class UserWords(models.Model):
	word = models.ForeignKey(Dictionary, on_delete=models.CASCADE)
	user_trans = models.CharField(max_length=32)
	rating = models.DecimalField(max_digits=14, decimal_places=9)
	success_run = models.IntegerField(default=0)
	last_drilled = models.DateTimeField(auto_now_add=True)
	last_rating_update = models.DateTimeField(auto_now_add=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	learned = models.BooleanField(default=False)

	MAX_RATE = 2000

	def get_rating(self):
		return float(self.rating)

	def set_rating(self, value):
		self.rating = decimal.Decimal((value if value < self.MAX_RATE else self.MAX_RATE) if value >=0 else 0)
		self.save()

	def update_rating(self, now_):
		norm_t0 = (self.last_rating_update - self.last_drilled).total_seconds()
		norm_t1 = (now_ - self.last_drilled).total_seconds()
		if(norm_t0 < 0):
			norm_t0 = 0
		tp = 1.4
		n = 1.3
		time_desend = ((norm_t1/30.0) ** tp - (norm_t0/30.0) ** tp) / t0
		pp = self.get_rating() ** (n + 1.0)
		self.rating = (pp - time_desend) ** (1.0 / (n + 1)) if time_desend < pp else 0
		self.last_rating_update = now_
		self.save()

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