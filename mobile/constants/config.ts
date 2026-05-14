// ─── Supabase Configuration ───────────────────────────────────────────
// CORRECT key verified against Supabase API on 2026-05-14
// Project ref: qscucnieaqkttqzxofbc (note: x, not h)
export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://qscucnieaqkttqzxofbc.supabase.co'

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzY3VjbmllYXFrdHRxenhvZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODc1NjIsImV4cCI6MjA5NDA2MzU2Mn0.Oy5qkGTcsr_Su8I2oOCBc21kWb-sXCQlkdxhTYHptAs'

export const APP_SCHEME = 'neofit'
export const APP_NAME = 'Neofit'

// ─── Runtime Validation ──────────────────────────────────────────────
// Catches undefined env vars, stale keys, or whitespace corruption
if (__DEV__) {
  const validate = () => {
    console.log('[Config] SUPABASE_URL:', SUPABASE_URL)
    console.log('[Config] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY?.slice(0, 30) + '...')

    if (!SUPABASE_URL || SUPABASE_URL === 'undefined') {
      console.error('🔴 [Config] SUPABASE_URL is undefined or empty!')
    }
    if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined') {
      console.error('🔴 [Config] SUPABASE_ANON_KEY is undefined or empty!')
    }
    if (SUPABASE_URL.includes(' ') || SUPABASE_ANON_KEY.includes(' ')) {
      console.error('🔴 [Config] Whitespace detected in Supabase credentials!')
    }

    // Validate JWT structure
    const parts = SUPABASE_ANON_KEY.split('.')
    if (parts.length !== 3) {
      console.error('🔴 [Config] Anon key is not a valid JWT (expected 3 parts, got', parts.length, ')')
    } else {
      try {
        const payload = JSON.parse(atob(parts[1]))
        const urlRef = SUPABASE_URL.replace('https://', '').split('.')[0]
        if (payload.ref !== urlRef) {
          console.error(`🔴 [Config] KEY MISMATCH! JWT ref="${payload.ref}" but URL ref="${urlRef}"`)
        } else {
          console.log('✅ [Config] Supabase credentials validated — ref:', payload.ref)
        }
      } catch {
        console.error('🔴 [Config] Failed to decode anon key JWT payload')
      }
    }
  }
  validate()
}
