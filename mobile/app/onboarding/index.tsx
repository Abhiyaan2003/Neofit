import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

export default function OnboardingWelcome() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 1000 }}
          style={styles.hero}
        >
          <LinearGradient
            colors={['rgba(139,174,158,0.2)', 'transparent']}
            style={styles.glow}
          />
          <Text style={styles.brand}>Neofit</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 1000, delay: 400 }}
          style={styles.content}
        >
          <Text style={styles.title}>Let's build your perfect plan</Text>
          <Text style={styles.subtitle}>
            We need a few details to generate a workout routine tailored to your body, goals, and the equipment you have.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 800 }}
          style={styles.footer}
        >
          <Button
            title="Get Started"
            size="lg"
            onPress={() => router.push('/onboarding/goals')}
          />
        </MotiView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  brand: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.text, letterSpacing: -1 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 16, lineHeight: 42 },
  subtitle: { fontSize: FontSize.lg, color: Colors.textMuted, lineHeight: 28 },
  footer: { paddingBottom: Spacing.xl },
})
