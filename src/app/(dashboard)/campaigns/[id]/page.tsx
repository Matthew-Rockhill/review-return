// src/app/(dashboard)/campaigns/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import { formatDate, generateShareableLink } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Download,
  Share,
  QrCode,
  Eye,
  Mail,
  Play,
  Pause,
  Copy,
  Settings,
  PlusCircle,
  TextQuote,
  Gift
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { Database } from '@/types/database.types';
import { Tab } from '@/components/ui/tab';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type Survey = Database['public']['Tables']['surveys']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Promotion = Database['public']['Tables']['promotions']['Row'];
type SurveyResponse = Database['public']['Tables']['survey_responses']['Row'];

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copySuccess, setCopySuccess] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>('');

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);
        
        // Fetch campaign details
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .eq('profile_id', user.id)
          .single();

        if (campaignError) throw campaignError;
        setCampaign(campaignData);
        
        // Generate share link if not already set
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        const link = campaignData.share_link || generateShareableLink(baseUrl, id);
        setShareLink(link);

        if (!campaignData.share_link || !campaignData.qr_code_url) {
          // Update campaign with share link and QR code URL
          const qrCodeDataUrl = await generateQRCode(link);
          setQrCode(qrCodeDataUrl);
          
          const { error: updateError } = await supabase
            .from('campaigns')
            .update({
              share_link: link,
              qr_code_url: qrCodeDataUrl
            })
            .eq('id', id);
            
          if (updateError) console.error('Error updating campaign with share link:', updateError);
        } else {
          setQrCode(campaignData.qr_code_url);
        }

        // Fetch survey
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('campaign_id', id)
          .single();

        if (surveyError && surveyError.code !== 'PGRST116') {
          throw surveyError;
        }
        
        setSurvey(surveyData || null);
        
        if (surveyData) {
          // Fetch questions
          const { data: questionsData, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('survey_id', surveyData.id)
            .order('order_index');

          if (questionsError) throw questionsError;
          setQuestions(questionsData || []);
          
          // Fetch responses
          const { data: responsesData, error: responsesError } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('survey_id', surveyData.id)
            .order('created_at', { ascending: false });

          if (responsesError) throw responsesError;
          setResponses(responsesData || []);
        }
        
        // Fetch promotions
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .eq('campaign_id', id);

        if (promotionsError) throw promotionsError;
        setPromotions(promotionsData || []);
        
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        // Redirect to campaigns list if campaign doesn't exist or doesn't belong to user
        router.push('/campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [user, id, supabase, router]);

  const generateQRCode = async (url: string): Promise<string> => {
    // This is a simple way to create a QR code data URL
    // In a production app, you might want to use a server-side service
    return url;
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'active' | 'paused' | 'completed') => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      // Update local state
      setCampaign({ ...campaign, status: newStatus });
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;

    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      router.push('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${campaign?.name.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading campaign data...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Campaign not found</h2>
        <p className="mt-2 text-gray-500">The campaign you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/campaigns">
          <Button variant="primary" className="mt-6">
            Back to Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <Link href="/campaigns" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">
              Created on {formatDate(campaign.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {campaign.status === 'draft' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('active')}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          {campaign.status === 'active' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('paused')}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button 
              variant="outline" 
              onClick={() => handleStatusChange('active')}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={handleDeleteCampaign}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Link href={`/campaigns/${id}/edit`}>
            <Button variant="primary">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center bg-white rounded-lg p-4 shadow-sm border">
        <div className="mr-4">
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              campaign.status === 'active'
                ? 'bg-green-100 text-green-800'
                : campaign.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : campaign.status === 'paused'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">
            {campaign.status === 'draft' && 'This campaign is in draft mode and not visible to customers.'}
            {campaign.status === 'active' && 'This campaign is active and visible to customers.'}
            {campaign.status === 'paused' && 'This campaign is paused and not visible to customers.'}
            {campaign.status === 'completed' && 'This campaign is completed and no longer accepting responses.'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            className={`py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'survey'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('survey')}
          >
            <TextQuote className="h-4 w-4 mr-2" />
            Survey
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {questions.length}
            </span>
          </button>
          <button
            className={`py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'promotions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('promotions')}
          >
            <Gift className="h-4 w-4 mr-2" />
            Promotions
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {promotions.length}
            </span>
          </button>
          <button
            className={`py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'sharing'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sharing')}
          >
            <Share className="h-4 w-4 mr-2" />
            Sharing
          </button>
          <button
            className={`py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'responses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('responses')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Responses
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {responses.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Campaign Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm border col-span-2">
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">
                      {campaign.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Review Threshold</h3>
                      <p className="mt-1">{campaign.review_threshold} / {campaign.max_review_score}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Google Review Link</h3>
                      <p className="mt-1">
                        {profile?.google_review_link ? (
                          <a 
                            href={profile.google_review_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            View Google Review Page
                          </a>
                        ) : (
                          <span className="text-orange-500">
                            Not set. <Link href="/settings" className="underline">Add in settings</Link>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/campaigns/${id}/edit`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Campaign Stats</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
                    <p className="mt-1 text-3xl font-semibold">{responses.length}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reviews Prompted</h3>
                    <p className="mt-1 text-3xl font-semibold">
                      {responses.filter(r => r.prompted_review).length}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Promotions Claimed</h3>
                    <p className="mt-1 text-3xl font-semibold">
                      {responses.filter(r => r.promotion_claimed).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/campaigns/${id}/survey`}>
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Edit Survey Questions
                  </Button>
                </Link>
                <Link href={`/campaigns/${id}/promotions/new`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    Add Promotion
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('sharing')}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  View QR Code
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {activeTab === 'survey' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Survey Questions</h2>
              {/* Survey question content would go here */}
              <Link href={`/campaigns/${id}/survey`}>
                <Button variant="primary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Survey
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Promotions</h2>
              {/* Promotions content would go here */}
              <Link href={`/campaigns/${id}/promotions/new`}>
                <Button variant="primary">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Promotion
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">QR Code & Sharing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                  {qrCode && (
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <QRCode value={shareLink} size={200} />
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleDownloadQRCode}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Share Link</h3>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm"
                    />
                    <Button
                      variant="primary"
                      className="rounded-l-none"
                      onClick={handleCopyShareLink}
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                      <Copy className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Share this link with your customers or print the QR code to place in your business.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Survey Responses</h2>
              {/* Responses content would go here */}
              {responses.length === 0 ? (
                <p className="text-gray-500">No responses yet.</p>
              ) : (
                <p>View all {responses.length} responses</p>
                // Table of responses would go here
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}