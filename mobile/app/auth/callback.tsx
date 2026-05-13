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

  
  // 1. Enterprise State Orchestration
  const processingKey = useRef<string | null>(null)
  const authResolved = useRef(false)
  const authInProgress = useRef(false)
  const navigationTriggered = useRef(false)
  const isCancelled = useRef(false)
  const timeoutRef =
  useRef<ReturnType<typeof setTimeout> | null>(null)

  // 1.5. Initial State Reset (Fast Refresh / Hot Reload safety)
  useEffect(() => {
    authResolved.current = false
    navigationTriggered.current = false
    isCancelled.current = false
  }, [])

  // 2. Async Infrastructure
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
    // 0. Double-execution guard
    if (authResolved.current || navigationTriggered.current) {
      console.log('[AuthCallback] finalizeAuth already resolved or triggered, skipping...')
      return
    }
    
    console.log('[AuthCallback] Finalizing auth resolution...')
    
    try {
      // 1. Immediate Session Verification (PRE-LOCK)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('[AuthCallback] No session found during finalization')
        throw new Error('Session missing during finalization')
      }

      // 2. Lock AFTER session confirmation
      authResolved.current = true
      navigationTriggered.current = true

      console.log('[AuthCallback] Session verified. Syncing store and navigating...')
      
      // 3. Background Store Sync
      console.log('[AuthCallback] Syncing store state...')
      setSession(session)

      // 3.5. Zustand Propagation Delay (Stabilization)
      const ok = await sleep(300)
      if (!ok) {
        console.log('[AuthCallback] Navigation aborted during store sync delay')
        return
      }

      // 4. Final Navigation Execution (STABILIZED)
      console.log('[AuthCallback] SUCCESS: Authentication resolved. Entering app.')
      router.replace('/')

      // 4.5 Clear timeout after successful navigation
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

  // 3. Sync URL with functional state to prevent stale closures
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

  // 4. Listen for deep links (Event driven)
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

  // 5. Global Timeout (15s) with session fallback
  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      if (isCancelled.current || authResolved.current || navigationTriggered.current) return

      console.log('[AuthCallback] Timeout check: verifying session before abort...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('[AuthCallback] Timeout hit but session exists, recovering...')
        await finalizeAuth()
        return
      }

      console.error('[AuthCallback] Global Timeout triggered')
      abortToLogin('Login process timed out. Please try again.')
    }, 15000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [shouldAbort, finalizeAuth, abortToLogin])

  // 6. Auth Processing Core
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
        console.log('[AuthCallback] Processing START:', procKey)

        // A. Early Session Check
        const { data: { session: preSession } } = await supabase.auth.getSession()
        if (preSession) {
          console.log('[AuthCallback] Active session found early')
          await finalizeAuth()
          return
        }



        if (shouldAbort()) return
        console.log('[AuthCallback] Keys found:', Object.keys(authParams))

        // C. Error check
        const error = authParams.error || authParams.error_description
        if (error) throw new Error(error)

        // D. PKCE Flow
        if (authParams.code) {
          console.log('[AuthCallback] PKCE Exchange start')
          const { error: pkceErr } = await supabase.auth.exchangeCodeForSession(authParams.code)
          
          if (pkceErr) {
            console.log('[AuthCallback] PKCE error, checking for auto-restoration...')
            const { data: { session: pkceRetry } } = await supabase.auth.getSession()
            if (pkceRetry) {
              console.log('[AuthCallback] PKCE success via auto-restoration')
              await finalizeAuth()
              return
            }
            throw pkceErr
          }
          await finalizeAuth()
          return
        }

        // E. Implicit Flow
        const at = authParams.access_token
        const rt = authParams.refresh_token
        if (at && rt) {
          console.log('[AuthCallback] Implicit Flow start')
          const { error: impErr } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          })
          if (impErr) throw impErr
          await finalizeAuth()
          return
        }

        // F. Enterprise Hydration Loop (4 retries with backoff)
        console.log('[AuthCallback] No direct data, entering backoff hydration loop...')
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
      <Text style={styles.text}>Completing secure login...</Text>
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