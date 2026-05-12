import { useEffect, useRef } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'

import { supabase } from '@/lib/supabase'
import { Colors, FontSize, FontWeight } from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()

  const params = useLocalSearchParams<{
    code?: string
    error?: string
    error_description?: string
  }>()

  const processedCode = useRef<string | null>(null)

  useEffect(() => {
    let mounted = true

    const navigateHome = () => {
      if (!mounted) return
      router.replace('/')
    }

    const navigateLogin = () => {
      if (!mounted) return
      router.replace('/(auth)/login')
    }

    const handleExchange = async (code: string) => {
      try {
        if (processedCode.current === code) {
          console.log('[AuthCallback] Code already processed')
          return
        }

        processedCode.current = code

        console.log('[AuthCallback] Exchanging code:', code)

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code)

        console.log('[AuthCallback] Exchange result:', data)

        if (error) {
          console.error('[AuthCallback] Exchange error:', error)
          throw error
        }

        // Verify session exists
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log('[AuthCallback] Session:', session)

        if (session) {
          navigateHome()
        } else {
          throw new Error('Session not established')
        }
      } catch (err: any) {
        console.error('[AuthCallback] Auth failed:', err)

        Alert.alert(
          'Authentication Failed',
          err?.message || 'Please try again'
        )

        navigateLogin()
      }
    }

    const processAuth = async () => {
      try {
        // Check existing session first
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log('[AuthCallback] Existing session found')
          navigateHome()
          return
        }

        // Handle OAuth errors
        if (params.error || params.error_description) {
          throw new Error(
            String(
              params.error_description ||
                params.error ||
                'OAuth authentication failed'
            )
          )
        }

        let code: string | null = null

        // 1. Try router params
        if (typeof params.code === 'string') {
          code = params.code
          console.log('[AuthCallback] Code from params')
        }

        // 2. Try current URL
        if (!code) {
          const currentUrl = Linking.useURL()

          if (currentUrl) {
            console.log('[AuthCallback] Current URL:', currentUrl)

            const parsed = Linking.parse(currentUrl)

            if (typeof parsed.queryParams?.code === 'string') {
              code = parsed.queryParams.code
            }
          }
        }

        // 3. Try initial URL
        if (!code) {
          const initialUrl = await Linking.getInitialURL()

          if (initialUrl) {
            console.log('[AuthCallback] Initial URL:', initialUrl)

            const parsed = Linking.parse(initialUrl)

            if (typeof parsed.queryParams?.code === 'string') {
              code = parsed.queryParams.code
            }
          }
        }

        if (!code) {
          throw new Error('No authentication code found')
        }

        await handleExchange(code)
      } catch (err: any) {
        console.error('[AuthCallback] Process failed:', err)

        Alert.alert(
          'Login Failed',
          err?.message || 'Authentication failed'
        )

        navigateLogin()
      }
    }

    processAuth()

    // Safety timeout
    const timeout = setTimeout(() => {
      console.warn('[AuthCallback] Timeout reached')

      navigateLogin()
    }, 15000)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={Colors.accent}
      />

      <Text style={styles.text}>
        Completing secure login...
      </Text>
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
