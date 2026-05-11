import React from 'react'
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { Card } from '@/components/ui/Card'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'
import { Workout } from '@/types'

export default function HomeScreen() {
  const { profile } = useAuthStore()

  // Fetch today's workout
  const { data: todayWorkout, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['todayWorkout', profile?.id],
    queryFn: async () => {
      const today = new Date().getDay()
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('user_id', profile?.id)
        .eq('day_of_week', today)
        .maybeSingle()
      if (error && error.code !== 'PGRST116') throw error
      return data as Workout | null
    },
    enabled: !!profile?.id,
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},</Text>
            <Text style={styles.name}>{profile?.name || 'Athlete'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={Colors.warning} />
            <Text style={styles.streakText}>{profile?.current_streak || 0}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Session</Text>
        
        {isLoading ? (
          <Card style={styles.skeletonCard}>
            <Text style={styles.skeletonText}>Loading session...</Text>
          </Card>
        ) : todayWorkout ? (
          <Card padding={Spacing.xl}>
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutLabel}>{todayWorkout.day_label}</Text>
                <Text style={styles.workoutFocus}>{todayWorkout.focus}</Text>
              </View>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={24} color={Colors.background} />
              </View>
            </View>
            <View style={styles.workoutMeta}>
              <View style={styles.metaBadge}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.metaText}>{todayWorkout.estimated_duration_minutes} min</Text>
              </View>
              <View style={styles.metaBadge}>
                <Ionicons name="list-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.metaText}>{todayWorkout.workout_exercises?.length || 0} exercises</Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card padding={Spacing.xl} style={styles.restCard}>
            <View style={styles.restIcon}>
              <Ionicons name="bed-outline" size={32} color={Colors.text} />
            </View>
            <Text style={styles.restTitle}>Rest Day</Text>
            <Text style={styles.restSub}>Take it easy, you've earned it.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textMuted },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 4 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border,
  },
  streakText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 16 },
  
  skeletonCard: { height: 160, alignItems: 'center', justifyContent: 'center' },
  skeletonText: { color: Colors.textMuted },
  
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  workoutLabel: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 1 },
  workoutFocus: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 4 },
  playBtn: {
    width: 48, height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  workoutMeta: { flexDirection: 'row', gap: 16 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FontSize.sm, color: Colors.textMuted },
  
  restCard: { alignItems: 'center', paddingVertical: 40 },
  restIcon: {
    width: 64, height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceHover,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  restTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  restSub: { fontSize: FontSize.md, color: Colors.textMuted, marginTop: 4 },
})
