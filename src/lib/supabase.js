import { createClient } from '@supabase/supabase-js'

// Récupération des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log de debug (visible dans la console navigateur)
console.log('🔍 Supabase Config Check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD
})

// Validation des credentials
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing!')
}
if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing!')
}

// Création du client Supabase
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Nom de la table
export const LEADS_TABLE = 'leads_succession'
