from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('drill/', include('word_proc.urls')),
    path('main/', include('mainPage.urls'))
]
