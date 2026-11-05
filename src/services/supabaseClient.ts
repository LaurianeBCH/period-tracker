import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const supabaseUrl = metaEnv?.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = metaEnv?.VITE_SUPABASE_ANON_KEY?.trim() || '';

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
