import { useEffect } from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { Colors, FontSize, FontWeight } from '@/constants/theme'

export default function AuthCallback() {
  const router = useRouter()
  const { url: paramUrl } = useLocalSearchParams<{ url?: string }>()
  const { setSession, fetchProfile } = useAuthStore()

  useEffect(() => {
    const handleInitialUrl = async () => {
      // 1. Check for URL passed in params (from WebBrowser success)
      if (paramUrl) {
        console.log('[AuthCallback] URL from params:', paramUrl)
        await handleCallback(paramUrl)
        return
      }

      // 2. Check for initial URL (from app cold start)
      const initialUrl = await Linking.getInitialURL()
      if (initialUrl) {
        console.log('[AuthCallback] Initial URL:', initialUrl)
        await handleCallback(initialUrl)
        return
      }
    }

    handleInitialUrl()
  }, [paramUrl])

  // 3. Listen for deep link events (from app background/foreground)
  const linkingUrl = Linking.useURL()
  useEffect(() => {
    if (linkingUrl && linkingUrl !== paramUrl) {
      console.log('[AuthCallback] Deep link event:', linkingUrl)
      handleCallback(linkingUrl)
    }
  }, [linkingUrl])

  const handleCallback = async (urlStr: string) => {
    try {
      console.log('[AuthCallback] Processing URL:', urlStr)
      
      // Use URL constructor but handle hash correctly
      // Some platforms return URL with hash fragment
      const parsedUrl = new URL(urlStr)
      const hash = parsedUrl.hash.substring(1)
      
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      console.log('[AuthCallback] Token Status:', { 
        access: !!access_token, 
        refresh: !!refresh_token 
      })

      if (access_token && refresh_token) {
        console.log('[AuthCallback] Setting Supabase session...')
        const { data: { session }, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
        
        if (sessionError) throw sessionError
        
        if (session) {
          console.log('[AuthCallback] Session created for:', session.user.email)
          
          // Force a user fetch to verify authentication is active
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError) throw userError
          
          if (user) {
            console.log('[AuthCallback] User verified, updating store')
            setSession(session)
            await fetchProfile(user.id)
            
            console.log('[AuthCallback] Navigation: Redirecting to (tabs)')
            router.replace('/(tabs)')
          }
        }
      } else {
        // Handle error params
        const error = parsedUrl.searchParams.get('error_description') || parsedUrl.searchParams.get('error')
        if (error) {
          console.error('[AuthCallback] OAuth Error:', error)
          throw new Error(error)
        }

        // If no tokens, check if session already exists (persistence)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('[AuthCallback] Existing session detected, navigating home')
          router.replace('/(tabs)')
        } else {
          console.warn('[AuthCallback] No session or tokens found in URL')
          router.replace('/(auth)/login')
        }
      }
    } catch (err: any) {
      console.error('[AuthCallback] Fatal Error:', err.message)
      router.replace('/(auth)/login')
    }
  }

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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
})
