# hq/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView, TemplateView
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.contrib import messages
from django.db.models import Count, Avg, Sum
from accounts.models import Business, User
from portal.models import Survey, Promotion
from survey.models import CustomerResponse


# Helper function to check if user is staff
def is_staff(user):
    return user.is_staff


@login_required
@user_passes_test(is_staff)
def hq_home(request):
    """Dashboard home with key metrics for admin users"""
    # Fetch stats about businesses, survey responses, etc.
    businesses_count = Business.objects.count()
    responses_count = CustomerResponse.objects.count()
    google_reviews_count = CustomerResponse.objects.filter(left_google_review=True).count()
    avg_rating = CustomerResponse.objects.aggregate(avg=Avg('avg_rating'))['avg'] or 0
    
    # Recent businesses
    recent_businesses = Business.objects.order_by('-created_at')[:5]
    
    # Recent responses
    recent_responses = CustomerResponse.objects.order_by('-created_at')[:10]
    
    context = {
        'businesses_count': businesses_count,
        'responses_count': responses_count,
        'google_reviews_count': google_reviews_count,
        'avg_rating': round(avg_rating, 1),
        'recent_businesses': recent_businesses,
        'recent_responses': recent_responses,
    }
    return render(request, 'hq/home.html', context)


# Staff-only mixin for class-based views
class StaffRequiredMixin(UserPassesTestMixin):
    """Mixin that requires the user to be staff"""
    def test_func(self):
        return self.request.user.is_staff


class BusinessListView(LoginRequiredMixin, StaffRequiredMixin, ListView):
    """List all businesses for admin"""
    model = Business
    template_name = 'hq/business_list.html'
    context_object_name = 'businesses'
    ordering = ['-created_at']


class BusinessDetailView(LoginRequiredMixin, StaffRequiredMixin, DetailView):
    """View business details"""
    model = Business
    template_name = 'hq/business_detail.html'
    context_object_name = 'business'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        business = self.get_object()
        
        # Add survey and response data
        context['surveys'] = business.surveys.all()
        context['recent_responses'] = CustomerResponse.objects.filter(
            survey__business=business
        ).order_by('-created_at')[:10]
        
        # Add statistics
        context['total_responses'] = CustomerResponse.objects.filter(
            survey__business=business
        ).count()
        context['google_reviews'] = CustomerResponse.objects.filter(
            survey__business=business,
            left_google_review=True
        ).count()
        
        return context


class BusinessCreateView(LoginRequiredMixin, StaffRequiredMixin, CreateView):
    """Create new business"""
    model = Business
    template_name = 'hq/business_form.html'
    fields = ['name', 'address', 'phone', 'email', 'website', 
              'google_review_url', 'logo']
    success_url = reverse_lazy('hq:business_list')
    
    def form_valid(self, form):
        # Create a user account for this business
        # Using get_user_model() instead of directly importing User
        from django.contrib.auth import get_user_model
        import random
        import string
        
        User = get_user_model()  # Get the active User model
        email = form.cleaned_data['email']
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
        else:
            user = User.objects.create_user(
                email=email,
                password=password
            )
        
        # Associate user with business
        form.instance.user = user
        messages.success(self.request, f'Business created successfully! Temporary password: {password}')
        return super().form_valid(form)

class BusinessUpdateView(LoginRequiredMixin, StaffRequiredMixin, UpdateView):
    """Update business details"""
    model = Business
    template_name = 'hq/business_form.html'
    fields = ['name', 'address', 'phone', 'email', 'website', 
              'google_review_url', 'logo']
    success_url = reverse_lazy('hq:business_list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Business updated successfully!')
        return super().form_valid(form)


class BusinessDeleteView(LoginRequiredMixin, StaffRequiredMixin, DeleteView):
    """Delete a business"""
    model = Business
    template_name = 'hq/business_confirm_delete.html'
    success_url = reverse_lazy('hq:business_list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Business deleted successfully!')
        return super().delete(request, *args, **kwargs)


class AnalyticsView(LoginRequiredMixin, StaffRequiredMixin, TemplateView):
    """Analytics view for admins"""
    template_name = 'hq/analytics.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Count statistics
        businesses_count = Business.objects.count()
        responses_count = CustomerResponse.objects.count()
        google_reviews_count = CustomerResponse.objects.filter(left_google_review=True).count()
        avg_rating = CustomerResponse.objects.aggregate(avg=Avg('avg_rating'))['avg'] or 0
        
        # Monthly trends (last 6 months)
        from django.db.models.functions import TruncMonth
        from datetime import datetime, timedelta
        
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_responses = CustomerResponse.objects.filter(created_at__gte=six_months_ago) \
            .annotate(month=TruncMonth('created_at')) \
            .values('month') \
            .annotate(count=Count('id'), avg_rating=Avg('avg_rating')) \
            .order_by('month')
        
        # Top performing businesses (by rating)
        top_businesses_by_rating = Business.objects.annotate(
            avg_rating=Avg('surveys__responses__avg_rating'),
            responses_count=Count('surveys__responses')
        ).filter(responses_count__gt=5).order_by('-avg_rating')[:10]
        
        # Top businesses by response count
        top_businesses_by_responses = Business.objects.annotate(
            responses_count=Count('surveys__responses')
        ).order_by('-responses_count')[:10]
        
        context.update({
            'businesses_count': businesses_count,
            'responses_count': responses_count,
            'google_reviews_count': google_reviews_count,
            'avg_rating': round(avg_rating, 1),
            'monthly_responses': monthly_responses,
            'top_businesses_by_rating': top_businesses_by_rating,
            'top_businesses_by_responses': top_businesses_by_responses,
        })
        
        return context


class ResponsesListView(LoginRequiredMixin, StaffRequiredMixin, ListView):
    """List all responses for admin"""
    model = CustomerResponse
    template_name = 'hq/responses_list.html'
    context_object_name = 'responses'
    ordering = ['-created_at']
    paginate_by = 50
    

class ResponseDetailView(LoginRequiredMixin, StaffRequiredMixin, DetailView):
    """View response details"""
    model = CustomerResponse
    template_name = 'hq/response_detail.html'
    context_object_name = 'response'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        response = self.get_object()
        
        context['business'] = response.survey.business
        context['answers'] = response.answers.all().select_related('question')
        
        return context