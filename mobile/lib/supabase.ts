import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config'

// ─── Initialization Guard ────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Supabase] FATAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY. ' +
    'Check constants/config.ts and environment variables.'
  )
}

// ─── Client ──────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

if (__DEV__) {
  console.log('[Supabase] Client initialized with URL:', SUPABASE_URL)
}
