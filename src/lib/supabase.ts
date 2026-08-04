import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};

function isValidHttpUrl(str: string) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseConfig() {
  const url = (
    metaEnv.VITE_SUPABASE_URL ||
    localStorage.getItem('app_supabase_url') ||
    ''
  ).trim();
  const key = (
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem('app_supabase_key') ||
    ''
  ).trim();

  const isConfigured = Boolean(
    url &&
    key &&
    isValidHttpUrl(url) &&
    !url.includes('your-project') &&
    !url.includes('YOUR_SUPABASE')
  );

  return { url, key, isConfigured };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url) localStorage.setItem('app_supabase_url', url.trim());
  else localStorage.removeItem('app_supabase_url');

  if (key) localStorage.setItem('app_supabase_key', key.trim());
  else localStorage.removeItem('app_supabase_key');
}

export function clearSupabaseConfig() {
  localStorage.removeItem('app_supabase_url');
  localStorage.removeItem('app_supabase_key');
}

let cachedClient: SupabaseClient | null = null;
let cachedClientUrl = '';
let cachedClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (cachedClient && cachedClientUrl === url && cachedClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
      },
    });
    cachedClientUrl = url;
    cachedClientKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase Init Warning]', err);
    return null;
  }
}

export const isSupabaseConfigured = Boolean(getSupabaseConfig().isConfigured);
export const supabase = getSupabaseClient();


