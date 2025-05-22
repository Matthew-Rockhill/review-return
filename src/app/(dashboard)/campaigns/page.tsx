// src/app/(dashboard)/campaigns/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  MoreVertical,
  Trash,
  Edit,
  Pause,
  Play
} from 'lucide-react';

type Campaign = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'created_at',
    direction: 'desc',
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user]);

  useEffect(() => {
    let result = [...campaigns];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(campaign => campaign.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(query)
      );
    }
    
    setFilteredCampaigns(result);
  }, [campaigns, searchQuery, statusFilter]);

  const handleSort = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleStatusChange = async (campaignId: string, newStatus: 'draft' | 'active' | 'paused' | 'completed') => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update campaign status');
      }

      // Update local state
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus } 
            : campaign
        )
      );
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete campaign');
      }

      // Update local state
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-3"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredCampaigns.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            <li className="bg-gray-50 px-6 py-4 hidden md:flex items-center text-sm font-medium text-gray-500">
              <div className="flex-1 flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                Name
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
              <div className="w-24 flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                Status
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
              <div className="w-36 flex items-center cursor-pointer" onClick={() => handleSort('created_at')}>
                Created
                <ArrowUpDown className="ml-1 h-4 w-4" />
              </div>
              <div className="w-36 invisible md:visible">Actions</div>
            </li>
            {filteredCampaigns.map((campaign) => (
              <li key={campaign.id}>
                <div className="flex items-center px-6 py-4 md:px-6 md:py-4 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <Link href={`/campaigns/${campaign.id}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-indigo-600 truncate">{campaign.name}</p>
                    </Link>
                  </div>
                  <div className="hidden md:block w-24">
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
                  </div>
                  <div className="hidden md:block w-36 text-sm text-gray-500">{formatDate(campaign.created_at)}</div>
                  <div className="hidden md:flex w-36 justify-end items-center space-x-2">
                    {campaign.status === 'draft' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'paused')}
                      >
                        <Pause className="h-4 w-4 text-orange-600" />
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleStatusChange(campaign.id, 'active')}
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Link href={`/campaigns/${campaign.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="block md:hidden">
                    <Button variant="ghost" size="sm" className="ml-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">No campaigns found</p>
            {campaigns.length > 0 ? (
              <p className="text-sm text-gray-400">Try changing your filters or search query</p>
            ) : (
              <Link href="/campaigns/new">
                <Button variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}