# survey/models.py
from django.db import models
from django.utils import timezone
import uuid
from accounts.models import Business
from portal.models import Survey, Question, Choice, Promotion


class CustomerResponse(models.Model):
    """Customer's responses to a survey"""
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    avg_rating = models.FloatField(null=True, blank=True)  # Calculated average rating
    left_google_review = models.BooleanField(default=False)
    promotion_sent = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Response #{self.id} - {self.survey.business.name}"


class Answer(models.Model):
    """Individual answers to questions"""
    response = models.ForeignKey(CustomerResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text_answer = models.TextField(blank=True, null=True)
    rating_answer = models.IntegerField(blank=True, null=True)
    choice_answer = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Answer to {self.question.text}"


class PromotionIssued(models.Model):
    """Track promotions issued to customers"""
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='issued')
    customer_response = models.ForeignKey(CustomerResponse, on_delete=models.CASCADE, related_name='promotions')
    unique_code = models.CharField(max_length=50, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Promotion: {self.promotion.title} - {self.unique_code}"
    
    def save(self, *args, **kwargs):
        if not self.unique_code:
            self.unique_code = str(uuid.uuid4()).split('-')[0].upper()
        super().save(*args, **kwargs)
