import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fdmdfzzluklmkchcsjha.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWRmenpsdWtsbWtjaGNzamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MjA1NTgsImV4cCI6MjA1MzM5NjU1OH0.zMnKzIGtgIRyaHF3DkF-j_vLKnfEbUOTpO6BqWuYCKk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Table name
export const LEADS_TABLE = 'leads_succession'
