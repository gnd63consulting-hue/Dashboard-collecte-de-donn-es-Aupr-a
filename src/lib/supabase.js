import { createClient } from '@supabase/supabase-js'

// Credentials hardcodés - les variables d'environnement Vercel ne fonctionnent pas
const supabaseUrl = 'https://fdmdfzzluklmkchcsjha.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWRmenpsdWtsbWtjaGNzamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDQxOTgsImV4cCI6MjA4NDg4MDE5OH0.TPaPlHezyzbvvpTxHG_-CIoN-LT5chU7Pry3HM3hS6w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase client initialized with hardcoded credentials')

// Nom de la table
export const LEADS_TABLE = 'leads_succession'
