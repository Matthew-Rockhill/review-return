# accounts/forms.py
from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from .models import Business

User = get_user_model()

class CustomAuthenticationForm(AuthenticationForm):
    """Custom login form that uses email"""
    # Override the username field to use email
    username = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(attrs={'autofocus': True})
    )
    
    def clean(self):
        # Get the email and password from the form
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        if email and password:
            # Try to authenticate with the email and password
            self.user_cache = authenticate(
                self.request, email=email, password=password
            )
            if self.user_cache is None:
                raise forms.ValidationError(
                    "Please enter a correct email and password. "
                    "Note that both fields may be case-sensitive.",
                    code='invalid_login',
                )
            else:
                self.confirm_login_allowed(self.user_cache)
        
        return self.cleaned_data


class BusinessSignupForm(forms.ModelForm):
    """Form for business registration with user account creation"""
    email = forms.EmailField(label="Email", required=True)
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Confirm Password", widget=forms.PasswordInput)
    
    class Meta:
        model = Business
        fields = ['name', 'address', 'phone', 'website', 'google_review_url', 'logo']
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already in use.")
        return email
    
    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match.")
        return password2
    
    @transaction.atomic
    def save(self, commit=True):
        # Create a new user with the email
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            password=self.cleaned_data['password1']
        )
        
        # Create a business linked to the user
        business = super().save(commit=False)
        business.user = user
        business.email = self.cleaned_data['email']  # Use the same email
        
        if commit:
            business.save()
        
        return business