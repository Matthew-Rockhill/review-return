'use client';

import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface GoogleReviewPromptProps {
  businessName: string;
  googleReviewLink: string;
  onResponse: (willReview: boolean) => void;
}

export function GoogleReviewPrompt({
  businessName,
  googleReviewLink,
  onResponse
}: GoogleReviewPromptProps) {
  const handleReviewClick = () => {
    // Open Google review page in a new tab
    window.open(googleReviewLink, '_blank');
    // Signal that the user clicked to review
    onResponse(true);
  };

  const handleSkipClick = () => {
    // Signal that the user declined to review
    onResponse(false);
  };

  return (
    <div className="text-center py-6 space-y-6">
      <div className="flex justify-center">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-12 w-12 text-yellow-400 fill-yellow-400" />
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Thank You for Your Feedback!
        </h2>
        <p className="text-lg text-gray-600">
          We're glad to hear that you had a good experience with {businessName}.
        </p>
        <p className="text-gray-600">
          Would you mind taking a moment to share your experience with others by leaving a Google review?
        </p>
      </div>
      
      <div className="pt-4 space-y-3">
        <Button
          onClick={handleReviewClick}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
          size="lg"
        >
          Leave a Google Review
        </Button>
        <div>
          <button
            onClick={handleSkipClick}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
} 