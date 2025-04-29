# portal/urls.py
from django.urls import path
from . import views

app_name = 'portal'

urlpatterns = [
    path('', views.client_dashboard, name='dashboard'),
    
    # Survey management
    path('surveys/', views.manage_surveys, name='manage_surveys'),
    path('surveys/create/', views.SurveyCreateView.as_view(), name='survey_create'),
    path('surveys/<int:survey_id>/questions/', views.survey_questions, name='survey_questions'),
    path('surveys/<int:pk>/edit/', views.SurveyUpdateView.as_view(), name='survey_update'),
    path('surveys/<int:pk>/delete/', views.SurveyDeleteView.as_view(), name='survey_delete'),
    
    # Promotion management
    path('promotions/', views.manage_promotions, name='manage_promotions'),
    path('promotions/create/', views.PromotionCreateView.as_view(), name='promotion_create'),
    path('promotions/<int:pk>/edit/', views.PromotionUpdateView.as_view(), name='promotion_update'),
    path('promotions/<int:pk>/delete/', views.PromotionDeleteView.as_view(), name='promotion_delete'),
    
    # QR code
    path('qr-code/', views.business_qr_code, name='business_qr_code'),
    
    # Response management
    path('responses/', views.response_list, name='response_list'),
    path('responses/<int:pk>/', views.response_detail, name='response_detail'),
    
    # Analytics
    path('analytics/', views.business_analytics, name='business_analytics'),
    
    # Business profile
    path('profile/', views.business_profile, name='business_profile'),
]