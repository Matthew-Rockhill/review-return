// src/app/(dashboard)/campaigns/[id]/survey/preview/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Database } from '@/types/database.types';
import { SurveyRenderer } from '@/components/surveys/survey-renderer';

type Survey = Database['public']['Tables']['surveys']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];

export default function SurveyPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);

        // Fetch campaign to check if it belongs to user
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('profile_id', user.id)
          .single();

        if (campaignError) {
          throw new Error('Campaign not found or access denied');
        }

        setCampaign(campaignData);

        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('campaign_id', id)
          .single();

        if (surveyError) {
          throw surveyError;
        }

        setSurvey(surveyData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('survey_id', surveyData.id)
          .order('order_index');

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

      } catch (error) {
        console.error('Error fetching survey data:', error);
        router.push(`/campaigns/${id}/survey`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [user, id, supabase, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading survey preview...</p>
      </div>
    );
  }

  if (!survey || !campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Survey not found</h2>
        <p className="mt-2 text-gray-500">Unable to load the survey for this campaign.</p>
        <Link href={`/campaigns/${id}/survey`}>
          <Button variant="primary" className="mt-6">
            Back to Survey Editor
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/campaigns/${id}/survey`} className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Survey Preview</h1>
        </div>
      </div>

      {/* Preview Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          This is a preview of how your survey will appear to customers. No data will be saved when submitting in preview mode.
        </p>
      </div>

      {/* Survey Preview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-3xl mx-auto">
        <SurveyRenderer
          survey={survey}
          questions={questions}
          campaign={campaign}
          isPreview={true}
          onSubmit={() => {
            // In preview mode, just show a success message
            alert('Survey submitted successfully! (Preview Mode)');
          }}
        />
      </div>
    </div>
  );
}