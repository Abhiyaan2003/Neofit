import { useEffect, useRef } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router'

import * as Linking from 'expo-linking'

import { supabase } from '@/lib/supabase'

import {
  Colors,
  FontSize,
  FontWeight,
} from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()

  const params = useLocalSearchParams<{
    code?: string | string[]
    error?: string | string[]
    error_description?: string | string[]
  }>()

  const processedCode =
    useRef<string | null>(null)

  useEffect(() => {
    let mounted = true
    let completed = false

    const navigateHome = () => {
      if (!mounted) return

      completed = true

      console.log(
        '[AuthCallback] Navigating home'
      )

      router.replace('/')
    }

    const navigateLogin = () => {
      if (!mounted) return

      completed = true

      console.log(
        '[AuthCallback] Navigating login'
      )

      router.replace('/(auth)/login')
    }

    const handleExchange = async (
      code: string
    ) => {
      try {
        // Prevent duplicate processing
        if (
          processedCode.current === code
        ) {
          console.log(
            '[AuthCallback] Code already processed'
          )

          return
        }

        processedCode.current = code

        console.log(
          '[AuthCallback] Exchanging code:',
          code
        )

        const { error } =
          await supabase.auth.exchangeCodeForSession(
            code
          )

        // IMPORTANT:
        // Sometimes Android already restores
        // the session automatically before this
        // exchange completes.
        if (error) {
          console.error(
            '[AuthCallback] Exchange error:',
            error
          )

          // Check if session already exists
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            console.log(
              '[AuthCallback] Session already established'
            )

            navigateHome()

            return
          }

          throw error
        }

        // Verify session exists
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log(
          '[AuthCallback] Session exists:',
          !!session
        )

        if (session) {
          navigateHome()
        } else {
          throw new Error(
            'Session not established'
          )
        }
      } catch (err: any) {
        console.error(
          '[AuthCallback] Auth failed:',
          err
        )

        Alert.alert(
          'Authentication Failed',
          err?.message ||
          'Please try again'
        )

        navigateLogin()
      }
    }

    const processAuth = async () => {
      try {
        console.log(
          '[AuthCallback] Starting auth processing'
        )

        // Existing session check
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log(
            '[AuthCallback] Existing session found'
          )

          navigateHome()

          return
        }

        // OAuth error handling
        const oauthError =
          Array.isArray(params.error)
            ? params.error[0]
            : params.error

        const oauthErrorDescription =
          Array.isArray(
            params.error_description
          )
            ? params.error_description[0]
            : params.error_description

        if (
          oauthError ||
          oauthErrorDescription
        ) {
          throw new Error(
            String(
              oauthErrorDescription ||
              oauthError ||
              'OAuth authentication failed'
            )
          )
        }

        let code: string | null = null

        // 1. Try Expo Router params
        if (params.code) {
          code = Array.isArray(params.code)
            ? params.code[0]
            : params.code

          console.log(
            '[AuthCallback] Code from params'
          )
        }

        // 2. Fallback: initial deep link
        if (!code) {
          const initialUrl =
            await Linking.getInitialURL()

          if (initialUrl) {
            console.log(
              '[AuthCallback] Initial URL:',
              initialUrl
            )

            const parsed =
              Linking.parse(initialUrl)

            if (
              typeof parsed.queryParams
                ?.code === 'string'
            ) {
              code =
                parsed.queryParams.code

              console.log(
                '[AuthCallback] Code from initial URL'
              )
            }
          }
        }

        // No auth code found
        if (!code) {
          throw new Error(
            'No authentication code found'
          )
        }

        await handleExchange(code)
      } catch (err: any) {
        console.error(
          '[AuthCallback] Process failed:',
          err
        )

        Alert.alert(
          'Login Failed',
          err?.message ||
          'Authentication failed'
        )

        navigateLogin()
      }
    }

    processAuth()

    // Safety timeout
    const timeout = setTimeout(() => {
      if (completed) return

      console.warn(
        '[AuthCallback] Timeout reached'
      )

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
    backgroundColor:
      Colors.background,
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