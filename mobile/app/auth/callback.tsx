import { useEffect } from 'react'
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

import { supabase } from '@/lib/supabase'

import {
  Colors,
  FontSize,
  FontWeight,
} from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()

  const params = useLocalSearchParams()

  useEffect(() => {
    let mounted = true

    const navigateHome = () => {
      if (!mounted) return

      console.log(
        '[AuthCallback] Navigate home'
      )

      router.replace('/')
    }

    const navigateLogin = () => {
      if (!mounted) return

      console.log(
        '[AuthCallback] Navigate login'
      )

      router.replace('/(auth)/login')
    }

    const handleAuth = async () => {
      try {
        console.log(
          '[AuthCallback] Params:',
          params
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

        /**
         * OAuth Error Handling
         */
        const error =
          typeof params.error === 'string'
            ? params.error
            : undefined

        const errorDescription =
          typeof params.error_description ===
            'string'
            ? params.error_description
            : undefined

        if (error || errorDescription) {
          throw new Error(
            errorDescription ||
            error ||
            'OAuth failed'
          )
        }

        /**
         * Handle PKCE code flow
         */
        const code =
          typeof params.code === 'string'
            ? params.code
            : undefined

        if (code) {
          console.log(
            '[AuthCallback] PKCE code found'
          )

          const { error } =
            await supabase.auth.exchangeCodeForSession(
              code
            )

          if (error) {
            console.error(
              '[AuthCallback] Exchange error:',
              error
            )

            throw error
          }

          navigateHome()

          return
        }

        /**
         * Handle implicit flow tokens
         */
        const accessToken =
          typeof params.access_token ===
            'string'
            ? params.access_token
            : undefined

        const refreshToken =
          typeof params.refresh_token ===
            'string'
            ? params.refresh_token
            : undefined

        if (accessToken && refreshToken) {
          console.log(
            '[AuthCallback] Tokens found'
          )

          const { error } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

          if (error) {
            console.error(
              '[AuthCallback] setSession error:',
              error
            )

            throw error
          }

          navigateHome()

          return
        }

        /**
         * Final fallback:
         * wait for Supabase hydration
         */
        console.log(
          '[AuthCallback] Waiting for session hydration...'
        )

        await new Promise(resolve =>
          setTimeout(resolve, 2000)
        )

        const {
          data: { session: hydratedSession },
        } = await supabase.auth.getSession()

        if (hydratedSession) {
          console.log(
            '[AuthCallback] Hydrated session found'
          )

          navigateHome()

          return
        }

        throw new Error(
          'No authentication data found'
        )
      } catch (err: any) {
        console.error(
          '[AuthCallback] Auth failed:',
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

    handleAuth()

    return () => {
      mounted = false
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