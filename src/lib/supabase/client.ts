// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

// Create a single supabase client for the entire session for client-side operations
export const createBrowserClient = () => {
  return createClientComponentClient<Database>();
};

// For server components and API routes
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
};