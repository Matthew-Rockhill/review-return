# accounts/views.py
from django.shortcuts import render, redirect
from django.views.generic import CreateView, UpdateView, TemplateView
from django.contrib.auth.views import LoginView as BaseLoginView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
from .models import User, Business
from .forms import BusinessSignupForm, CustomAuthenticationForm

class LoginView(BaseLoginView):
    """Custom login view that uses email instead of username"""
    template_name = 'accounts/login.html'
    form_class = CustomAuthenticationForm
    
    def get_success_url(self):
        # Redirect staff users to HQ, regular users to portal
        if self.request.user.is_staff:
            return reverse_lazy('hq:home')
        return reverse_lazy('portal:dashboard')
    
    def form_invalid(self, form):
        # Debug output
        print(f"Login form errors: {form.errors}")
        return super().form_invalid(form)


class BusinessSignupView(CreateView):
    """View for business registration"""
    template_name = 'accounts/business_signup.html'
    form_class = BusinessSignupForm
    success_url = reverse_lazy('accounts:login')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Your account has been created successfully! Please check your email to verify your account.')
        return response


class ProfileView(LoginRequiredMixin, UpdateView):
    """View for updating business profile"""
    model = Business
    template_name = 'accounts/profile.html'
    fields = ['name', 'address', 'phone', 'email', 'website', 'google_review_url', 'logo']
    success_url = reverse_lazy('accounts:profile')
    
    def get_object(self):
        # Get the business associated with the current user
        return self.request.user.business
    
    def form_valid(self, form):
        messages.success(self.request, 'Your profile has been updated successfully!')
        return super().form_valid(form)


class NoBusinessProfileView(LoginRequiredMixin, TemplateView):
    """View for users without a business profile"""
    template_name = 'accounts/no_business_profile.html'