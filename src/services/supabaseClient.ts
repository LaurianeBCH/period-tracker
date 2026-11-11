import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hpdxgcqdyfgxexmmvfwi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Zkez3FClS5RAZsXXACP-SA_bi1acc1O';

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const rawUrl = metaEnv?.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const supabaseAnonKey = metaEnv?.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true
  }
});
