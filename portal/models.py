# portal/models.py
from django.db import models
from django.utils import timezone
from accounts.models import Business

class Campaign(models.Model):
    """Campaign model for organizing surveys, promotions, and review criteria"""
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Review prompt threshold - the minimum rating to prompt for a Google review
    review_threshold = models.FloatField(default=4.0,
        help_text="Minimum average rating to prompt for a Google review")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business.name} - {self.name}"
        
    @property
    def total_responses(self):
        """Get total responses across all surveys in this campaign"""
        count = 0
        for survey in self.surveys.all():
            count += survey.responses.count()
        return count
        
    @property
    def google_reviews_count(self):
        """Get count of Google reviews from this campaign"""
        from survey.models import CustomerResponse
        return CustomerResponse.objects.filter(
            survey__campaign=self,
            left_google_review=True
        ).count()


class Survey(models.Model):
    """Survey model for storing questions created by businesses"""
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='surveys')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='surveys', null=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business.name} - {self.title}"


class Question(models.Model):
    """Questions that make up a survey"""
    RATING = 'rating'
    TEXT = 'text'
    MULTIPLE_CHOICE = 'multiple_choice'
    
    QUESTION_TYPES = [
        (RATING, 'Rating'),
        (TEXT, 'Text'),
        (MULTIPLE_CHOICE, 'Multiple Choice'),
    ]
    
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.survey.title} - {self.text}"
    
    class Meta:
        ordering = ['order']


class Choice(models.Model):
    """Choices for multiple choice questions"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return self.text
    
    class Meta:
        ordering = ['order']
        

class Promotion(models.Model):
    """Promotional offers created by businesses"""
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='promotions')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='promotions', null=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    discount_value = models.CharField(max_length=50)  # Could be percentage or fixed amount
    promo_code = models.CharField(max_length=50, blank=True, null=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    min_rating_required = models.FloatField(default=0.0)  # Minimum rating needed to receive this promo
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.business.name} - {self.title}"
    
    def is_valid(self):
        """Check if promotion is currently valid based on dates and active status"""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        return now >= self.valid_from

