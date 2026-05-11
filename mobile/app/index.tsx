import { useEffect } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from '@/store/auth.store'
import { Colors } from '@/constants/theme'

export default function Index() {
  const { isAuthenticated, isLoading, profile } = useAuthStore()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    )
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />
  if (!profile?.onboarding_complete) return <Redirect href="/onboarding" />
  return <Redirect href="/(tabs)" />
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
})
