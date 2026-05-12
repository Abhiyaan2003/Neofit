import { useEffect, useRef, useState } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'

import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
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
  const { setSession } = useAuthStore()
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  
  // 1. Enterprise State Orchestration
  const processingKey = useRef<string | null>(null)
  const authResolved = useRef(false)
  const authInProgress = useRef(false)
  const navigationTriggered = useRef(false)
  const isCancelled = useRef(false)

  // 2. Async Infrastructure
  const shouldAbort = () => isCancelled.current || authResolved.current

  const sleep = async (ms: number): Promise<boolean> => {
    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        if (shouldAbort()) {
          resolve(false)
          return
        }
        resolve(true)
      }, ms)
    })
  }

  // 3. Sync URL with functional state to prevent stale closures
  useEffect(() => {
    if (incomingUrl) {
      setCurrentUrl(prev => {
        if (prev !== incomingUrl) {
          console.log('[AuthCallback] URL Sync:', incomingUrl)
          return incomingUrl
        }
        return prev
      })
    }
  }, [incomingUrl])

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
      authResolved.current = true // Stop all async work
    }
  }, [])

  // 5. Global Timeout (15s) with cancellation
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!shouldAbort() && !navigationTriggered.current) {
        console.error('[AuthCallback] Global Timeout triggered')
        isCancelled.current = true
        authResolved.current = true
        navigationTriggered.current = true
        Alert.alert('Login Timeout', 'Process took too long. Please try again.')
        router.replace('/(auth)/login')
      }
    }, 15000)

    return () => clearTimeout(timeout)
  }, [])

  // 6. Auth Processing Core
  useEffect(() => {
    const finalizeAuth = async () => {
      if (shouldAbort()) return
      
      console.log('[AuthCallback] Finalizing auth resolution...')
      
      try {
        // A. Session Stabilization Loop
        let stableSession = null
        for (let i = 0; i < 3; i++) {
          if (shouldAbort()) return
          console.log(`[AuthCallback] Session stabilization check ${i+1}/3`)
          
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            stableSession = session
            // Propagate to store immediately if found
            setSession(session) 
          }
          
          if (i < 2) await sleep(300) // Incremental stabilization delay
        }

        if (!stableSession) {
          throw new Error('Session failed to stabilize')
        }

        // B. Store Hydration Check
        console.log('[AuthCallback] Verifying store hydration...')
        const storeState = useAuthStore.getState()
        if (!storeState.isAuthenticated || !storeState.session) {
          console.log('[AuthCallback] Store not yet hydrated, forcing sync...')
          setSession(stableSession)
          await sleep(200)
        }

        // C. Final Navigation Execution
        if (shouldAbort() || navigationTriggered.current) return
        
        authResolved.current = true
        navigationTriggered.current = true
        
        console.log('[AuthCallback] SUCCESS: Authentication fully resolved')
        router.replace('/')
      } catch (err: any) {
        console.error('[AuthCallback] Finalization error:', err.message)
        abortToLogin(err.message || 'Session stabilization failed')
      }
    }

    const abortToLogin = (reason: string) => {
      if (isCancelled.current || navigationTriggered.current) return
      
      console.error('[AuthCallback] ABORT:', reason)
      isCancelled.current = true
      authResolved.current = true
      navigationTriggered.current = true
      
      Alert.alert('Login Failed', reason)
      router.replace('/(auth)/login')
    }

    const handleAuth = async () => {
      if (!currentUrl || shouldAbort()) return
      if (processingKey.current === currentUrl) return
      if (authInProgress.current) return
      
      try {
        authInProgress.current = true
        processingKey.current = currentUrl
        console.log('[AuthCallback] Processing START:', currentUrl)

        // A. Early Session Check
        const { data: { session: preSession } } = await supabase.auth.getSession()
        if (preSession) {
          console.log('[AuthCallback] Active session found early')
          await finalizeAuth()
          return
        }

        // B. Safe Parameter Parsing
        const authParams: Record<string, string> = {}
        const urlParts = currentUrl.split('?')
        if (urlParts.length > 1) {
          const queryStr = urlParts[1].split('#')[0]
          queryStr.split('&').forEach(part => {
            const eqIdx = part.indexOf('=')
            if (eqIdx > -1) {
              const key = part.slice(0, eqIdx)
              const val = part.slice(eqIdx + 1)
              authParams[decodeURIComponent(key)] = decodeURIComponent(val)
            }
          })
        }

        const fragParts = currentUrl.split('#')
        if (fragParts.length > 1) {
          fragParts[1].split('&').forEach(part => {
            const eqIdx = part.indexOf('=')
            if (eqIdx > -1) {
              const key = part.slice(0, eqIdx)
              const val = part.slice(eqIdx + 1)
              authParams[decodeURIComponent(key)] = decodeURIComponent(val)
            }
          })
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
          if (shouldAbort()) break
          
          console.log(`[AuthCallback] Hydration check ${i+1}/${intervals.length}`)
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          
          if (retrySession) {
            console.log('[AuthCallback] Session hydrated in loop')
            await finalizeAuth()
            return
          }
          
          await sleep(intervals[i])
        }

        if (!shouldAbort()) {
          throw new Error('Authentication parameters invalid or session missing')
        }
      } catch (err: any) {
        abortToLogin(err.message || 'Unknown authentication error')
      } finally {
        authInProgress.current = false
      }
    }

    handleAuth()
  }, [currentUrl])

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