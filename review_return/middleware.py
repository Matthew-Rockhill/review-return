# Create a new file: review_return/middleware.py

from django.utils.deprecation import MiddlewareMixin
from accounts.models import Business

class StaffBusinessMiddleware(MiddlewareMixin):
    """
    Middleware that ensures staff users have access to a business for testing purposes.
    """
    def process_request(self, request):
        if request.user.is_authenticated and request.user.is_staff:
            try:
                # Try to get the user's business
                business = request.user.business
            except:
                # For staff without a business, get first business or create one
                business = Business.objects.first()
                if not business:
                    business = Business.objects.create(
                        name="Test Business",
                        user=request.user,
                        address="Test Address",
                        phone="123-456-7890",
                        email=request.user.email
                    )
                
                # Dynamically attach the business to the user for this request only
                # This won't actually create a database relationship
                request.user.business = business