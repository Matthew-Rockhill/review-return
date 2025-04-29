# hq/templatetags/dashboard_filters.py
from django import template
from django.db.models import Avg

register = template.Library()

@register.filter
def calculate_avg_rating(business):
    """Calculate average rating for a business across all surveys and responses"""
    avg = 0
    if hasattr(business, 'surveys'):
        total_rating = 0
        total_responses = 0
        
        for survey in business.surveys.all():
            responses = survey.responses.all()
            for response in responses:
                if response.avg_rating:
                    total_rating += response.avg_rating
                    total_responses += 1
        
        if total_responses > 0:
            avg = total_rating / total_responses
    
    return avg

@register.filter
def regroup_by(queryset, key):
    """Regroup a QuerySet by a related field or attribute.
    Usage example: {% with grouped_items=items|regroup_by:"category.name" %}
    """
    result = []
    
    # Split the key if it's nested (e.g., "category.name")
    keys = key.split('.')
    
    # Create a group for each item
    for item in queryset:
        value = item
        for k in keys:
            if hasattr(value, k):
                value = getattr(value, k)
            elif isinstance(value, dict) and k in value:
                value = value[k]
            else:
                value = None
                break
        
        result.append(value)
    
    return result

@register.filter
def avg_values(values):
    """Calculate the average of a list of values, removing None values"""
    valid_values = [v for v in values if v is not None]
    if valid_values:
        return sum(valid_values) / len(valid_values)
    return None