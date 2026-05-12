import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'

import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

import { queryClient } from '@/lib/queryClient'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'

// Required for OAuth on Android
WebBrowser.maybeCompleteAuthSession()

export default function RootLayout() {
  const { setSession, fetchProfile } = useAuthStore()

  useEffect(() => {
    console.log('[RootLayout] Mounted')

    // Debug deep links
    const linkingSubscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        console.log('[RootLayout] Deep link received:', url)
      }
    )

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('[RootLayout] Checking session...')

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log(
          '[RootLayout] Initial session:',
          !!session
        )

        setSession(session)

        if (session?.user) {
          fetchProfile(session.user.id).catch(err => {
            console.error(
              '[RootLayout] Profile fetch failed:',
              err
            )
          })
        }
      } catch (err) {
        console.error(
          '[RootLayout] Initial auth failed:',
          err
        )
      }
    }

    initializeAuth()

    // Auth state listener
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(
          '[RootLayout] AuthStateChange:',
          event,
          'User:',
          session?.user?.email || 'None'
        )

        setSession(session)

        if (session?.user) {
          console.log('[RootLayout] Fetching profile for user:', session.user.id)
          fetchProfile(session.user.id).catch(err => {
            console.error(
              '[RootLayout] Profile fetch failed:',
              err
            )
          })
        }
      }
    )

    return () => {
      console.log('[RootLayout] Cleanup')

      linkingSubscription.remove()
      authSubscription.unsubscribe()
    }
  }, [setSession, fetchProfile])

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            style="light"
            backgroundColor="#0F1115"
          />

          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />

            <Stack.Screen
              name="workout/[workoutId]"
              options={{
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
