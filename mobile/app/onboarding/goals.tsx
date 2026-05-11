import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'
import { useAuthStore } from '@/store/auth.store'

const GOALS = [
  { id: 'muscle_gain', title: 'Build Muscle', sub: 'Focus on hypertrophy and size' },
  { id: 'fat_loss', title: 'Lose Fat', sub: 'Burn calories and tone up' },
  { id: 'strength', title: 'Get Stronger', sub: 'Increase power and PRs' },
  { id: 'athletic', title: 'Athletic Performance', sub: 'Agility, speed, and endurance' },
]

export default function OnboardingGoals() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  
  const handleNext = () => {
    // We would normally save this to local state/context and submit at the end
    // For now, we'll just navigate forward
    router.push('/onboarding/experience')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.bar, { width: '25%' }]} />
          </View>
        </View>

        <Text style={styles.title}>What's your primary goal?</Text>
        <Text style={styles.subtitle}>This helps us tailor your program structure.</Text>

        <View style={styles.list}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.card, selected === g.id && styles.cardActive]}
              onPress={() => setSelected(g.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.cardTitle, selected === g.id && styles.textActive]}>{g.title}</Text>
              <Text style={styles.cardSub}>{g.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          size="lg"
          disabled={!selected}
          onPress={handleNext}
          style={styles.footer}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  back: { padding: 8, marginLeft: -8 },
  progress: { flex: 1, height: 4, backgroundColor: Colors.surface, borderRadius: 2 },
  bar: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  title: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: FontSize.md, color: Colors.textMuted, marginBottom: 32 },
  list: { gap: 16, flex: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
  },
  cardActive: { borderColor: Colors.accent, backgroundColor: 'rgba(139,174,158,0.1)' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  textActive: { color: Colors.accent },
  cardSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
  footer: { marginTop: 'auto' },
})
