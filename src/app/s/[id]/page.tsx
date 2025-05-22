'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { SurveyRenderer } from '@/components/surveys/survey-renderer';
import { GoogleReviewPrompt } from '@/components/surveys/google-review-prompt';
import { PromotionDisplay } from '@/components/surveys/promotion-display';

type Survey = Database['public']['Tables']['surveys']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Promotion = Database['public']['Tables']['promotions']['Row'];

export default function PublicSurveyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Survey flow state
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [reviewPromptResponse, setReviewPromptResponse] = useState<boolean | null>(null);
  const [showPromotion, setShowPromotion] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [surveyScore, setSurveyScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Fetch campaign
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .single();

        if (campaignError) {
          if (campaignError.code === 'PGRST116') {
            setError('This survey is not active or does not exist.');
          } else {
            setError('Error loading survey. Please try again later.');
          }
          return;
        }

        setCampaign(campaignData);

        // Fetch business profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', campaignData.profile_id)
          .single();

        if (profileError) {
          setError('Error loading business information.');
          return;
        }

        setProfile(profileData);

        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('campaign_id', id)
          .single();

        if (surveyError) {
          setError('Survey not found. It may have been removed.');
          return;
        }

        setSurvey(surveyData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('survey_id', surveyData.id)
          .order('order_index');

        if (questionsError) {
          setError('Error loading survey questions.');
          return;
        }

        setQuestions(questionsData || []);

        // Fetch available promotion
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .eq('campaign_id', id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!promotionsError && promotionsData && promotionsData.length > 0) {
          setPromotion(promotionsData[0]);
        }

      } catch (error) {
        console.error('Error fetching survey data:', error);
        setError('Unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [id, supabase]);

  const handleSurveySubmit = async (submissionData: any) => {
    try {
      // Calculate score from responses
      const score = submissionData.score;
      setSurveyScore(score);
      
      // Determine if review should be prompted based on threshold
      const shouldPromptReview = campaign 
        ? score >= campaign.review_threshold 
        : false;

      // Save response to database
      const { data, error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: survey!.id,
          answers: submissionData.responses,
          score: score,
          prompted_review: shouldPromptReview,
          submitted_review: false,
          promotion_claimed: false,
          // Collect IP for analytics/abuse prevention
          ip_address: window.location.hostname
        })
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setResponseId(data[0].id);
      }

      // Update flow state
      setSurveyCompleted(true);
      
      // Show review prompt if score meets threshold
      if (shouldPromptReview && profile?.google_review_link) {
        setShowReviewPrompt(true);
      } else {
        // Skip to promotion if not prompting for review
        setShowPromotion(true);
      }
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('There was an error submitting your responses. Please try again.');
    }
  };

  const handleReviewResponse = async (willReview: boolean) => {
    if (!responseId) return;
    
    try {
      // Update response in database
      await supabase
        .from('survey_responses')
        .update({
          submitted_review: willReview
        })
        .eq('id', responseId);
      
      setReviewPromptResponse(willReview);
      setShowReviewPrompt(false);
      setShowPromotion(true);
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handlePromotionClaimed = async () => {
    if (!responseId) return;
    
    try {
      // Update response in database
      await supabase
        .from('survey_responses')
        .update({
          promotion_claimed: true
        })
        .eq('id', responseId);
    } catch (error) {
      console.error('Error updating promotion status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading survey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!survey || !campaign || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h2>
          <p className="text-gray-600">
            The survey you're looking for is no longer available or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Company Header */}
      <header className="bg-white border-b py-4">
        <div className="container mx-auto px-4 flex items-center">
          {profile.logo_url ? (
            <img 
              src={profile.logo_url} 
              alt={profile.company_name || 'Company'} 
              className="h-10 w-auto mr-2"
            />
          ) : (
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-2">
              {profile.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <h1 className="text-xl font-semibold">
            {profile.company_name || 'Customer Feedback'}
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Survey Flow */}
          {!surveyCompleted && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <SurveyRenderer
                survey={survey}
                questions={questions}
                campaign={campaign}
                onSubmit={handleSurveySubmit}
              />
            </div>
          )}

          {/* Review Prompt */}
          {showReviewPrompt && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <GoogleReviewPrompt
                businessName={profile.company_name || 'this business'}
                googleReviewLink={profile.google_review_link || '#'}
                onResponse={handleReviewResponse}
              />
            </div>
          )}

          {/* Promotion Display */}
          {showPromotion && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <PromotionDisplay
                promotion={promotion}
                businessName={profile.company_name || 'this business'}
                onClaim={handlePromotionClaimed}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Powered by Review Return
        </div>
      </footer>
    </div>
  );
} 