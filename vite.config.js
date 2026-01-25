import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          animations: ['framer-motion'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  },
  // SOLUTION DE DERNIER RECOURS : Credentials hardcodés
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://fdmdfzzluklmkchcsjha.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWRmenpsdWtsbWtjaGNzamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MjA1NTgsImV4cCI6MjA1MzM5NjU1OH0.zMnKzIGtgIRyaHF3DkF-j_vLKnfEbUOTpO6BqWuYCKk'),
  }
})
