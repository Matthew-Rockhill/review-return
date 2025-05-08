# accounts/urls.py
from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.BusinessSignupView.as_view(), name='business_signup'),
    path('password-change/', auth_views.PasswordChangeView.as_view(template_name='accounts/password_change.html'), 
         name='password_change'),
    path('password-change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='accounts/password_change_done.html'), 
         name='password_change_done'),
    path('password-reset/', auth_views.PasswordResetView.as_view(template_name='accounts/password_reset.html'), 
         name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='accounts/password_reset_done.html'), 
         name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='accounts/password_reset_confirm.html'), 
         name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='accounts/password_reset_complete.html'), 
         name='password_reset_complete'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('no-business-profile/', views.NoBusinessProfileView.as_view(), name='no_business_profile'),
    
    # subscriptions
    path('subscription/plans/', views.subscription_plans, name='subscription_plans'),
    path('subscription/checkout/<str:plan>/<str:subscription_type>/', views.subscription_checkout, name='subscription_checkout'),
    path('subscription/process/', views.process_payment, name='process_payment'),
    
    # onboarding
    path('onboarding/', views.onboarding, name='onboarding'),
]