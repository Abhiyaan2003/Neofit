'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flame, Play, Calendar, ChevronRight, Dumbbell, Clock, TrendingUp, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { Profile, Workout, MuscleGroup, PhysiqueProgram } from '@/types'
import { getDashboardVolumeSnapshot, countWeeklySets, MuscleVolumeReport } from '@/lib/engines/volume-engine'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'
import { SPLIT_LABELS } from '@/constants'
import { evaluateStreak } from '@/lib/engines/streak-engine'
import { regenerateWorkoutPlanService } from '@/lib/workout-engine/generator-service'
import { toast } from 'sonner'
import { Sparkles, RefreshCw, AlertCircle, Layers } from 'lucide-react'
import { PerformanceAudit } from '@/features/dashboard/PerformanceAudit'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const TODAY = new Date().getDay() // 0 = Sunday

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
}

// ─── Volume bar colors ──────────────────────────────────────
const STATUS_COLORS = {
  under: { bar: '#F9A826', bg: '#F9A826', label: 'Under' },
  optimal: { bar: '#74C69D', bg: '#74C69D', label: 'On Track' },
  over: { bar: '#FF6B6B', bg: '#FF6B6B', label: 'Over' },
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedToday, setCompletedToday] = useState(false)
  const [volumeSnapshot, setVolumeSnapshot] = useState<MuscleVolumeReport[]>([])
  const [splitInfo, setSplitInfo] = useState<{ valid_until: string; week_number: number; is_deload: boolean } | null>(null)
  const [isBlockExpired, setIsBlockExpired] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [localStreak, setLocalStreak] = useState(0)

  useEffect(() => {
    if (profile) loadDashboard()
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboard = async () => {
    const supabase = createClient()
    
    // Load today's workout
    const dayOfWeek = TODAY === 0 ? 7 : TODAY
    const { data: workouts } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercises(*))')
      .eq('user_id', profile!.id)
      .eq('day_of_week', dayOfWeek)
      .limit(1)

    if (workouts && workouts.length > 0) setTodayWorkout(workouts[0])

    // Load all workouts for the week
    const { data: allW } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', profile!.id)
      .order('day_of_week')

    if (allW) setAllWorkouts(allW)

    // Check if today's session was completed
    const today = new Date().toISOString().split('T')[0]
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', profile!.id)
      .eq('status', 'completed')
      .gte('started_at', today)
      .limit(1)

    const isTodayDone = !!(session && session.length > 0)
    setCompletedToday(isTodayDone)

    // Load split info and calculate week
    const { data: split } = await supabase
      .from('workout_splits')
      .select('valid_until, created_at')
      .eq('user_id', profile!.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (split) {
      const validUntil = new Date(split.valid_until)
      const createdAt = new Date(split.created_at)
      const now = new Date()
      
      const isExpired = now > validUntil
      setIsBlockExpired(isExpired)

      const diffMs = now.getTime() - createdAt.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const weekNumber = Math.min(4, Math.floor(diffDays / 7) + 1)
      const isDeload = weekNumber === 4

      setSplitInfo({ valid_until: split.valid_until, week_number: weekNumber, is_deload: isDeload })
    }

    // Smart Streak Engine Integration
    const { data: lastSession } = await supabase
      .from('workout_sessions')
      .select('completed_at')
      .eq('user_id', profile!.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)

    const streakResult = evaluateStreak(
      profile!.current_streak || 0,
      profile!.longest_streak || 0,
      lastSession?.[0]?.completed_at || null,
      profile!.workout_frequency,
      isTodayDone
    )

    setLocalStreak(streakResult.current_streak)

    if (streakResult.current_streak !== profile!.current_streak) {
      await supabase.from('profiles').update({
        current_streak: streakResult.current_streak,
        longest_streak: streakResult.longest_streak
      }).eq('id', profile!.id)
    }

    // Load weekly volume data
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekLogs } = await supabase
      .from('session_exercise_logs')
      .select('exercise_slug, reps_completed, weight_kg, set_number')
      .eq('user_id', profile!.id)
      .gte('completed_at', weekAgo.toISOString())

    if (weekLogs && weekLogs.length > 0) {
      const slugs = [...new Set(weekLogs.map(l => l.exercise_slug).filter(Boolean))]
      const { data: dbExercises } = await supabase
        .from('exercises')
        .select('slug, muscle_group, secondary_muscles')
        .in('slug', slugs)

      if (dbExercises) {
        const slugToMuscle: Record<string, { primary: MuscleGroup[], secondary: MuscleGroup[] }> = {}
        for (const ex of dbExercises) {
          slugToMuscle[ex.slug] = {
            primary: [ex.muscle_group as MuscleGroup],
            secondary: (ex.secondary_muscles || []) as MuscleGroup[],
          }
        }

        const exerciseSets: Record<string, number> = {}
        for (const log of weekLogs) {
          if (log.exercise_slug) {
            exerciseSets[log.exercise_slug] = (exerciseSets[log.exercise_slug] || 0) + 1
          }
        }

        const volumeInput = Object.entries(exerciseSets).map(([slug, sets]) => ({
          primaryMuscles: slugToMuscle[slug]?.primary || [],
          secondaryMuscles: slugToMuscle[slug]?.secondary || [],
          sets,
        }))

        const weeklySets = countWeeklySets(volumeInput)
        const snapshot = getDashboardVolumeSnapshot(
          weeklySets,
          (profile?.physique_program as PhysiqueProgram) || null
        )
        setVolumeSnapshot(snapshot)
      }
    }

    setIsLoading(false)
  }

  const handleRotateBlock = async () => {
    setIsRegenerating(true)
    try {
      await regenerateWorkoutPlanService(profile!.id, {
        goal: profile!.goal!,
        physique_program: profile!.physique_program!,
        experience_level: profile!.experience_level!,
        workout_frequency: profile!.workout_frequency!,
        split_type: profile!.split_type!,
        age: profile!.age!,
        height_cm: profile!.height_cm!,
        weight_kg: profile!.weight_kg!,
        selected_equipment: (profile as any).selected_equipment || [],
        gym_preset: profile!.gym_preset!,
      })
      toast.success('New training block generated!')
      loadDashboard()
    } catch (error) {
      toast.error('Failed to rotate block')
    } finally {
      setIsRegenerating(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 pt-14">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-[#1D212B] shimmer" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-14 pb-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <p className="text-[#A8B0BE] text-sm">{greeting()},</p>
          <h1 className="text-2xl font-bold">{profile?.name?.split(' ')[0] ?? 'Athlete'} 👋</h1>
          {profile?.physique_program && PHYSIQUE_PROGRAMS[profile.physique_program as PhysiqueProgram] && (
            <p className="text-xs text-[#8BAE9E] mt-0.5">
              {PHYSIQUE_PROGRAMS[profile.physique_program as PhysiqueProgram].icon}{' '}
              {PHYSIQUE_PROGRAMS[profile.physique_program as PhysiqueProgram].name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1D212B] border border-white/6">
          <Flame className="w-4 h-4 text-[#F9A826]" />
          <span className="text-sm font-semibold">{localStreak}</span>
          <span className="text-xs text-[#A8B0BE]">streak</span>
        </div>
      </motion.div>

      {/* Weekly calendar strip */}
      <motion.div
        className="flex items-center justify-between mb-6"
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {DAYS.map((day, i) => {
          const isToday = (TODAY === 0 ? 6 : TODAY - 1) === i
          const hasWorkout = allWorkouts.some(w => w.day_of_week === i + 1)
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={`text-xs font-medium ${isToday ? 'text-[#8BAE9E]' : 'text-[#A8B0BE]/50'}`}>{day}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isToday
                  ? 'bg-[#8BAE9E] text-[#0F1115] font-bold'
                  : hasWorkout
                  ? 'border border-white/10'
                  : 'opacity-30'
              }`}>
                {hasWorkout && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-[#A8B0BE]/30" />}
                {isToday && <span className="text-xs font-bold">{new Date().getDate()}</span>}
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Block & Deload Status */}
      {splitInfo && (
        <motion.div
          className="flex items-center justify-between mb-4 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8BAE9E]" />
            <span className="text-xs font-medium text-[#A8B0BE]">
              Block 1: Week {splitInfo.week_number} of 4
            </span>
          </div>
          {splitInfo.is_deload && (
            <div className="flex items-center gap-1.5 bg-[#8BAE9E]/10 px-2 py-0.5 rounded-full border border-[#8BAE9E]/20">
              <span className="text-[10px] font-bold text-[#8BAE9E] uppercase tracking-wider">Deload Week 🔋</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Intelligence Insights */}
      {profile && <PerformanceAudit userId={profile.id} />}

      {/* Today's workout card */}
      {todayWorkout ? (
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-[#1D212B] border border-white/6 p-5 mb-5"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#8BAE9E]/5 blur-2xl" />
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-[#8BAE9E] font-medium uppercase tracking-wider mb-1">Today&apos;s Workout</p>
              <h2 className="text-xl font-bold">{todayWorkout.day_label}</h2>
              <p className="text-[#A8B0BE] text-sm mt-0.5">{todayWorkout.focus}</p>
            </div>
            {completedToday && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#74C69D]/15 text-[#74C69D] border border-[#74C69D]/20">
                ✓ Done
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5 text-xs text-[#A8B0BE]">
              <Clock className="w-3.5 h-3.5" />
              <span>{todayWorkout.estimated_duration_minutes ?? '~45'} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#A8B0BE]">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{(todayWorkout as any).workout_exercises?.length ?? 0} exercises</span>
            </div>
          </div>

          <Link
            href={isBlockExpired ? '#' : `/workout/${todayWorkout.id}`}
            onClick={(e) => { if (isBlockExpired) { e.preventDefault(); toast.error('Training block expired. Please rotate.'); } }}
            className={`group flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-colors ${
              isBlockExpired 
                ? 'bg-white/5 text-[#A8B0BE] cursor-not-allowed'
                : 'bg-[#8BAE9E] text-[#0F1115] hover:bg-[#A3C4B4]'
            }`}
          >
            <Play className={`w-4 h-4 ${isBlockExpired ? 'text-[#A8B0BE]/40' : 'fill-current'}`} />
            {completedToday ? 'View Workout' : 'Start Workout'}
          </Link>

          {/* Block Expiration Overlay */}
          {isBlockExpired && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-[#F9A826]/20 flex items-center justify-center mb-3">
                <RefreshCw className="w-6 h-6 text-[#F9A826]" />
              </div>
              <h3 className="text-lg font-bold mb-1">Block Complete!</h3>
              <p className="text-xs text-[#A8B0BE] mb-5">Your 4-week training cycle is over. Rotate exercises to keep progressing.</p>
              <button
                onClick={handleRotateBlock}
                disabled={isRegenerating}
                className="bg-[#F9A826] text-[#0B0F19] px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Rotate to Block 2
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="rounded-2xl bg-[#1D212B] border border-white/6 p-5 mb-5 text-center"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <p className="text-[#A8B0BE] text-sm">No workout scheduled for today.</p>
          <p className="text-xs text-[#A8B0BE]/50 mt-1">Enjoy your rest day! 🛌</p>
        </motion.div>
      )}

      {/* Weekly Volume Widget */}
      {volumeSnapshot.length > 0 && (
        <motion.div
          custom={1.5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl bg-[#1D212B] border border-white/6 p-4 mb-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#8BAE9E]" />
              <h3 className="font-semibold text-sm">Weekly Volume</h3>
            </div>
            <Link href="/progress" className="text-xs text-[#8BAE9E] flex items-center gap-0.5">
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {volumeSnapshot.map((report) => {
              const colors = STATUS_COLORS[report.status]
              const barWidth = Math.min(100, report.percentage)
              return (
                <div key={report.muscle} className="flex items-center gap-3">
                  <span className="text-xs text-[#A8B0BE] w-16 truncate">{report.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#A8B0BE] w-12 text-right">
                    {report.actualSets}/{report.targetMax}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Weekly split preview */}
      {allWorkouts.length > 0 && (
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-base">This Week</h3>
            <Link href="/workouts" className="text-xs text-[#8BAE9E] flex items-center gap-0.5">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {allWorkouts.slice(0, 4).map((w) => (
              <Link
                key={w.id}
                href={`/workout/${w.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#1D212B] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8BAE9E]/10 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-[#8BAE9E]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{w.day_label}</p>
                    <p className="text-xs text-[#A8B0BE]">{w.focus}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A8B0BE]/40" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* No plan yet */}
      {allWorkouts.length === 0 && !isLoading && (
        <motion.div
          className="flex flex-col items-center text-center py-12"
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#8BAE9E]/10 flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-[#8BAE9E]/60" />
          </div>
          <h3 className="font-semibold mb-2">No plan yet</h3>
          <p className="text-sm text-[#A8B0BE] mb-5">Complete onboarding to generate your personalized workout plan.</p>
          <Link
            href="/onboarding"
            className="px-6 py-3 bg-[#8BAE9E] text-[#0F1115] font-semibold rounded-xl text-sm hover:bg-[#A3C4B4] transition-colors"
          >
            Set up my plan
          </Link>
        </motion.div>
      )}
    </div>
  )
}
