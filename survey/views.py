# survey/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from accounts.models import Business
from portal.models import Survey, Question, Choice, Promotion
from .models import CustomerResponse, Answer, PromotionIssued
import uuid


def survey_landing(request, business_uuid):
    """Landing page when customer scans QR code"""
    business = get_object_or_404(Business, unique_identifier=business_uuid)
    active_survey = Survey.objects.filter(business=business, is_active=True).first()
    
    if not active_survey:
        return render(request, 'survey/no_active_survey.html', {'business': business})
    
    context = {
        'business': business,
        'survey': active_survey,
    }
    return render(request, 'survey/survey_landing.html', context)


def take_survey(request, business_uuid):
    """Take the survey page"""
    business = get_object_or_404(Business, unique_identifier=business_uuid)
    survey = Survey.objects.filter(business=business, is_active=True).first()
    
    if not survey:
        return render(request, 'survey/no_active_survey.html', {'business': business})
    
    if request.method == 'POST':
        # Process survey submission
        customer_name = request.POST.get('customer_name', '')
        customer_email = request.POST.get('customer_email', '')
        customer_phone = request.POST.get('customer_phone', '')
        
        # Create customer response
        response = CustomerResponse.objects.create(
            survey=survey,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        # Process answers and calculate average rating
        rating_sum = 0
        rating_count = 0
        
        for question in survey.questions.all():
            answer_key = f'question_{question.id}'
            
            if question.question_type == Question.RATING:
                rating_value = request.POST.get(answer_key)
                if rating_value:
                    rating_value = int(rating_value)
                    Answer.objects.create(
                        response=response,
                        question=question,
                        rating_answer=rating_value
                    )
                    rating_sum += rating_value
                    rating_count += 1
            
            elif question.question_type == Question.TEXT:
                text_value = request.POST.get(answer_key, '')
                if text_value:
                    Answer.objects.create(
                        response=response,
                        question=question,
                        text_answer=text_value
                    )
            
            elif question.question_type == Question.MULTIPLE_CHOICE:
                choice_id = request.POST.get(answer_key)
                if choice_id:
                    choice = Choice.objects.get(id=choice_id)
                    Answer.objects.create(
                        response=response,
                        question=question,
                        choice_answer=choice
                    )
        
        # Calculate and save average rating
        if rating_count > 0:
            response.avg_rating = rating_sum / rating_count
            response.save()
        
        # Determine next step based on rating
        if response.avg_rating and response.avg_rating >= 4.0:  # High rating
            # Send to Google review page
            return redirect('survey:google_review_request', response_id=response.id)
        else:
            # Send directly to thank you with promotion
            return redirect('survey:thank_you', response_id=response.id)
    
    context = {
        'business': business,
        'survey': survey,
        'questions': survey.questions.all(),
    }
    return render(request, 'survey/take_survey.html', context)


def google_review_request(request, response_id):
    """Ask customer to leave a Google review"""
    response = get_object_or_404(CustomerResponse, id=response_id)
    business = response.survey.business
    
    if request.method == 'POST':
        # Mark that they've been asked to leave a review
        response.left_google_review = True
        response.save()
        return redirect('survey:thank_you', response_id=response.id)
    
    context = {
        'business': business,
        'response': response,
        'google_review_url': business.google_review_url,
    }
    return render(request, 'survey/google_review.html', context)


def thank_you(request, response_id):
    """Thank you page with promotion"""
    response = get_object_or_404(CustomerResponse, id=response_id)
    business = response.survey.business
    
    # Find eligible promotion based on rating
    promotion = None
    promotion_issued = None
    
    if response.avg_rating:
        promotion = Promotion.objects.filter(
            business=business,
            is_active=True,
            min_rating_required__lte=response.avg_rating
        ).first()
    
    # Create promotion redemption if not already created and a promotion exists
    if promotion and not response.promotions.exists():
        promotion_issued = PromotionIssued.objects.create(
            promotion=promotion,
            customer_response=response
        )
        response.promotion_sent = True
        response.save()
    elif response.promotions.exists():
        promotion_issued = response.promotions.first()
    
    context = {
        'business': business,
        'response': response,
        'promotion': promotion,
        'promotion_issued': promotion_issued,
    }
    return render(request, 'survey/thank_you.html', context)


def promotion_details(request, unique_code):
    """View a specific promotion by its unique code"""
    promotion_issued = get_object_or_404(PromotionIssued, unique_code=unique_code)
    promotion = promotion_issued.promotion
    business = promotion.business
    
    if not promotion.is_valid():
        context = {
            'business': business,
            'promotion_issued': promotion_issued,
            'promotion': promotion,
            'expired': True
        }
    else:
        context = {
            'business': business,
            'promotion_issued': promotion_issued,
            'promotion': promotion,
            'expired': False
        }
    
    return render(request, 'survey/promotion_details.html', context)