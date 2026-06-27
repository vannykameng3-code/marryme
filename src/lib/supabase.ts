import { createClient } from '@supabase/supabase-js';

// Using window.env if available (for Vercel injection), fallback to import.meta.env, 
// and finally fallback to placeholder strings that can be manually replaced.

const globalEnv = (window as any).env || {};

export const supabaseUrl = 
  globalEnv.SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://placeholder.supabase.co';

export const supabaseAnonKey = 
  globalEnv.SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
