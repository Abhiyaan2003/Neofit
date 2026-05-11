import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme'

export default function WorkoutsScreen() {
  const { profile } = useAuthStore()

  const { data: split, isLoading } = useQuery({
    queryKey: ['activeSplit', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_splits')
        .select('*, workouts(*)')
        .eq('user_id', profile?.id)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!profile?.id,
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your Plan</Text>
        <Text style={styles.subtitle}>
          {split ? split.split_type.replace(/_/g, ' ').toUpperCase() : 'Loading plan...'}
        </Text>

        <View style={styles.list}>
          {split?.workouts?.sort((a: any, b: any) => a.day_of_week - b.day_of_week).map((workout: any) => (
            <Card key={workout.id} padding={Spacing.lg} style={styles.card}>
              <Text style={styles.day}>{workout.day_label}</Text>
              <Text style={styles.focus}>{workout.focus}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl },
  title: { fontSize: 28, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.accent, marginTop: 4, fontWeight: '600' },
  list: { gap: 16, marginTop: 24 },
  card: { borderLeftWidth: 4, borderLeftColor: Colors.accent },
  day: { fontSize: FontSize.sm, color: Colors.textMuted },
  focus: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 4 },
})
