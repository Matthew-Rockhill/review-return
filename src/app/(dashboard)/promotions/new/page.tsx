'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewPromotionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: user?.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to create promotion');
      }

      router.push('/promotions');
    } catch (error) {
      console.error('Error creating promotion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/promotions" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Promotion</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Promotion Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 10% Off Next Purchase"
              required
            />
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
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  Create Promotion
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 