# portal/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import CreateView, UpdateView, DeleteView, ListView, DetailView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.db.models import Avg, Count
from .models import Survey, Question, Choice, Promotion, Campaign
from survey.models import CustomerResponse
from accounts.models import Business

@login_required
def manage_campaigns(request):
    """List and manage campaigns"""
    try:
        business = request.user.business
        campaigns = Campaign.objects.filter(business=business)
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
        'campaigns': campaigns,
    }
    return render(request, 'portal/campaigns.html', context)


class CampaignCreateView(LoginRequiredMixin, CreateView):
    """Create a new campaign"""
    model = Campaign
    template_name = 'portal/campaign_form.html'
    fields = ['name', 'description', 'is_active', 'review_threshold']
    success_url = reverse_lazy('portal:manage_campaigns')
    
    def form_valid(self, form):
        try:
            business = self.request.user.business
            form.instance.business = business
            
            # Update onboarding status if it's at subscription stage
            if business.onboarding_status == Business.ONBOARDING_SUBSCRIPTION:
                business.onboarding_status = Business.ONBOARDING_CAMPAIGN
                business.save()
                
        except:
            return redirect('accounts:no_business_profile')
        
        messages.success(self.request, 'Campaign created successfully!')
        return super().form_valid(form)


class CampaignUpdateView(LoginRequiredMixin, UpdateView):
    """Update an existing campaign"""
    model = Campaign
    template_name = 'portal/campaign_form.html'
    fields = ['name', 'description', 'is_active', 'review_threshold']
    success_url = reverse_lazy('portal:manage_campaigns')
    
    def get_queryset(self):
        """Only allow the business owner to update their campaigns"""
        return Campaign.objects.filter(business=self.request.user.business)
    
    def form_valid(self, form):
        messages.success(self.request, 'Campaign updated successfully!')
        return super().form_valid(form)


class CampaignDeleteView(LoginRequiredMixin, DeleteView):
    """Delete a campaign"""
    model = Campaign
    template_name = 'portal/campaign_confirm_delete.html'
    success_url = reverse_lazy('portal:manage_campaigns')
    
    def get_queryset(self):
        """Only allow the business owner to delete their campaigns"""
        return Campaign.objects.filter(business=self.request.user.business)
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Campaign deleted successfully!')
        return super().delete(request, *args, **kwargs)


@login_required
def campaign_detail(request, pk):
    """View campaign details and performance"""
    try:
        business = request.user.business
        campaign = get_object_or_404(Campaign, pk=pk, business=business)
    except:
        return redirect('accounts:no_business_profile')
    
    # Get all surveys in this campaign
    surveys = Survey.objects.filter(campaign=campaign)
    
    # Get all promotions in this campaign
    promotions = Promotion.objects.filter(campaign=campaign)
    
    # Get response data
    from survey.models import CustomerResponse
    responses = CustomerResponse.objects.filter(survey__campaign=campaign)
    
    # Calculate stats
    total_responses = responses.count()
    google_reviews = responses.filter(left_google_review=True).count()
    avg_rating = responses.aggregate(avg=Avg('avg_rating'))['avg'] or 0
    
    context = {
        'business': business,
        'campaign': campaign,
        'surveys': surveys,
        'promotions': promotions,
        'total_responses': total_responses,
        'google_reviews': google_reviews,
        'avg_rating': round(avg_rating, 1),
    }
    return render(request, 'portal/campaign_detail.html', context)


@login_required
def client_dashboard(request):
    """Dashboard for business clients"""
    # For staff users, we'll try to get the business but not redirect if missing
    if request.user.is_staff:
        # For dev purposes, either get the first business or create one for testing
        business = Business.objects.first()
        if not business:
            # Create a test business for the staff user if none exists
            business = Business.objects.create(
                name="Test Business",
                user=request.user,
                address="Test Address",
                phone="123-456-7890",
                email=request.user.email
            )
    else:
        # Regular users must have a business profile
        try:
            business = request.user.business
        except:
            return redirect('accounts:no_business_profile')
    
    # Get business stats
    responses = CustomerResponse.objects.filter(survey__business=business)
    total_responses = responses.count()
    avg_rating = responses.aggregate(avg=Avg('avg_rating'))['avg'] or 0
    google_reviews = responses.filter(left_google_review=True).count()
    
    # Recent responses
    recent_responses = responses.order_by('-created_at')[:5]
    
    context = {
        'business': business,
        'total_responses': total_responses,
        'avg_rating': round(avg_rating, 1),
        'google_reviews': google_reviews,
        'recent_responses': recent_responses,
    }
    return render(request, 'portal/dashboard.html', context)


@login_required
def manage_surveys(request):
    """List and manage surveys"""
    try:
        business = request.user.business
        surveys = Survey.objects.filter(business=business)
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
        'surveys': surveys,
    }
    return render(request, 'portal/surveys.html', context)


class SurveyCreateView(LoginRequiredMixin, CreateView):
    """Create a new survey"""
    model = Survey
    template_name = 'portal/survey_form.html'
    fields = ['title', 'description', 'is_active', 'campaign']
    success_url = reverse_lazy('portal:manage_surveys')
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        # Limit campaign choices to this business
        try:
            business = self.request.user.business
            form.fields['campaign'].queryset = Campaign.objects.filter(business=business)
            
            # If campaign was passed in URL query param, preselect it
            campaign_id = self.request.GET.get('campaign')
            if campaign_id:
                try:
                    form.fields['campaign'].initial = Campaign.objects.get(id=campaign_id, business=business)
                except:
                    pass
                    
        except:
            pass
        return form
    
    def form_valid(self, form):
        try:
            business = self.request.user.business
            form.instance.business = business
            
            # Update onboarding status if it's at campaign stage
            if business.onboarding_status == Business.ONBOARDING_CAMPAIGN:
                business.onboarding_status = Business.ONBOARDING_COMPLETE
                business.save()
                
        except:
            return redirect('accounts:no_business_profile')
        
        messages.success(self.request, 'Survey created successfully!')
        return super().form_valid(form)
    
    def get_success_url(self):
        # If this was created from a campaign detail page, return there
        if self.object.campaign:
            return reverse_lazy('portal:campaign_detail', kwargs={'pk': self.object.campaign.id})
        return self.success_url


class SurveyUpdateView(LoginRequiredMixin, UpdateView):
    """Update an existing survey"""
    model = Survey
    template_name = 'portal/survey_form.html'
    fields = ['title', 'description', 'is_active']
    success_url = reverse_lazy('portal:manage_surveys')
    
    def get_queryset(self):
        """Only allow the business owner to update their surveys"""
        return Survey.objects.filter(business=self.request.user.business)
    
    def form_valid(self, form):
        messages.success(self.request, 'Survey updated successfully!')
        return super().form_valid(form)


class SurveyDeleteView(LoginRequiredMixin, DeleteView):
    """Delete a survey"""
    model = Survey
    template_name = 'portal/survey_confirm_delete.html'
    success_url = reverse_lazy('portal:manage_surveys')
    
    def get_queryset(self):
        """Only allow the business owner to delete their surveys"""
        return Survey.objects.filter(business=self.request.user.business)
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Survey deleted successfully!')
        return super().delete(request, *args, **kwargs)


@login_required
def survey_questions(request, survey_id):
    """Add or edit questions for a survey"""
    survey = get_object_or_404(Survey, id=survey_id, business=request.user.business)
    
    if request.method == 'POST':
        # Process question form data
        question_type = request.POST.get('question_type')
        question_text = request.POST.get('question_text')
        required = request.POST.get('required', False) == 'on'
        
        # Create the question
        question = Question.objects.create(
            survey=survey,
            text=question_text,
            question_type=question_type,
            required=required,
            order=survey.questions.count() + 1
        )
        
        # If multiple choice, create the choices
        if question_type == Question.MULTIPLE_CHOICE:
            choices = request.POST.getlist('choices[]')
            for i, choice_text in enumerate(choices):
                if choice_text.strip():
                    Choice.objects.create(
                        question=question,
                        text=choice_text,
                        order=i+1
                    )
        
        messages.success(request, 'Question added successfully!')
        return redirect('portal:survey_questions', survey_id=survey.id)
    
    context = {
        'survey': survey,
        'questions': survey.questions.all(),
    }
    return render(request, 'portal/survey_questions.html', context)


@login_required
def manage_promotions(request):
    """List and manage promotions"""
    try:
        business = request.user.business
        promotions = Promotion.objects.filter(business=business)
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
        'promotions': promotions,
    }
    return render(request, 'portal/promotions.html', context)


class PromotionCreateView(LoginRequiredMixin, CreateView):
    """Create a new promotion"""
    model = Promotion
    template_name = 'portal/promotion_form.html'
    fields = ['title', 'description', 'discount_value', 'promo_code', 
              'valid_from', 'valid_until', 'is_active', 'min_rating_required', 'campaign']
    success_url = reverse_lazy('portal:manage_promotions')
    
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        # Limit campaign choices to this business
        try:
            business = self.request.user.business
            form.fields['campaign'].queryset = Campaign.objects.filter(business=business)
            
            # If campaign was passed in URL query param, preselect it
            campaign_id = self.request.GET.get('campaign')
            if campaign_id:
                try:
                    form.fields['campaign'].initial = Campaign.objects.get(id=campaign_id, business=business)
                except:
                    pass
                    
        except:
            pass
        return form
    
    def form_valid(self, form):
        try:
            business = self.request.user.business
            form.instance.business = business
        except:
            return redirect('accounts:no_business_profile')
        
        messages.success(self.request, 'Promotion created successfully!')
        return super().form_valid(form)
    
    def get_success_url(self):
        # If this was created from a campaign detail page, return there
        if self.object.campaign:
            return reverse_lazy('portal:campaign_detail', kwargs={'pk': self.object.campaign.id})
        return self.success_url
    
class PromotionUpdateView(LoginRequiredMixin, UpdateView):
    """Update an existing promotion"""
    model = Promotion
    template_name = 'portal/promotion_form.html'
    fields = ['title', 'description', 'discount_value', 'promo_code', 
              'valid_from', 'valid_until', 'is_active', 'min_rating_required']
    success_url = reverse_lazy('portal:manage_promotions')
    
    def get_queryset(self):
        """Only allow the business owner to update their promotions"""
        return Promotion.objects.filter(business=self.request.user.business)
    
    def form_valid(self, form):
        messages.success(self.request, 'Promotion updated successfully!')
        return super().form_valid(form)


class PromotionDeleteView(LoginRequiredMixin, DeleteView):
    """Delete a promotion"""
    model = Promotion
    template_name = 'portal/promotion_confirm_delete.html'
    success_url = reverse_lazy('portal:manage_promotions')
    
    def get_queryset(self):
        """Only allow the business owner to delete their promotions"""
        return Promotion.objects.filter(business=self.request.user.business)
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Promotion deleted successfully!')
        return super().delete(request, *args, **kwargs)


@login_required
def business_qr_code(request):
    """Display and allow download of the business QR code"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Check if campaign ID is provided
    campaign_id = request.GET.get('campaign')
    campaign = None
    
    if campaign_id:
        try:
            campaign = Campaign.objects.get(id=campaign_id, business=business)
        except Campaign.DoesNotExist:
            pass
    
    # Get all campaigns for dropdown
    campaigns = Campaign.objects.filter(business=business)
    
    # Generate QR code if needed
    if campaign:
        # Generate campaign-specific QR code
        buffer, filename = business.generate_campaign_qr_code(campaign)
        
        # Create a temporary file in memory
        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage
        
        # Save the file to storage and get its URL
        temp_path = f'temp_qr_codes/{filename}'
        default_storage.save(temp_path, ContentFile(buffer.getvalue()))
        qr_code_url = default_storage.url(temp_path)
    else:
        # Use general business QR code
        if not business.qr_code:
            buffer, filename = business.generate_campaign_qr_code()
            from django.core.files.base import ContentFile
            business.qr_code.save(filename, ContentFile(buffer.getvalue()))
            business.save()
        qr_code_url = business.qr_code.url
    
    context = {
        'business': business,
        'campaign': campaign,
        'campaigns': campaigns,
        'qr_code_url': qr_code_url
    }
    return render(request, 'portal/qr_code.html', context)


@login_required
def response_list(request):
    """List all customer responses"""
    try:
        business = request.user.business
        responses = CustomerResponse.objects.filter(survey__business=business).order_by('-created_at')
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
        'responses': responses
    }
    return render(request, 'portal/response_list.html', context)


@login_required
def response_detail(request, pk):
    """View details of a customer response"""
    try:
        business = request.user.business
        response = get_object_or_404(CustomerResponse, pk=pk, survey__business=business)
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
        'response': response,
        'answers': response.answers.all().select_related('question')
    }
    return render(request, 'portal/response_detail.html', context)


@login_required
def business_analytics(request):
    """Display business analytics"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Get responses
    responses = CustomerResponse.objects.filter(survey__business=business)
    
    # Calculate metrics
    total_responses = responses.count()
    avg_rating = responses.aggregate(avg=Avg('avg_rating'))['avg'] or 0
    google_reviews = responses.filter(left_google_review=True).count()
    
    # Monthly trends (last 6 months)
    from django.db.models.functions import TruncMonth
    from datetime import datetime, timedelta
    
    six_months_ago = datetime.now() - timedelta(days=180)
    monthly_responses = responses.filter(created_at__gte=six_months_ago) \
        .annotate(month=TruncMonth('created_at')) \
        .values('month') \
        .annotate(count=Count('id'), avg_rating=Avg('avg_rating')) \
        .order_by('month')
    
    context = {
        'business': business,
        'total_responses': total_responses,
        'avg_rating': round(avg_rating, 1),
        'google_reviews': google_reviews,
        'monthly_responses': monthly_responses,
    }
    return render(request, 'portal/analytics.html', context)


@login_required
def business_profile(request):
    """Redirect to the accounts profile view"""
    return redirect('accounts:profile')