from django.urls import path
from . import views

app_name = 'marketing'

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('how-it-works/', views.how_it_works, name='how_it_works'),
]