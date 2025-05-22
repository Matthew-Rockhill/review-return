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
  Edit, 
  Trash, 
  Gift,
  CalendarClock
} from 'lucide-react';

type Promotion = {
  id: string;
  name: string;
  campaign_id: string;
  campaign_name?: string;
  created_at: string;
};

export default function PromotionsPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const res = await fetch('/api/promotions');
        const data = await res.json();
        setPromotions(data);
        setFilteredPromotions(data);
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, [user]);

  useEffect(() => {
    let result = [...promotions];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(promotion => 
        promotion.name.toLowerCase().includes(query) || 
        (promotion.campaign_name && promotion.campaign_name.toLowerCase().includes(query))
      );
    }
    
    setFilteredPromotions(result);
  }, [promotions, searchQuery]);

  const handleDeletePromotion = async (promotionId: string) => {
    if (!window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/promotions/${promotionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete promotion');
      }

      // Update local state
      setPromotions(prev => prev.filter(promotion => promotion.id !== promotionId));
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <Link href="/promotions/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Promotion
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search promotions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredPromotions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredPromotions.map((promotion) => (
              <li key={promotion.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                        <Gift className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-indigo-600">{promotion.name}</p>
                        <p className="text-sm text-gray-500">
                          Campaign: {promotion.campaign_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/promotions/${promotion.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePromotion(promotion.id)}
                      >
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Created: <span className="ml-1 font-medium">{formatDate(promotion.created_at)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No promotions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new promotion.</p>
            <div className="mt-6">
              <Link href="/promotions/new">
                <Button variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  New Promotion
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 