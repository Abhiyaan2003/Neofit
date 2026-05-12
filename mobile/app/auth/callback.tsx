import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { Colors, FontSize, FontWeight } from '@/constants/theme'

/**
 * Minimal callback screen to allow Expo Router to resolve the neofit://auth/callback route.
 * The actual session exchange is handled in login.tsx after the WebBrowser session returns.
 */
export default function AuthCallback() {
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
