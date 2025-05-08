from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

def landing_page(request):
    """Landing page for the Review Return website"""
    return render(request, 'marketing/index.html')

def how_it_works(request):
    """How It Works page explaining the product"""
    return render(request, 'marketing/how_it_works.html')