import { createClient } from '@supabase/supabase-js'

// Credentials Supabase - Base de données entreprise AUPREA
const supabaseUrl = 'https://mdiiypmblajwvmtosasz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kaWl5cG1ibGFqd3ZtdG9zYXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDAzMTgsImV4cCI6MjA4NTA3NjMxOH0._qHyETocKzH8RAhc94aewlMjAK0XXpmkYO04YQvG80Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase client initialized - AUPREA Enterprise Database')

// Nom de la table
export const LEADS_TABLE = 'leads_succession'
