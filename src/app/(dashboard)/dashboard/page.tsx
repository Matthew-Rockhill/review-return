// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Plus, 
  BarChart, 
  Users, 
  Star,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/data');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/campaigns/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="greeting-card bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-semibold">
          Welcome back, {profile?.company_name || 'there'}!
        </h2>
        <p className="mt-2 opacity-90">
          Manage your review campaigns and track customer feedback in one place.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <BarChart className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Campaigns
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data?.totalCampaigns || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Campaigns
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data?.activeCampaigns || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Responses
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data?.totalResponses || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data?.averageRating ? `${data.averageRating}/5` : 'N/A'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Campaigns
          </h3>
        </div>
        <div className="bg-white divide-y divide-gray-200">
          {data?.recentCampaigns && data.recentCampaigns.length > 0 ? (
            data.recentCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <h4 className="text-sm font-medium">{campaign.name}</h4>
                  <p className="text-sm text-gray-500">
                    Created on {campaign.created_at}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
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
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button variant="ghost" size="sm" className="ml-4">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No campaigns yet</p>
              <Link href="/campaigns/new">
                <Button variant="primary" className="mt-4">
                  Create your first campaign
                </Button>
              </Link>
            </div>
          )}
        </div>
        {data?.recentCampaigns && data.recentCampaigns.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <Link
              href="/campaigns"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              View all campaigns
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Getting Started */}
      {data?.recentCampaigns && data.recentCampaigns.length === 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Getting Started
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Create a campaign</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by creating your first campaign with a custom survey.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Add your Google review link</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Connect your Google Business profile to prompt customers for reviews.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Create promotions</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Set up promotional codes or vouchers to encourage customers to return.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                    4
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Share with customers</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Print QR codes or share links with your customers to start collecting feedback.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/campaigns/new">
                <Button variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}