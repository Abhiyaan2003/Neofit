import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'

const FREQ = [
  { id: 3, title: '3 Days', sub: 'Full Body' },
  { id: 4, title: '4 Days', sub: 'Upper / Lower' },
  { id: 5, title: '5 Days', sub: 'Push Pull Legs + Upper / Lower' },
  { id: 6, title: '6 Days', sub: 'Push Pull Legs (2x)' },
]

export default function OnboardingFrequency() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  
  const handleNext = () => router.push('/onboarding/generating')

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.bar, { width: '75%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Days per week?</Text>
        <Text style={styles.subtitle}>How often can you realistically train?</Text>

        <View style={styles.grid}>
          {FREQ.map(g => (
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

        <Button title="Continue" size="lg" disabled={!selected} onPress={handleNext} style={styles.footer} />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, flex: 1 },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderWidth: 2, borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    height: 120,
    justifyContent: 'center',
  },
  cardActive: { borderColor: Colors.accent, backgroundColor: 'rgba(139,174,158,0.1)' },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  textActive: { color: Colors.accent },
  cardSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  footer: { marginTop: 'auto' },
})
