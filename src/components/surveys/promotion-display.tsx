'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Copy, CheckCircle } from 'lucide-react';
import { Database } from '@/types/database.types';

type Promotion = Database['public']['Tables']['promotions']['Row'] | null;

interface PromotionDisplayProps {
  promotion: Promotion;
  businessName: string;
  onClaim: () => void;
}

export function PromotionDisplay({
  promotion,
  businessName,
  onClaim
}: PromotionDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // Calculate if the promotion is expired
  const isExpired = promotion?.expiry_date 
    ? new Date(promotion.expiry_date) < new Date() 
    : false;

  const handleCopyCode = () => {
    if (!promotion) return;
    
    navigator.clipboard.writeText(promotion.code);
    setCopied(true);
    setClaimed(true);
    onClaim();
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  useEffect(() => {
    if (claimed) {
      onClaim();
    }
  }, [claimed, onClaim]);

  // No promotion available
  if (!promotion) {
    return (
      <div className="text-center py-6 space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Thank You for Your Feedback!
          </h2>
          <p className="text-gray-600">
            We appreciate you taking the time to share your thoughts with us.
          </p>
        </div>
      </div>
    );
  }

  // Promotion is expired
  if (isExpired) {
    return (
      <div className="text-center py-6 space-y-6">
        <div className="flex justify-center">
          <Gift className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Offer Expired
          </h2>
          <p className="text-gray-600">
            We're sorry, but this promotional offer has expired.
          </p>
          <p className="text-gray-600">
            Thank you for your feedback! We hope to see you again soon.
          </p>
        </div>
      </div>
    );
  }

  // Valid promotion
  return (
    <div className="text-center py-6 space-y-6">
      <div className="flex justify-center">
        <Gift className="h-16 w-16 text-indigo-600" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {claimed ? 'Promotion Claimed!' : 'Special Offer for You!'}
        </h2>
        <p className="text-lg text-gray-600">
          Thank you for sharing your feedback with {businessName}.
        </p>
        <p className="text-gray-600">
          {promotion.name}
        </p>
        {promotion.description && (
          <p className="text-gray-500 text-sm">
            {promotion.description}
          </p>
        )}
      </div>
      
      {/* Promotion Code */}
      <div className="pt-2">
        <div className="bg-gray-100 p-4 rounded-lg inline-block">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg font-bold tracking-wider">{promotion.code}</span>
            {!claimed && (
              <button
                onClick={handleCopyCode}
                className="text-indigo-600 hover:text-indigo-800"
                title="Copy code"
              >
                <Copy className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        {copied && (
          <p className="text-green-600 text-sm mt-2">
            Code copied to clipboard!
          </p>
        )}
        {promotion.expiry_date && (
          <p className="text-sm text-gray-500 mt-2">
            Valid until {new Date(promotion.expiry_date).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {!claimed && (
        <div className="pt-4">
          <Button
            onClick={handleCopyCode}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Copy Promotion Code
          </Button>
        </div>
      )}
    </div>
  );
} 