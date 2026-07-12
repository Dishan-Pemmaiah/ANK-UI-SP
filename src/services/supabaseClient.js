import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim();
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackAnonKey = 'placeholder-anon-key';

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const resolvedSupabaseUrl = isValidHttpUrl(supabaseUrl) ? supabaseUrl : fallbackUrl;
const resolvedSupabaseAnonKey = supabaseAnonKey || fallbackAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep startup non-fatal in development so env vars can be added later.
  // Runtime requests will fail with a clear message from the helper calls.
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
}

if (supabaseUrl && !isValidHttpUrl(supabaseUrl)) {
  // eslint-disable-next-line no-console
  console.warn('REACT_APP_SUPABASE_URL is invalid. It must be a full URL like https://<project-ref>.supabase.co');
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey);
