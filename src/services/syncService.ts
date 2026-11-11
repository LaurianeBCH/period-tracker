import type { UserSettings } from '../types/cycle.ts';
import { DEFAULT_SETTINGS } from './storage.ts';
import { supabase } from './supabaseClient.ts';

export interface CloudCyclePayload {
  settings: Partial<UserSettings>;
  period_dates: string[];
}

/**
 * Pure helper that merges local cycle data with cloud cycle data:
 * - Deduplicates and chronologically sorts all ISO dates ('YYYY-MM-DD').
 * - Preserves cloud settings when available and ensures `isOnboarded: true` if either side is onboarded or has dates.
 */
export function mergeCycleData(
  localSettings: UserSettings,
  localDates: string[],
  cloudPayload: CloudCyclePayload | null
): { settings: UserSettings; periodDates: string[] } {
  const cloudDates = Array.isArray(cloudPayload?.period_dates) ? cloudPayload.period_dates : [];
  const mergedDates = Array.from(new Set([...cloudDates, ...localDates])).sort();

  if (cloudPayload && cloudPayload.settings && Object.keys(cloudPayload.settings).length > 0) {
    const mergedSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      ...localSettings,
      ...cloudPayload.settings,
      isOnboarded: true
    };
    return {
      settings: mergedSettings,
      periodDates: mergedDates
    };
  }

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...localSettings,
      isOnboarded: Boolean(localSettings.isOnboarded || mergedDates.length > 0)
    },
    periodDates: mergedDates
  };
}

/**
 * Builds the full redirect URL within the PWA scope (e.g. https://.../period-tracker/)
 * so clicking the Magic Link opens or focuses the installed PWA.
 */
export function getAuthRedirectUrl(
  origin: string,
  baseUrl: string = '/period-tracker/'
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(normalizedBase, origin).href;
}

/**
 * Sends a Supabase Magic Link confirmation email to create or sign in to an account.
 */
export async function sendMagicLink(email: string): Promise<{ error: string | null }> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { error: 'Veuillez saisir une adresse email valide.' };
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const baseUrl = metaEnv?.BASE_URL || '/period-tracker/';
  const redirectTo =
    typeof window !== 'undefined' && window.location?.origin
      ? getAuthRedirectUrl(window.location.origin, baseUrl)
      : undefined;

  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Pulls the user's cloud cycle data from Supabase, merges with local data,
 * and pushes the merged state back to Supabase.
 */
export async function pullAndMergeCloudData(
  userId: string,
  localSettings: UserSettings,
  localDates: string[]
): Promise<{ settings: UserSettings; periodDates: string[] } | null> {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('user_cycle_data')
    .select('settings, period_dates')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching cycle data from Supabase:', error);
    return null;
  }

  const merged = mergeCycleData(
    localSettings,
    localDates,
    data as CloudCyclePayload | null
  );

  await pushCloudData(userId, merged.settings, merged.periodDates);
  return merged;
}

/**
 * Upserts the user's settings and periodDates into Supabase `user_cycle_data`.
 */
export async function pushCloudData(
  userId: string,
  settings: UserSettings,
  periodDates: string[]
): Promise<void> {
  if (!supabase || !userId) return;

  const cleanDates = Array.from(new Set(periodDates)).sort();
  const { error } = await supabase.from('user_cycle_data').upsert(
    {
      user_id: userId,
      settings,
      period_dates: cleanDates,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    console.error('Error pushing cycle data to Supabase:', error);
  }
}

/**
 * Signs out the current device from Supabase.
 */
export async function signOutAccount(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Deletes the user's cycle data and account from Supabase, then signs out.
 */
export async function deleteUserAccount(userId: string): Promise<{ error: string | null }> {
  if (!supabase || !userId) {
    return { error: null };
  }

  // Delete row from user_cycle_data first
  const { error: deleteRowError } = await supabase
    .from('user_cycle_data')
    .delete()
    .eq('user_id', userId);

  if (deleteRowError) {
    console.error('Error deleting user_cycle_data row:', deleteRowError);
  }

  // Attempt to delete the auth user via the security definer RPC
  const { error: rpcError } = await supabase.rpc('delete_user_account');
  if (rpcError) {
    console.warn('RPC delete_user_account fallback to signOut:', rpcError.message);
  }

  await supabase.auth.signOut();
  return { error: null };
}
