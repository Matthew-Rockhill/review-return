# survey/urls.py
from django.urls import path
from . import views

app_name = 'survey'

urlpatterns = [
    path('<uuid:business_uuid>/', views.survey_landing, name='survey_landing'),
    path('<uuid:business_uuid>/<int:campaign_id>/', views.survey_landing, name='survey_landing'),
    path('<uuid:business_uuid>/take/', views.take_survey, name='take_survey'),
    path('<uuid:business_uuid>/<int:campaign_id>/take/', views.take_survey, name='take_survey'),
    path('review/<int:response_id>/', views.google_review_request, name='google_review_request'),
    path('thank-you/<int:response_id>/', views.thank_you, name='thank_you'),
    path('promotion/<str:unique_code>/', views.promotion_details, name='promotion_details'),
]