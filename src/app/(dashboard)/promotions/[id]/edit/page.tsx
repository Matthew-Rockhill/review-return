'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { Database } from '@/types/database.types';

type Promotion = Database['public']['Tables']['promotions']['Row'];
type Campaign = Database['public']['Tables']['campaigns']['Row'];

const promotionSchema = z.object({
  name: z.string().min(1, { message: 'Promotion name is required' }),
  description: z.string().optional(),
  code: z.string().min(1, { message: 'Promotion code is required' }),
  campaign_id: z.string().min(1, { message: 'Campaign is required' }),
  is_unique: z.boolean().default(false),
  expiry_date: z.string().optional(),
  max_uses: z.number().optional(),
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

export default function EditPromotionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
      is_unique: false,
      campaign_id: '',
    },
  });

  const isUnique = watch('is_unique');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);
        
        // Fetch campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });

        if (campaignsError) throw campaignsError;
        setCampaigns(campaignsData || []);
        
        // Fetch promotion
        const { data: promotionData, error: promotionError } = await supabase
          .from('promotions')
          .select('*')
          .eq('id', id)
          .single();

        if (promotionError) {
          throw promotionError;
        }
        
        // Verify promotion belongs to user's campaign
        const belongsToUser = campaignsData?.some(
          campaign => campaign.id === promotionData.campaign_id
        );
        
        if (!belongsToUser) {
          throw new Error('You do not have permission to edit this promotion');
        }
        
        setPromotion(promotionData);
        
        // Set form values
        reset({
          name: promotionData.name,
          description: promotionData.description || '',
          code: promotionData.code,
          campaign_id: promotionData.campaign_id,
          is_unique: promotionData.is_unique,
          expiry_date: promotionData.expiry_date 
            ? new Date(promotionData.expiry_date).toISOString().split('T')[0] 
            : '',
          max_uses: promotionData.max_uses || undefined,
        });
        
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error?.message || 'Failed to load promotion. Please try again.');
        router.push('/promotions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, id, supabase, reset, router]);

  const onSubmit = async (data: PromotionFormValues) => {
    if (!user || !promotion) return;

    try {
      setIsLoading(true);
      setError(null);

      // Update promotion
      const { error: updateError } = await supabase
        .from('promotions')
        .update({
          campaign_id: data.campaign_id,
          name: data.name,
          description: data.description || null,
          code: data.code,
          is_unique: data.is_unique,
          expiry_date: data.expiry_date || null,
          max_uses: data.max_uses || null,
        })
        .eq('id', promotion.id);

      if (updateError) throw updateError;

      router.push('/promotions');
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      setError(error?.message || 'Failed to update promotion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        <p className="mt-4 text-lg text-slate-600">Loading promotion data...</p>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Promotion not found</h2>
        <p className="mt-2 text-gray-500">The promotion you're looking for doesn't exist or you don't have access to it.</p>
        <Link href="/promotions">
          <Button variant="primary" className="mt-6">
            Back to Promotions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/promotions" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Promotion</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign_id">Campaign</Label>
              <select
                id="campaign_id"
                {...register('campaign_id')}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.campaign_id ? 'border-red-500' : ''
                }`}
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              {errors.campaign_id && (
                <p className="mt-1 text-sm text-red-600">{errors.campaign_id.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Promotion Name</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Description <span className="text-gray-400">(optional)</span>
              </Label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <Label htmlFor="code">Promotion Code</Label>
              <Input
                id="code"
                {...register('code')}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="expiry_date">
                  Expiration Date <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="expiry_date"
                  type="date"
                  {...register('expiry_date')}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label htmlFor="max_uses">
                  Maximum Uses <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  {...register('max_uses', { valueAsNumber: true })}
                  placeholder="Unlimited if not specified"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_unique"
                checked={isUnique}
                onCheckedChange={(checked) => setValue('is_unique', checked)}
              />
              <Label htmlFor="is_unique">Generate Unique Codes for Each Customer</Label>
            </div>
            {isUnique && (
              <div className="ml-7 text-sm text-gray-500">
                <p>
                  When enabled, a unique version of this code will be generated for each customer.
                  This helps with tracking and prevents code sharing.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Link href="/promotions">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 