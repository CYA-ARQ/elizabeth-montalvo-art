import { createClient } from '@supabase/supabase-js'

// The URL and anon key are public client identifiers. Row Level Security is the
// actual authorization boundary; no privileged key is ever shipped to browsers.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://dkxykxvisqefumuvtgdt.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreHlreHZpc3FlZnVtdXZ0Z2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjE2MTYsImV4cCI6MjEwNjc5NzYxNn0.lNe-GNferhSO1ZLvpDpusxGXdnwCzLmU2JJ7J0gX-_E'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const adminUsername = (import.meta.env.VITE_ADMIN_USERNAME || 'martha')
  .trim()
  .toLowerCase()
const adminEmail =
  import.meta.env.VITE_ADMIN_EMAIL || 'martha.admin@portfolio.invalid'

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null

export function getAdminEmail(username) {
  return username.trim().toLowerCase() === adminUsername ? adminEmail : null
}
