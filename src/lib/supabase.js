import { createClient } from '@supabase/supabase-js'
// Force rebuild with environment variables

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing:', { 
    url: !!supabaseUrl, 
    key: !!supabaseAnonKey 
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const LEADS_TABLE = 'leads_succession'
