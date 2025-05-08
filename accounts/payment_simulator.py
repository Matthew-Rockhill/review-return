# accounts/payment_simulator.py - Replace PayFast integration

import uuid
from datetime import datetime, timedelta

class PaymentSimulator:
    """Simulates payment processing for development and testing"""
    
    @staticmethod
    def generate_payment_form_data(business, plan, subscription_type):
        """Generate simulated payment data"""
        # Determine amount based on plan and subscription type
        if plan == 'premium':
            amount = 299.00 if subscription_type == 'monthly' else 2990.00
            item_name = "Review Return Premium"
        elif plan == 'basic':
            amount = 149.00 if subscription_type == 'monthly' else 1490.00
            item_name = "Review Return Basic"
        else:
            amount = 0.00
            item_name = "Review Return Free"
        
        # For annual, apply discount
        if subscription_type == 'annual':
            item_name += " (Annual)"
        else:
            item_name += " (Monthly)"
        
        # Create a unique payment ID
        payment_id = f"sim_{business.id}_{plan}_{subscription_type}_{uuid.uuid4().hex[:8]}"
        
        # Create simulated data
        data = {
            'payment_id': payment_id,
            'business_id': business.id,
            'plan': plan,
            'subscription_type': subscription_type,
            'amount': f"{amount:.2f}",
            'item_name': item_name,
        }
        
        return data, payment_id
    
    @staticmethod
    def process_payment(payment_id, business):
        """Process a simulated payment"""
        # Extract plan and subscription type from payment ID
        # Format: sim_business_id_plan_subscription_type_uuid
        parts = payment_id.split('_')
        if len(parts) < 5 or parts[0] != 'sim':
            return False, "Invalid payment ID"
        
        plan = parts[2]
        subscription_type = parts[3]
        
        # Calculate next billing date
        today = datetime.now().date()
        if subscription_type == 'monthly':
            if today.month == 12:
                next_billing_date = today.replace(year=today.year+1, month=1)
            else:
                next_billing_date = today.replace(month=today.month+1)
        else:  # annual
            next_billing_date = today.replace(year=today.year+1)
        
        # Return successful payment data
        return True, {
            'payment_id': payment_id,
            'plan': plan,
            'subscription_type': subscription_type,
            'token': uuid.uuid4().hex,
            'next_billing_date': next_billing_date,
            'status': 'COMPLETE'
        }