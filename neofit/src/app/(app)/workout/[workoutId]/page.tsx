'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, ChevronRight, Play, Check, Timer, SkipForward,
  Trophy, TrendingUp, Minus, Plus, Weight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { useWorkoutStore, WorkoutExerciseState, WorkoutSetState } from '@/store/workout'
import {
  getProgressionSuggestion, formatLastPerformance,
  getProgressionEmoji, checkForPR, ExercisePerformance,
} from '@/lib/engines/progression-engine'
import { evaluateStreak, incrementStreak } from '@/lib/engines/streak-engine'
import { getRankedSubstitutes } from '@/lib/engines/substitution-engine'
import { EXERCISES } from '@/constants/exercises'
import { Exercise } from '@/types'
import { toast } from 'sonner'
import { RefreshCw, Star } from 'lucide-react'

// ─── Section display config ──────────────────────────────────
const SECTION_META: Record<string, { label: string; color: string; icon: string }> = {
  warmup: { label: 'Warm-up', color: '#F9A826', icon: '🔥' },
  primary_compound: { label: 'Primary Compound', color: '#8BAE9E', icon: '🏋️' },
  secondary_compound: { label: 'Secondary Compound', color: '#8BAE9E', icon: '💪' },
  accessory: { label: 'Accessories', color: '#A274C6', icon: '🎯' },
  core: { label: 'Core Work', color: '#74C69D', icon: '🧱' },
  finisher: { label: 'Finisher', color: '#FF6B6B', icon: '⚡' },
  cooldown: { label: 'Cool-down', color: '#6BA3C6', icon: '❄️' },
}

interface DBWorkoutExercise {
  id: string
  order_index: number
  sets: number
  reps: string
  rest_time_seconds: number
  section: string | null
  exercises: {
    id: string
    name: string
    slug: string
    muscle_group: string
    video_url: string | null
    instructions: string[]
    exercise_type: string | null
  }
}

export default function WorkoutSessionPage() {
  const { workoutId } = useParams()
  const router = useRouter()
  const { profile } = useAuthStore()
  const store = useWorkoutStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showPRAnimation, setShowPRAnimation] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, ExercisePerformance[]>>({})
  const [isDeload, setIsDeload] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Elapsed timer ─────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // ─── Rest timer ────────────────────────────────────────────
  useEffect(() => {
    if (!store.isResting) return
    if (store.restTimeRemaining <= 0) { store.setResting(false); return }
    const t = setTimeout(() => store.tickRest(), 1000)
    return () => clearTimeout(t)
  }, [store.isResting, store.restTimeRemaining])

  // ─── Load workout + history ────────────────────────────────
  useEffect(() => {
    loadWorkout()
  }, [workoutId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadWorkout = async () => {
    const supabase = createClient()

    // Fetch workout exercises
    const { data } = await supabase
      .from('workouts')
      .select('day_label, focus, split_id, workout_exercises(*, exercises(*))')
      .eq('id', workoutId)
      .single()

    if (!data || !profile) { setIsLoading(false); return }

    const dbExercises = (data.workout_exercises as DBWorkoutExercise[])
      .sort((a, b) => a.order_index - b.order_index)

    // Fetch last session logs for each exercise (for progression)
    const slugs = dbExercises.map(ex => ex.exercises.slug)
    const { data: pastLogs } = await supabase
      .from('session_exercise_logs')
      .select('exercise_slug, reps_completed, weight_kg, completed_at')
      .in('exercise_slug', slugs)
      .eq('user_id', profile.id)
      .order('completed_at', { ascending: false })
      .limit(200)

    // Build history map
    const historyMap: Record<string, ExercisePerformance[]> = {}
    for (const slug of slugs) {
      const logs = (pastLogs || []).filter(l => l.exercise_slug === slug)
      if (logs.length > 0) {
        // Group by date
        const byDate: Record<string, { reps: number; weightKg: number }[]> = {}
        for (const log of logs) {
          const date = log.completed_at ? log.completed_at.split('T')[0] : 'unknown'
          if (!byDate[date]) byDate[date] = []
          byDate[date].push({ reps: log.reps_completed ?? 0, weightKg: Number(log.weight_kg) || 0 })
        }
        historyMap[slug] = Object.entries(byDate).map(([date, sets]) => ({
          exerciseSlug: slug,
          exerciseName: dbExercises.find(e => e.exercises.slug === slug)?.exercises.name || slug,
          isCompound: dbExercises.find(e => e.exercises.slug === slug)?.exercises.exercise_type === 'compound',
          date,
          sets,
        }))
      }
    }
    setExerciseHistory(historyMap)

    // Check for deload status
    const { data: split } = await supabase
      .from('workout_splits')
      .select('created_at')
      .eq('id', data.split_id)
      .single()

    let deloadActive = false
    if (split) {
      const createdAt = new Date(split.created_at)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const weekNumber = Math.min(4, Math.floor(diffDays / 7) + 1)
      deloadActive = weekNumber === 4
    }
    setIsDeload(deloadActive)

    // Build exercise states with progression context
    const exercises: WorkoutExerciseState[] = dbExercises.map(ex => {
      const history = historyMap[ex.exercises.slug] || []
      const lastPerf = history[0] || null
      const suggestion = lastPerf
        ? getProgressionSuggestion(lastPerf, ex.reps)
        : null

      const targetReps = parseInt(ex.reps.split('-')[1] || ex.reps) || 10

      let targetSets = ex.sets
      if (deloadActive && !['warmup', 'cooldown'].includes(ex.section || '')) {
        targetSets = Math.max(2, ex.sets - 1)
      }

      return {
        exerciseId: ex.exercises.id,
        exerciseSlug: ex.exercises.slug,
        exerciseName: ex.exercises.name,
        section: ex.section || 'primary_compound',
        targetSets: targetSets,
        targetReps: ex.reps,
        restSeconds: ex.rest_time_seconds,
        isCompleted: false,
        sets: Array.from({ length: targetSets }, () => ({
          completed: false,
          reps: targetReps,
          weight: suggestion?.suggestedWeightKg ?? (lastPerf?.sets[0]?.weightKg ?? 0),
          isPR: false,
        })),
        lastWeight: lastPerf?.sets[0]?.weightKg ?? null,
        lastReps: lastPerf?.sets[0]?.reps ?? null,
        progressionCue: suggestion ? `${getProgressionEmoji(suggestion.type)} ${suggestion.reason}` : null,
      }
    })

    // Create session in DB
    const { data: session } = await supabase.from('workout_sessions').insert({
      user_id: profile.id,
      workout_id: workoutId,
      status: 'in_progress',
    }).select().single()

    store.startSession({
      sessionId: session?.id || null,
      workoutId: workoutId as string,
      dayLabel: data.day_label,
      focus: data.focus,
      exercises,
      currentExerciseIndex: 0,
      startedAt: Date.now(),
      totalVolume: 0,
      prsHit: 0,
    })

    setIsLoading(false)
  }

  const handleSwapExercise = async (newExercise: Exercise) => {
    if (!store.session || !profile) return
    const supabase = createClient()
    
    const currentEx = store.session.exercises[store.session.currentExerciseIndex]
    
    // Update DB permanently for this split
    const { error } = await supabase
      .from('workout_exercises')
      .update({ exercise_id: newExercise.id })
      .match({ workout_id: workoutId, exercise_id: currentEx.exerciseId })

    if (error) {
      toast.error('Failed to swap exercise in database')
      return
    }

    // Refresh the local session state
    const targetReps = parseInt(newExercise.defaultReps.split('-')[1] || newExercise.defaultReps) || 10
    
    const updatedExercise: WorkoutExerciseState = {
      ...currentEx,
      exerciseId: newExercise.id,
      exerciseSlug: newExercise.slug,
      exerciseName: newExercise.name,
      targetReps: newExercise.defaultReps,
      sets: Array.from({ length: currentEx.targetSets }, () => ({
        completed: false,
        reps: targetReps,
        weight: 0, // Reset weight as it's a new exercise
        isPR: false,
      })),
      progressionCue: 'New exercise — start light to find your weight',
    }

    const newExercises = [...store.session.exercises]
    newExercises[store.session.currentExerciseIndex] = updatedExercise
    
    store.startSession({
      ...store.session,
      exercises: newExercises
    })

    toast.success(`Swapped to ${newExercise.name}`)
    setShowSwapModal(false)
  }

  // ─── Handlers ──────────────────────────────────────────────
  const handleCompleteSet = useCallback(async (exIdx: number, setIdx: number) => {
    const { session } = useWorkoutStore.getState()
    if (!session) return

    const exercise = session.exercises[exIdx]
    const setData = exercise.sets[setIdx]
    if (setData.completed) return

    store.completeSet(exIdx, setIdx)

    // Check for PR
    const history = exerciseHistory[exercise.exerciseSlug] || []
    if (checkForPR({ reps: setData.reps, weightKg: setData.weight }, history)) {
      store.markSetAsPR(exIdx, setIdx)
      setShowPRAnimation(true)
      setTimeout(() => setShowPRAnimation(false), 2000)
    }

    // Save to DB
    if (session.sessionId && profile) {
      const supabase = createClient()
      await supabase.from('session_exercise_logs').insert({
        session_id: session.sessionId,
        exercise_id: exercise.exerciseId,
        exercise_slug: exercise.exerciseSlug,
        set_number: setIdx + 1,
        reps_completed: setData.reps,
        weight_kg: setData.weight,
        is_pr: checkForPR({ reps: setData.reps, weightKg: setData.weight }, history),
        rpe: setData.rpe || null,
        user_id: profile.id,
      })
    }

    // Start rest timer if not last set
    if (setIdx < exercise.sets.length - 1) {
      store.setRestTime(exercise.restSeconds)
      store.setResting(true)
    }
  }, [exerciseHistory, profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinish = async () => {
    setIsFinishing(true)
    const { session } = useWorkoutStore.getState()
    if (!session) return

    const supabase = createClient()
    if (session.sessionId && profile) {
      await supabase.from('workout_sessions').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
        total_volume_kg: session.totalVolume,
      }).eq('id', session.sessionId)

      const { data: lastSessions } = await supabase
        .from('workout_sessions')
        .select('completed_at')
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .neq('id', session.sessionId) // get the one BEFORE this one
        .order('completed_at', { ascending: false })
        .limit(1)

      const streakResult = incrementStreak(
        profile.current_streak || 0,
        profile.longest_streak || 0,
        lastSessions?.[0]?.completed_at || null,
        profile.workout_frequency
      )

      await supabase.from('profiles').update({
        current_streak: streakResult.current_streak,
        longest_streak: streakResult.longest_streak
      }).eq('id', profile.id)
    }

    store.endSession()
    toast.success(`Workout complete! ${session.prsHit > 0 ? `🏆 ${session.prsHit} PR${session.prsHit > 1 ? 's' : ''}!` : '🎉 Great work!'}`)
    router.push('/dashboard')
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ─── Loading / guard ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8BAE9E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!store.session) return null

  const { session } = store
  const currentExercise = session.exercises[session.currentExerciseIndex]
  const currentSets = currentExercise?.sets || []
  const allSetsComplete = currentSets.every(s => s.completed)
  const isLastExercise = session.currentExerciseIndex === session.exercises.length - 1

  // Check if this exercise starts a new section
  const prevExercise = session.currentExerciseIndex > 0
    ? session.exercises[session.currentExerciseIndex - 1]
    : null
  const isNewSection = !prevExercise || prevExercise.section !== currentExercise.section
  const sectionMeta = SECTION_META[currentExercise.section] || SECTION_META.primary_compound

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      {/* PR animation overlay */}
      <AnimatePresence>
        {showPRAnimation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="flex flex-col items-center gap-2 p-8 rounded-3xl bg-[#F9A826]/20 backdrop-blur-xl border border-[#F9A826]/30"
            >
              <Trophy className="w-12 h-12 text-[#F9A826]" />
              <p className="text-2xl font-bold text-[#F9A826]">NEW PR!</p>
              <p className="text-sm text-[#F9A826]/80">Personal Record 🏆</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{session.dayLabel}</p>
          <p className="text-xs text-[#A8B0BE]">{session.currentExerciseIndex + 1} / {session.exercises.length}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-mono text-[#A8B0BE]">
          <Timer className="w-3.5 h-3.5" />
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 mx-5 rounded-full mb-4">
        <motion.div
          className="h-full bg-[#8BAE9E] rounded-full"
          animate={{ width: `${((session.currentExerciseIndex) / session.exercises.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Section header */}
      <AnimatePresence mode="wait">
        {isNewSection && (
          <motion.div
            key={`section-${currentExercise.section}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mx-5 mb-4"
          >
            <div className="h-px flex-1" style={{ backgroundColor: `${sectionMeta.color}20` }} />
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border"
              style={{
                color: sectionMeta.color,
                backgroundColor: `${sectionMeta.color}15`,
                borderColor: `${sectionMeta.color}25`,
              }}
            >
              {sectionMeta.icon} {sectionMeta.label}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: `${sectionMeta.color}20` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.exerciseSlug}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="px-5 flex-1 flex flex-col"
        >
          {/* Exercise info */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold mb-1 flex-1">{currentExercise.exerciseName}</h2>
              <button 
                onClick={() => setShowSwapModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A8B0BE] hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Swap</span>
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">
                {currentExercise.targetSets} sets {isDeload && !['warmup', 'cooldown'].includes(currentExercise.section) && <span className="text-[#8BAE9E] ml-1">(Deload)</span>}
              </span>
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">
                {currentExercise.targetReps} reps
              </span>
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">
                {currentExercise.restSeconds}s rest
              </span>
            </div>
          </div>

          {/* Last session + Progression cue */}
          {(currentExercise.lastWeight !== null || currentExercise.progressionCue) && (
            <div className="mb-4 p-3 rounded-xl bg-[#1D212B] border border-white/5">
              {currentExercise.lastWeight !== null && (
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#A8B0BE]" />
                  <span className="text-xs text-[#A8B0BE]">
                    Last: {currentExercise.lastWeight}kg × {currentExercise.lastReps} reps
                  </span>
                </div>
              )}
              {currentExercise.progressionCue && (
                <p className="text-xs text-[#8BAE9E] mt-1">{currentExercise.progressionCue}</p>
              )}
            </div>
          )}

          {/* Rest timer */}
          {store.isResting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 rounded-2xl bg-[#8BAE9E]/10 border border-[#8BAE9E]/20 text-center"
            >
              <p className="text-xs text-[#8BAE9E] mb-1 uppercase tracking-wider">Rest Time</p>
              <p className="text-4xl font-bold font-mono text-[#8BAE9E]">{store.restTimeRemaining}s</p>
              <button onClick={() => { store.setResting(false); store.setRestTime(0) }} className="text-xs text-[#A8B0BE] mt-2 underline">
                Skip rest
              </button>
            </motion.div>
          )}

          {/* Sets with weight/rep inputs */}
          <div className="flex flex-col gap-2.5 mb-6">
            <div className="flex items-center justify-between text-xs text-[#A8B0BE] px-1 mb-1">
              <span className="w-14">Set</span>
              <span className="flex-1 text-center">Weight (kg)</span>
              <span className="flex-1 text-center">Reps</span>
              <span className="w-10 text-right">Done</span>
            </div>

            {currentSets.map((setData, idx) => (
              <motion.div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  setData.completed
                    ? setData.isPR
                      ? 'bg-[#F9A826]/10 border-[#F9A826]/25'
                      : 'bg-[#74C69D]/10 border-[#74C69D]/25'
                    : 'bg-[#1D212B] border-white/6'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Set number */}
                <span className="w-14 text-sm font-medium">
                  {setData.isPR && '🏆 '}Set {idx + 1}
                </span>

                {/* Weight input */}
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => store.updateSetWeight(session.currentExerciseIndex, idx, Math.max(0, setData.weight - 2.5))}
                    disabled={setData.completed}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={setData.weight}
                    onChange={e => store.updateSetWeight(session.currentExerciseIndex, idx, Math.max(0, Number(e.target.value)))}
                    disabled={setData.completed}
                    className="w-16 text-center bg-white/5 rounded-lg py-1.5 text-sm font-mono font-semibold border-none outline-none focus:ring-1 focus:ring-[#8BAE9E]/30 disabled:opacity-60"
                  />
                  <button
                    onClick={() => store.updateSetWeight(session.currentExerciseIndex, idx, setData.weight + 2.5)}
                    disabled={setData.completed}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Reps input */}
                <div className="flex-1 flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => store.updateSetReps(session.currentExerciseIndex, idx, Math.max(1, setData.reps - 1))}
                    disabled={setData.completed}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    value={setData.reps}
                    onChange={e => store.updateSetReps(session.currentExerciseIndex, idx, Math.max(1, Number(e.target.value)))}
                    disabled={setData.completed}
                    className="w-12 text-center bg-white/5 rounded-lg py-1.5 text-sm font-mono font-semibold border-none outline-none focus:ring-1 focus:ring-[#8BAE9E]/30 disabled:opacity-60"
                  />
                  <button
                    onClick={() => store.updateSetReps(session.currentExerciseIndex, idx, setData.reps + 1)}
                    disabled={setData.completed}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* RPE Selector (Subtle) */}
                {!setData.completed && (
                  <div className="flex flex-col items-center gap-1 mx-2">
                    <span className="text-[8px] text-[#A8B0BE]/40 uppercase font-bold">RPE</span>
                    <select 
                      value={setData.rpe || 8}
                      onChange={(e) => store.updateSetRPE(session.currentExerciseIndex, idx, Number(e.target.value))}
                      className="bg-transparent text-[10px] text-[#A8B0BE] outline-none cursor-pointer"
                    >
                      {[5,6,7,7.5,8,8.5,9,9.5,10].map(val => (
                        <option key={val} value={val} className="bg-[#1D212B]">{val}</option>
                      ))}
                    </select>
                  </div>
                )}
                {setData.completed && setData.rpe && (
                  <div className="mx-2 text-center">
                    <span className="text-[8px] text-[#8BAE9E]/40 uppercase font-bold block">RPE</span>
                    <span className="text-[10px] text-[#8BAE9E] font-bold">{setData.rpe}</span>
                  </div>
                )}

                {/* Complete button */}
                <div className="w-10 flex justify-end">
                  <button
                    onClick={() => handleCompleteSet(session.currentExerciseIndex, idx)}
                    disabled={setData.completed}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      setData.completed
                        ? setData.isPR ? 'bg-[#F9A826]' : 'bg-[#74C69D]'
                        : 'border border-white/20 hover:border-[#8BAE9E]/40 hover:bg-[#8BAE9E]/10'
                    }`}
                  >
                    {setData.completed && <Check className="w-4 h-4 text-[#0F1115]" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Volume counter */}
          {session.totalVolume > 0 && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <Weight className="w-3.5 h-3.5 text-[#8BAE9E]" />
              <span className="text-xs text-[#A8B0BE]">
                Volume: {Math.round(session.totalVolume).toLocaleString()} kg
                {session.prsHit > 0 && ` · ${session.prsHit} PR${session.prsHit > 1 ? 's' : ''} 🏆`}
              </span>
            </div>
          )}

          {/* Next/Finish button */}
          <div className="mt-auto pb-6">
            <button
              onClick={isLastExercise && allSetsComplete ? handleFinish : () => store.nextExercise()}
              disabled={!allSetsComplete || isFinishing}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#8BAE9E] text-[#0F1115] hover:bg-[#A3C4B4]"
            >
              {isFinishing ? (
                <div className="w-4 h-4 border-2 border-[#0F1115] border-t-transparent rounded-full animate-spin" />
              ) : isLastExercise ? (
                <>Finish Workout <Check className="w-4 h-4" /></>
              ) : (
                <>Next Exercise <SkipForward className="w-4 h-4" /></>
              )}
            </button>
            {!allSetsComplete && (
              <p className="text-center text-xs text-[#A8B0BE]/50 mt-2">Complete all sets to continue</p>
            )}
          </div>

          {/* Next exercise preview */}
          {!isLastExercise && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 mb-4">
              <ChevronRight className="w-3.5 h-3.5 text-[#A8B0BE]/40 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#A8B0BE]/60 uppercase tracking-wider">Up next</p>
                <p className="text-sm font-medium">{session.exercises[session.currentExerciseIndex + 1]?.exerciseName}</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Substitution Modal */}
      <AnimatePresence>
        {showSwapModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSwapModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full max-w-lg bg-[#161922] rounded-t-[32px] sm:rounded-3xl p-6 border-t border-white/10 overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Swap Exercise</h3>
                  <p className="text-sm text-[#A8B0BE]">Pattern-equivalent alternatives</p>
                </div>
                <button onClick={() => setShowSwapModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {getRankedSubstitutes(
                  currentExercise.exerciseSlug,
                  profile?.selected_equipment || [],
                  profile?.experience_level || 'beginner',
                  session.exercises.map(ex => ex.exerciseSlug)
                ).map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => handleSwapExercise(sub)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#8BAE9E]/30 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#8BAE9E]/10 flex items-center justify-center text-xl">
                      {sub.slug.includes('barbell') ? '🏋️' : sub.slug.includes('dumbbell') ? '💪' : '🎯'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{sub.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#A8B0BE] px-2 py-0.5 rounded bg-white/5 uppercase font-bold tracking-wider">
                          {sub.movementPattern.replace('_', ' ')}
                        </span>
                        {sub.primaryMuscles.map(m => (
                          <span key={m} className="text-[10px] text-[#8BAE9E] font-medium capitalize">
                            {m.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A8B0BE]" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
