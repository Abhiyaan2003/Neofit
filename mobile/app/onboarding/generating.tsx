import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { MotiView } from 'moti'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

const STEPS = [
  'Analyzing profile...',
  'Selecting exercises...',
  'Balancing volume...',
  'Finalizing program...',
]

export default function OnboardingGenerating() {
  const router = useRouter()
  const { profile, fetchProfile } = useAuthStore()
  const [step, setStep] = useState(0)

  useEffect(() => {
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep += 1
      if (currentStep < STEPS.length) {
        setStep(currentStep)
      } else {
        clearInterval(interval)
        generateProgram()
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  const generateProgram = async () => {
    if (!profile?.id) return

    // In a real app, this would call an Edge Function or trigger the backend engine
    // For MVP, we'll simulate completion by updating the profile
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('id', profile.id)

    if (!error) {
      await fetchProfile(profile.id)
      router.replace('/(tabs)')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          style={styles.spinnerWrapper}
        >
          <MotiView
            from={{ rotate: '0deg' }}
            animate={{ rotate: '360deg' }}
            transition={{ loop: true, type: 'timing', duration: 2000 }}
            style={styles.spinner}
          />
          <Ionicons name="sparkles" size={32} color={Colors.accent} style={{ position: 'absolute' }} />
        </MotiView>

        <Text style={styles.title}>Building your engine</Text>
        <Text style={styles.subtitle}>{STEPS[step]}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  spinnerWrapper: {
    width: 100, height: 100,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
  },
  spinner: {
    width: 100, height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: Colors.accent,
    borderRightColor: Colors.accentMuted,
  },
  title: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 12 },
  subtitle: { fontSize: FontSize.lg, color: Colors.accent, fontWeight: '500' },
})
