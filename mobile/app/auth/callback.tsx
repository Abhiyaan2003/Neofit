import { useEffect, useRef, useState, useCallback } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'

import * as Linking from 'expo-linking'
import { useRouter, useGlobalSearchParams, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/store/auth.store'

import { supabase } from '@/lib/supabase'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config'

import {
  Colors,
  FontSize,
  FontWeight,
} from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()
  const incomingUrl = Linking.useURL()
  const globalParams = useGlobalSearchParams()
  const localParams = useLocalSearchParams<{ url?: string }>()
  const { setSession } = useAuthStore()
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [statusText, setStatusText] = useState('Completing secure login...')

  // ─── Startup Validation ──────────────────────────────────────────
  useEffect(() => {
    console.log('[AuthCallback] Mounted')
    console.log('[AuthCallback] SUPABASE_URL:', SUPABASE_URL)
    console.log('[AuthCallback] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ present' : '🔴 MISSING')

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('[AuthCallback] 🔴 FATAL: Supabase credentials are missing!')
      Alert.alert('Configuration Error', 'Supabase credentials are missing. Please reinstall the app.')
    }
  }, [])

  // ─── State Orchestration ─────────────────────────────────────────
  const processingKey = useRef<string | null>(null)
  const authResolved = useRef(false)
  const authInProgress = useRef(false)
  const navigationTriggered = useRef(false)
  const isCancelled = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initial State Reset (Fast Refresh / Hot Reload safety)
  useEffect(() => {
    authResolved.current = false
    navigationTriggered.current = false
    isCancelled.current = false
  }, [])

  // ─── Async Infrastructure ────────────────────────────────────────
  const shouldAbort = useCallback(() => isCancelled.current, [])

  const sleep = useCallback(
    async (ms: number): Promise<boolean> => {
      const interval = 50
      let elapsed = 0

      while (elapsed < ms) {
        if (shouldAbort()) {
          console.log('[AuthCallback] sleep() aborted early')
          return false
        }

        await new Promise(resolve =>
          setTimeout(resolve, Math.min(interval, ms - elapsed))
        )

        elapsed += interval
      }

      return !shouldAbort()
    },
    [shouldAbort]
  )

  const abortToLogin = useCallback((reason: string) => {
    if (shouldAbort()) return
    
    console.error('[AuthCallback] ABORT:', reason)
    if (!isCancelled.current) {
      Alert.alert('Login Failed', reason)
    }

    isCancelled.current = true
    authResolved.current = true
    navigationTriggered.current = true
    
    router.replace('/(auth)/login')
  }, [router, shouldAbort])

  const finalizeAuth = useCallback(async () => {
    // Double-execution guard
    if (authResolved.current || navigationTriggered.current) {
      console.log('[AuthCallback] finalizeAuth already resolved or triggered, skipping...')
      return
    }
    
    console.log('[AuthCallback] Finalizing auth resolution...')
    setStatusText('Verifying session...')
    
    try {
      // Immediate Session Verification
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('[AuthCallback] No session found during finalization')
        throw new Error('Session missing during finalization')
      }

      // Lock AFTER session confirmation
      authResolved.current = true
      navigationTriggered.current = true

      console.log('[AuthCallback] Session verified for:', session.user?.email)
      setStatusText('Session verified! Entering app...')
      
      // Store Sync
      setSession(session)

      // Zustand Propagation Delay
      const ok = await sleep(300)
      if (!ok) {
        console.log('[AuthCallback] Navigation aborted during store sync delay')
        return
      }

      // Final Navigation
      console.log('[AuthCallback] SUCCESS: Authentication resolved. Entering app.')
      router.replace('/')

      // Clear timeout after successful navigation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      console.log('[AuthCallback] Auth flow COMPLETE')
    } catch (err: any) {
      console.error('[AuthCallback] Finalization error:', err.message)
      abortToLogin(err.message || 'Session verification failed')
    }
  }, [router, setSession, sleep, abortToLogin])

  // ─── URL Sync ────────────────────────────────────────────────────
  useEffect(() => {
    const urlToSync = localParams.url || incomingUrl
    if (urlToSync) {
      setCurrentUrl(prev => {
        if (prev !== urlToSync) {
          console.log('[AuthCallback] URL Sync:', urlToSync)
          return urlToSync
        }
        return prev
      })
    }
  }, [incomingUrl, localParams.url])

  // ─── Deep Link Listener ──────────────────────────────────────────
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url && !shouldAbort()) {
        console.log('[AuthCallback] Deep link received:', url)
        setCurrentUrl(url)
      }
    })
    return () => {
      subscription.remove()
      isCancelled.current = true
    }
  }, [shouldAbort])

  // ─── Global Timeout (20s) ────────────────────────────────────────
  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      if (isCancelled.current || authResolved.current || navigationTriggered.current) return

      console.log('[AuthCallback] Timeout check: verifying session before abort...')
      setStatusText('Checking session status...')
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('[AuthCallback] Timeout hit but session exists, recovering...')
          await finalizeAuth()
          return
        }
      } catch (err: any) {
        console.error('[AuthCallback] Timeout session check failed:', err.message)
      }

      console.error('[AuthCallback] Global Timeout triggered — no session after 20s')
      abortToLogin('Login process timed out. Please check your internet connection and try again.')
    }, 20000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [shouldAbort, finalizeAuth, abortToLogin])

  // ─── Auth Processing Core ────────────────────────────────────────
  const codeParam = typeof globalParams.code === 'string' ? globalParams.code : Array.isArray(globalParams.code) ? globalParams.code[0] : null
  const tokenParam = typeof globalParams.access_token === 'string' ? globalParams.access_token : Array.isArray(globalParams.access_token) ? globalParams.access_token[0] : null
  const errorParam = typeof globalParams.error === 'string' ? globalParams.error : typeof globalParams.error_description === 'string' ? globalParams.error_description : null

  useEffect(() => {
    const handleAuth = async () => {
      if (shouldAbort()) return
      
      const authParams: Record<string, string> = {}
      if (codeParam) authParams.code = codeParam
      if (tokenParam) authParams.access_token = tokenParam
      if (errorParam) authParams.error = errorParam

      if (currentUrl) {
        try {
          const queryIdx = currentUrl.indexOf('?')
          const hashIdx = currentUrl.indexOf('#')
          
          let queryStr = ''
          let hashStr = ''
          
          if (queryIdx > -1) {
            queryStr = currentUrl.substring(queryIdx + 1, hashIdx > -1 ? hashIdx : undefined)
          }
          if (hashIdx > -1) {
            hashStr = currentUrl.substring(hashIdx + 1)
          }

          const parsePairs = (str: string) => {
            if (!str) return
            str.split('&').forEach(part => {
              const eqIdx = part.indexOf('=')
              if (eqIdx > -1) {
                const key = decodeURIComponent(part.slice(0, eqIdx))
                const val = decodeURIComponent(part.slice(eqIdx + 1))
                if (key) authParams[key] = val
              }
            })
          }
          
          parsePairs(queryStr)
          parsePairs(hashStr)
        } catch (e) {
          console.error('[AuthCallback] URL parse error:', e)
        }
      }

      const hasDirectParams = !!(authParams.code || authParams.access_token || authParams.error)
      if (!currentUrl && !hasDirectParams) return
      
      const procKey = currentUrl || JSON.stringify(authParams)
      if (processingKey.current === procKey) return
      if (authInProgress.current) return
      
      try {
        authInProgress.current = true
        processingKey.current = procKey
        console.log('[AuthCallback] Processing START')
        console.log('[AuthCallback] Auth params keys:', Object.keys(authParams))
        setStatusText('Processing authentication...')

        // A. Early Session Check
        const { data: { session: preSession } } = await supabase.auth.getSession()
        if (preSession) {
          console.log('[AuthCallback] Active session found early')
          await finalizeAuth()
          return
        }

        if (shouldAbort()) return

        // B. Error check
        const error = authParams.error || authParams.error_description
        if (error) throw new Error(error)

        // C. PKCE Flow
        if (authParams.code) {
          console.log('[AuthCallback] PKCE Exchange start')
          setStatusText('Exchanging authorization code...')
          
          const { data, error: pkceErr } = await supabase.auth.exchangeCodeForSession(authParams.code)
          
          if (pkceErr) {
            console.error('[AuthCallback] PKCE error:', pkceErr.message)
            
            // Check if session was created despite error (auto-restoration)
            const { data: { session: pkceRetry } } = await supabase.auth.getSession()
            if (pkceRetry) {
              console.log('[AuthCallback] PKCE success via auto-restoration')
              await finalizeAuth()
              return
            }
            throw pkceErr
          }
          
          console.log('[AuthCallback] PKCE exchange successful')
          await finalizeAuth()
          return
        }

        // D. Implicit Flow
        const at = authParams.access_token
        const rt = authParams.refresh_token
        if (at && rt) {
          console.log('[AuthCallback] Implicit Flow start')
          setStatusText('Setting session tokens...')
          
          const { error: impErr } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          })
          if (impErr) throw impErr
          await finalizeAuth()
          return
        }

        // E. Hydration Loop (4 retries with backoff)
        console.log('[AuthCallback] No direct data, entering backoff hydration loop...')
        setStatusText('Waiting for session...')
        const intervals = [500, 1000, 1500, 2000]
        
        for (let i = 0; i < intervals.length; i++) {
          if (shouldAbort()) return
          
          console.log(`[AuthCallback] Hydration check ${i+1}/${intervals.length}`)
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (retrySession) {
            console.log('[AuthCallback] Session hydrated in loop')
            await finalizeAuth()
            return
          }
          
          const ok = await sleep(intervals[i])
          if (!ok) {
            console.log('[AuthCallback] Hydration loop aborted')
            return
          }
        }

        if (!shouldAbort()) {
          throw new Error('Authentication parameters invalid or session missing')
        }
      } catch (err: any) {
        console.error('[AuthCallback] Auth error:', err.message)
        abortToLogin(err.message || 'Unknown authentication error')
      } finally {
        authInProgress.current = false
        if (!authResolved.current) {
          console.log('[AuthCallback] Cleaning up processing key after failure/cancel')
          processingKey.current = null
        }
      }
    }

    handleAuth()
  }, [currentUrl, shouldAbort, finalizeAuth, abortToLogin, sleep, codeParam, tokenParam, errorParam])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={styles.text}>{statusText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
})