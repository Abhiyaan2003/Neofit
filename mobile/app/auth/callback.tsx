import { useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Alert,
} from 'react-native'

import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'

import { supabase } from '@/lib/supabase'

import {
  Colors,
  FontSize,
  FontWeight,
} from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()

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

    const handleAuth = async () => {
      try {
        console.log(
          '[AuthCallback] Checking existing session'
        )

        // Existing session check
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log(
            '[AuthCallback] Session already exists'
          )

          navigateHome()

          return
        }

        // Get deep link URL
        const url =
          await Linking.getInitialURL()

        console.log(
          '[AuthCallback] Initial URL:',
          url
        )

        if (!url) {
          throw new Error(
            'No callback URL found'
          )
        }

        /**
         * IMPORTANT:
         * Supabase handles the session automatically
         * from the deep link.
         *
         * We just wait briefly and re-check session.
         */

        await new Promise(resolve =>
          setTimeout(resolve, 1500)
        )

        const {
          data: { session: newSession },
        } = await supabase.auth.getSession()

        console.log(
          '[AuthCallback] Session after callback:',
          !!newSession
        )

        if (newSession) {
          navigateHome()
        } else {
          throw new Error(
            'Authentication session not established'
          )
        }
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
