'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Play, Check, Timer, SkipForward } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

interface WorkoutExercise {
  id: string
  order_index: number
  sets: number
  reps: string
  rest_time_seconds: number
  exercises: {
    id: string
    name: string
    muscle_group: string
    video_url: string | null
    instructions: string[]
    default_sets: number
    default_reps: string
  }
}

interface SetState {
  completed: boolean
  reps: number
  weight: number
}

export default function WorkoutSessionPage() {
  const { workoutId } = useParams()
  const router = useRouter()
  const { profile } = useAuthStore()
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [workoutInfo, setWorkoutInfo] = useState<{ day_label: string; focus: string } | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sets, setSets] = useState<SetState[][]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isResting, setIsResting] = useState(false)
  const [restSeconds, setRestSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    loadWorkout()
    const timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [workoutId])

  useEffect(() => {
    if (!isResting) return
    if (restSeconds <= 0) { setIsResting(false); return }
    const t = setTimeout(() => setRestSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [isResting, restSeconds])

  const loadWorkout = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('workouts')
      .select('day_label, focus, workout_exercises(*, exercises(*))')
      .eq('id', workoutId)
      .single()

    if (data) {
      setWorkoutInfo({ day_label: data.day_label, focus: data.focus })
      const exs = (data.workout_exercises as WorkoutExercise[]).sort((a, b) => a.order_index - b.order_index)
      setExercises(exs)
      setSets(exs.map(ex => Array.from({ length: ex.sets }, () => ({ completed: false, reps: parseInt(ex.reps.split('-')[1] || ex.reps) || 10, weight: 0 }))))

      // Create session
      if (profile) {
        const { data: session } = await supabase.from('workout_sessions').insert({
          user_id: profile.id,
          workout_id: workoutId,
          status: 'in_progress',
        }).select().single()
        if (session) setSessionId(session.id)
      }
    }
    setIsLoading(false)
  }

  const currentExercise = exercises[currentIdx]
  const currentSets = sets[currentIdx] || []
  const allSetsComplete = currentSets.every(s => s.completed)
  const isLastExercise = currentIdx === exercises.length - 1

  const completeSet = (setIdx: number) => {
    setSets(prev => {
      const updated = prev.map((ex, i) => i === currentIdx
        ? ex.map((s, j) => j === setIdx ? { ...s, completed: true } : s)
        : ex
      )
      return updated
    })
    const ex = exercises[currentIdx]
    if (setIdx < currentSets.length - 1) {
      setRestSeconds(ex.rest_time_seconds)
      setIsResting(true)
    }
  }

  const nextExercise = () => {
    setIsResting(false)
    setRestSeconds(0)
    if (!isLastExercise) {
      setCurrentIdx(i => i + 1)
    } else {
      finishWorkout()
    }
  }

  const finishWorkout = async () => {
    setIsFinishing(true)
    const supabase = createClient()
    if (sessionId) {
      await supabase.from('workout_sessions').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: elapsedSeconds,
      }).eq('id', sessionId)
    }
    toast.success('Workout complete! Great work! 🎉')
    router.push('/dashboard')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8BAE9E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!currentExercise) return null

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold">{workoutInfo?.day_label}</p>
          <p className="text-xs text-[#A8B0BE]">{currentIdx + 1} / {exercises.length}</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-mono text-[#A8B0BE]">
          <Timer className="w-3.5 h-3.5" />
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5 mx-5 rounded-full mb-6">
        <motion.div
          className="h-full bg-[#8BAE9E] rounded-full"
          animate={{ width: `${((currentIdx) / exercises.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Exercise info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="px-5 flex-1 flex flex-col"
        >
          {/* Video/Demo area */}
          <div className="relative rounded-2xl bg-[#1D212B] border border-white/5 overflow-hidden mb-5" style={{ height: 220 }}>
            {currentExercise.exercises.video_url ? (
              <iframe
                src={currentExercise.exercises.video_url.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#8BAE9E]/10 flex items-center justify-center">
                  <Play className="w-7 h-7 text-[#8BAE9E]" />
                </div>
                <p className="text-xs text-[#A8B0BE]">No video available</p>
              </div>
            )}
          </div>

          <div className="mb-5">
            {/* Section label — show "Core" badge when entering core exercises */}
            {currentExercise.exercises.muscle_group === 'core' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="h-px flex-1 bg-[#74C69D]/20" />
                <span className="text-[10px] font-bold tracking-widest text-[#74C69D] uppercase px-2 py-0.5 rounded-full bg-[#74C69D]/10 border border-[#74C69D]/20">
                  Core Work
                </span>
                <div className="h-px flex-1 bg-[#74C69D]/20" />
              </motion.div>
            )}
            <h2 className="text-xl font-bold mb-1">{currentExercise.exercises.name}</h2>
            <p className="text-sm text-[#8BAE9E] capitalize">{currentExercise.exercises.muscle_group}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">{currentExercise.sets} sets</span>
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">{currentExercise.reps} reps</span>
              <span className="text-xs text-[#A8B0BE] px-2.5 py-1 rounded-full bg-white/5">{currentExercise.rest_time_seconds}s rest</span>
            </div>
          </div>

          {/* Rest timer */}
          {isResting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 rounded-2xl bg-[#8BAE9E]/10 border border-[#8BAE9E]/20 text-center"
            >
              <p className="text-xs text-[#8BAE9E] mb-1 uppercase tracking-wider">Rest Time</p>
              <p className="text-4xl font-bold font-mono text-[#8BAE9E]">{restSeconds}s</p>
              <button onClick={() => { setIsResting(false); setRestSeconds(0) }} className="text-xs text-[#A8B0BE] mt-2 underline">Skip rest</button>
            </motion.div>
          )}

          {/* Sets */}
          <div className="flex flex-col gap-2 mb-6">
            <p className="text-sm font-medium text-[#A8B0BE] mb-1">Sets</p>
            {currentSets.map((set, idx) => (
              <motion.button
                key={idx}
                onClick={() => !set.completed && completeSet(idx)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  set.completed
                    ? 'bg-[#74C69D]/10 border-[#74C69D]/25 opacity-80'
                    : 'bg-[#1D212B] border-white/6 hover:border-white/12'
                }`}
                whileTap={!set.completed ? { scale: 0.97 } : {}}
              >
                <span className="text-sm font-medium">Set {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#A8B0BE]">{set.reps} reps</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    set.completed ? 'bg-[#74C69D]' : 'border border-white/20'
                  }`}>
                    {set.completed && <Check className="w-3.5 h-3.5 text-[#0F1115]" />}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Next/Finish */}
          <div className="mt-auto pb-6">
            <button
              onClick={nextExercise}
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
                <p className="text-sm font-medium">{exercises[currentIdx + 1]?.exercises.name}</p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
