from django.contrib import admin
from .models import Dictionary, UserWords

admin.site.register(Dictionary)
admin.site.register(UserWords)

