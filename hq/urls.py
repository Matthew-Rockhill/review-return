# hq/urls.py
from django.urls import path
from . import views

app_name = 'hq'

urlpatterns = [
    path('', views.hq_home, name='home'),
    path('businesses/', views.BusinessListView.as_view(), name='business_list'),
    path('businesses/create/', views.BusinessCreateView.as_view(), name='business_create'),
    path('businesses/<int:pk>/', views.BusinessDetailView.as_view(), name='business_detail'),
    path('businesses/<int:pk>/edit/', views.BusinessUpdateView.as_view(), name='business_update'),
    path('businesses/<int:pk>/delete/', views.BusinessDeleteView.as_view(), name='business_delete'),
    path('analytics/', views.AnalyticsView.as_view(), name='analytics'),
    path('responses/', views.ResponsesListView.as_view(), name='responses'),
    path('responses/<int:pk>/', views.ResponseDetailView.as_view(), name='response_detail'),
]