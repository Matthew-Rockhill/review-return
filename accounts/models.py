# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.urls import reverse_lazy
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and save a user with the given email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model using email as the username field
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
    def get_short_name(self):
        return self.first_name or self.email.split('@')[0]


class Business(models.Model):
    """Business model for storing client information"""
    name = models.CharField(max_length=200)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='business')
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True, null=True)
    google_place_id = models.CharField(max_length=255, blank=True, null=True)
    google_review_url = models.URLField(blank=True, null=True)
    logo = models.ImageField(upload_to='business_logos/', blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    unique_identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Onboarding status
    ONBOARDING_INCOMPLETE = 'incomplete'
    ONBOARDING_PROFILE = 'profile_completed'
    ONBOARDING_SUBSCRIPTION = 'subscription_completed'
    ONBOARDING_CAMPAIGN = 'campaign_created'
    ONBOARDING_COMPLETE = 'complete'
    
    ONBOARDING_STATUSES = [
        (ONBOARDING_INCOMPLETE, 'Incomplete'),
        (ONBOARDING_PROFILE, 'Profile Completed'),
        (ONBOARDING_SUBSCRIPTION, 'Subscription Completed'),
        (ONBOARDING_CAMPAIGN, 'Campaign Created'),
        (ONBOARDING_COMPLETE, 'Complete'),
    ]
    
    onboarding_status = models.CharField(
        max_length=50, 
        choices=ONBOARDING_STATUSES, 
        default=ONBOARDING_INCOMPLETE
    )
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Generate QR code if not already created
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            # URL will point to the customer survey for this business
            qr.add_data(f'/survey/{self.unique_identifier}/')
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            self.qr_code.save(f"{self.name}_qr.png", File(buffer), save=False)
            
        super().save(*args, **kwargs)
    
    def generate_campaign_qr_code(self, campaign=None):
        """Generate a QR code for a specific campaign or the business in general"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        
        # URL will point to the customer survey for this business/campaign
        if campaign:
            qr.add_data(f'/survey/{self.unique_identifier}/{campaign.id}/')
            filename = f"{self.name}_{campaign.name}_qr.png"
        else:
            qr.add_data(f'/survey/{self.unique_identifier}/')
            filename = f"{self.name}_qr.png"
        
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        
        return buffer, filename
        
    def get_total_responses(self):
        """Get the total number of responses across all surveys"""
        from django.db.models import Count, Sum
        
        response_count = 0
        for survey in self.surveys.all():
            response_count += survey.responses.count()
        
        return response_count
    
    @property
    def onboarding_progress(self):
        """Get onboarding progress as a percentage"""
        statuses = {
            self.ONBOARDING_INCOMPLETE: 0,
            self.ONBOARDING_PROFILE: 25,
            self.ONBOARDING_SUBSCRIPTION: 50,
            self.ONBOARDING_CAMPAIGN: 75,
            self.ONBOARDING_COMPLETE: 100,
        }
        return statuses.get(self.onboarding_status, 0)
    
    @property
    def onboarding_next_step(self):
        """Get next onboarding step"""
        if self.onboarding_status == self.ONBOARDING_INCOMPLETE:
            return {'title': 'Complete Your Profile', 'url': reverse_lazy('accounts:profile')}
        elif self.onboarding_status == self.ONBOARDING_PROFILE:
            return {'title': 'Choose a Subscription Plan', 'url': reverse_lazy('accounts:subscription_plans')}
        elif self.onboarding_status == self.ONBOARDING_SUBSCRIPTION:
            return {'title': 'Create Your First Campaign', 'url': reverse_lazy('portal:campaign_create')}
        elif self.onboarding_status == self.ONBOARDING_CAMPAIGN:
            return {'title': 'Add a Survey to Your Campaign', 'url': reverse_lazy('portal:survey_create')}
        else:
            return None


class Subscription(models.Model):
    """Subscription model for tracking business subscriptions"""
    MONTHLY = 'monthly'
    ANNUAL = 'annual'
    
    SUBSCRIPTION_TYPES = [
        (MONTHLY, 'Monthly'),
        (ANNUAL, 'Annual'),
    ]
    
    FREE = 'free'
    BASIC = 'basic'
    PREMIUM = 'premium'
    
    PLAN_TYPES = [
        (FREE, 'Free'),
        (BASIC, 'Basic'),
        (PREMIUM, 'Premium'),
    ]
    
    business = models.OneToOneField(Business, on_delete=models.CASCADE, related_name='subscription')
    subscription_type = models.CharField(max_length=20, choices=SUBSCRIPTION_TYPES, default=MONTHLY)
    plan = models.CharField(max_length=20, choices=PLAN_TYPES, default=FREE)
    is_active = models.BooleanField(default=True)
    payfast_token = models.CharField(max_length=255, blank=True, null=True)
    next_billing_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business.name} - {self.get_plan_display()} ({self.get_subscription_type_display()})"
    
    @property
    def is_premium(self):
        return self.plan == self.PREMIUM
    
    @property
    def is_basic(self):
        return self.plan == self.BASIC
    
    @property
    def is_free(self):
        return self.plan == self.FREE
    
    @property
    def max_campaigns(self):
        if self.is_premium:
            return 100  # Unlimited
        elif self.is_basic:
            return 3
        else:
            return 1
    
    @property
    def max_surveys_per_campaign(self):
        if self.is_premium:
            return 100  # Unlimited
        elif self.is_basic:
            return 3
        else:
            return 1