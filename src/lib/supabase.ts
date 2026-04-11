// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  ? import.meta.env.VITE_SUPABASE_URL 
  : (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') || '';

const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
