# accounts/views.py
from django.shortcuts import render, redirect
from django.views.generic import CreateView, UpdateView, TemplateView
from django.contrib.auth.views import LoginView as BaseLoginView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy, reverse
from django.http import HttpResponse
from django.contrib import messages
from .models import User, Business, Subscription
from .forms import BusinessSignupForm, CustomAuthenticationForm
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

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
        # Update onboarding status if it's incomplete
        if form.instance.onboarding_status == Business.ONBOARDING_INCOMPLETE:
            form.instance.onboarding_status = Business.ONBOARDING_PROFILE
        
        messages.success(self.request, 'Your profile has been updated successfully!')
        return super().form_valid(form)



class NoBusinessProfileView(LoginRequiredMixin, TemplateView):
    """View for users without a business profile"""
    template_name = 'accounts/no_business_profile.html'


@login_required
def subscription_plans(request):
    """View available subscription plans"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Get current subscription if any
    try:
        subscription = business.subscription
    except:
        subscription = None
    
    context = {
        'business': business,
        'subscription': subscription,
    }
    return render(request, 'accounts/subscription_plans.html', context)


@login_required
def subscription_checkout(request, plan, subscription_type):
    """Checkout page for subscription"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Validate plan and subscription type
    if plan not in ['free', 'basic', 'premium']:
        plan = 'free'
    
    if subscription_type not in ['monthly', 'annual']:
        subscription_type = 'monthly'
    
    # For free plan, just create/update subscription
    if plan == 'free':
        # Create or update subscription
        subscription, created = Subscription.objects.get_or_create(
            business=business,
            defaults={
                'subscription_type': subscription_type,
                'plan': plan,
                'is_active': True
            }
        )
        
        if not created:
            subscription.subscription_type = subscription_type
            subscription.plan = plan
            subscription.is_active = True
            subscription.save()
        
        # Update onboarding status if it's at profile stage
        if business.onboarding_status == Business.ONBOARDING_PROFILE:
            business.onboarding_status = Business.ONBOARDING_SUBSCRIPTION
            business.save()
        
        messages.success(request, 'Your free subscription has been activated.')
        return redirect('portal:dashboard')
    
    # Generate payment form data using simulator
    from .payment_simulator import PaymentSimulator
    payment_data, payment_id = PaymentSimulator.generate_payment_form_data(
        business=business,
        plan=plan,
        subscription_type=subscription_type
    )
    
    context = {
        'business': business,
        'plan': plan,
        'subscription_type': subscription_type,
        'payment_data': payment_data,
    }
    return render(request, 'accounts/subscription_checkout.html', context)

@login_required
def process_payment(request):
    """Process simulated payment"""
    payment_id = request.POST.get('payment_id')
    if not payment_id:
        messages.error(request, 'Invalid payment data.')
        return redirect('accounts:subscription_plans')
    
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Process payment using simulator
    from .payment_simulator import PaymentSimulator
    success, payment_data = PaymentSimulator.process_payment(payment_id, business)
    
    if success:
        # Create or update subscription
        plan = payment_data['plan']
        subscription_type = payment_data['subscription_type']
        
        subscription, created = Subscription.objects.get_or_create(
            business=business,
            defaults={
                'subscription_type': subscription_type,
                'plan': plan,
                'is_active': True,
                'payfast_token': payment_data['token'],
                'next_billing_date': payment_data['next_billing_date']
            }
        )
        
        if not created:
            subscription.subscription_type = subscription_type
            subscription.plan = plan
            subscription.is_active = True
            subscription.payfast_token = payment_data['token']
            subscription.next_billing_date = payment_data['next_billing_date']
            subscription.save()
        
        # Update onboarding status if it's at profile stage
        if business.onboarding_status == Business.ONBOARDING_PROFILE:
            business.onboarding_status = Business.ONBOARDING_SUBSCRIPTION
            business.save()
        
        messages.success(request, f'Your {plan.title()} subscription has been activated successfully!')
        return redirect('portal:dashboard')
    else:
        messages.error(request, 'Payment processing failed. Please try again.')
        return redirect('accounts:subscription_plans')


@login_required
def subscription_success(request):
    """Successful subscription page"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    # Get payment data from PayFast
    payment_id = request.GET.get('m_payment_id', '')
    
    if payment_id:
        # Extract plan and subscription type from payment ID
        # Format: sub_business_id_plan_subscription_type
        try:
            parts = payment_id.split('_')
            plan = parts[2]
            subscription_type = parts[3]
            
            # Create or update subscription
            subscription, created = Subscription.objects.get_or_create(
                business=business,
                defaults={
                    'subscription_type': subscription_type,
                    'plan': plan,
                    'is_active': True,
                    'payfast_token': request.GET.get('token', '')
                }
            )
            
            if not created:
                subscription.subscription_type = subscription_type
                subscription.plan = plan
                subscription.is_active = True
                subscription.payfast_token = request.GET.get('token', '')
                subscription.save()
            
            # Update onboarding status if it's at profile stage
            if business.onboarding_status == Business.ONBOARDING_PROFILE:
                business.onboarding_status = Business.ONBOARDING_SUBSCRIPTION
                business.save()
                
            messages.success(request, f'Your {plan.title()} subscription has been activated.')
        except:
            messages.warning(request, 'There was an issue processing your payment. Please contact support.')
    
    return redirect('portal:dashboard')



@login_required
def onboarding(request):
    """Onboarding view for new businesses"""
    try:
        business = request.user.business
    except:
        return redirect('accounts:no_business_profile')
    
    context = {
        'business': business,
    }
    return render(request, 'accounts/onboarding.html', context)