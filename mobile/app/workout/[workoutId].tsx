import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useWorkoutStore } from '@/store/workout.store'
import { Button } from '@/components/ui/Button'
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme'
import { Workout } from '@/types'

export default function ActiveWorkoutScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>()
  const router = useRouter()
  
  const { 
    exercises, currentIdx, sets, isResting, restSeconds, elapsedSeconds,
    initSession, completeSet, nextExercise, startRest, skipRest, tickElapsed, tickRest, reset 
  } = useWorkoutStore()

  const { data: workout, isLoading } = useQuery({
    queryKey: ['workout', workoutId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, workout_exercises(*, exercises(*))')
        .eq('id', workoutId)
        .single()
      if (error) throw error
      return data as Workout
    },
  })

  // Initialize store when data loads
  useEffect(() => {
    if (workout?.workout_exercises && exercises.length === 0) {
      // Create session in DB here in real app
      initSession('temp-session-id', workout.id, workout.workout_exercises.sort((a,b) => a.order_index - b.order_index))
    }
  }, [workout])

  // Timers
  useEffect(() => {
    const timer = setInterval(() => {
      tickElapsed()
      tickRest()
    }, 1000)
    return () => clearInterval(timer)
  }, [isResting])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSetComplete = (setIdx: number) => {
    completeSet(currentIdx, setIdx)
    // Auto-start rest timer
    const currentEx = exercises[currentIdx]
    if (currentEx) {
      startRest(currentEx.rest_time_seconds)
    }
  }

  const handleFinish = () => {
    Alert.alert('Workout Complete!', 'Great job today.', [
      { text: 'Finish', onPress: () => { reset(); router.replace('/(tabs)') } }
    ])
  }

  if (isLoading || exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><Text style={{ color: Colors.text }}>Loading session...</Text></View>
      </SafeAreaView>
    )
  }

  const activeExercise = exercises[currentIdx]
  const activeSets = sets[currentIdx]
  const isLastExercise = currentIdx === exercises.length - 1

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back() }}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
        <Button title="Finish" variant="ghost" size="sm" onPress={handleFinish} fullWidth={false} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Progress Bar */}
        <View style={styles.progressRow}>
          {exercises.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= currentIdx && styles.progressActive]} />
          ))}
        </View>

        {/* Current Exercise */}
        <Text style={styles.exerciseName}>{activeExercise.exercises.name}</Text>
        <Text style={styles.muscle}>{activeExercise.exercises.muscle_group.toUpperCase()}</Text>

        {/* Sets */}
        <View style={styles.setsContainer}>
          <View style={styles.setRowHeader}>
            <Text style={[styles.setCol, { flex: 0.5 }]}>SET</Text>
            <Text style={[styles.setCol, { flex: 1 }]}>KG</Text>
            <Text style={[styles.setCol, { flex: 1 }]}>REPS</Text>
            <Text style={[styles.setCol, { flex: 1, textAlign: 'center' }]}>DONE</Text>
          </View>
          
          {activeSets.map((set, i) => (
            <View key={i} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
              <Text style={[styles.setColVal, { flex: 0.5 }]}>{i + 1}</Text>
              <Text style={[styles.setColVal, { flex: 1 }]}>—</Text>
              <Text style={[styles.setColVal, { flex: 1 }]}>{set.reps}</Text>
              <TouchableOpacity 
                style={[styles.checkBtn, set.completed && styles.checkBtnActive]}
                onPress={() => !set.completed && handleSetComplete(i)}
                disabled={set.completed}
              >
                <Ionicons name="checkmark" size={20} color={set.completed ? Colors.background : Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Button 
          title={isLastExercise ? "Finish Workout" : "Next Exercise"} 
          onPress={isLastExercise ? handleFinish : nextExercise} 
          style={{ marginTop: 40 }}
        />
      </ScrollView>

      {/* Rest Overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <Text style={styles.restTitle}>Rest</Text>
          <Text style={styles.restTimer}>{formatTime(restSeconds)}</Text>
          <Button title="Skip Rest" variant="secondary" onPress={skipRest} style={{ marginTop: 24, minWidth: 200 }} fullWidth={false} />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: 16 },
  timer: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, fontVariant: ['tabular-nums'] },
  scroll: { padding: Spacing.xl },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 32 },
  progressDot: { flex: 1, height: 4, backgroundColor: Colors.surface, borderRadius: 2 },
  progressActive: { backgroundColor: Colors.accent },
  exerciseName: { fontSize: 32, fontWeight: FontWeight.bold, color: Colors.text },
  muscle: { fontSize: FontSize.sm, color: Colors.accent, marginTop: 4, fontWeight: '600', letterSpacing: 1 },
  setsContainer: { marginTop: 40, gap: 12 },
  setRowHeader: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  setCol: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  setRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: Radius.lg },
  setRowCompleted: { backgroundColor: 'rgba(116,198,157,0.1)' },
  setColVal: { fontSize: FontSize.lg, color: Colors.text, fontWeight: '500' },
  checkBtn: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', flex: 1, maxWidth: 64, alignSelf: 'center' },
  checkBtnActive: { backgroundColor: Colors.success },
  
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,17,21,0.95)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  restTitle: { fontSize: 24, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 2 },
  restTimer: { fontSize: 80, fontWeight: FontWeight.bold, color: Colors.text, fontVariant: ['tabular-nums'], marginTop: 8 },
})
