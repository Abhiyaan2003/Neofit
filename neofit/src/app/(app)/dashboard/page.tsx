'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flame, Play, Calendar, ChevronRight, Dumbbell, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { Profile, Workout } from '@/types'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const TODAY = new Date().getDay() // 0 = Sunday

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedToday, setCompletedToday] = useState(false)

  useEffect(() => {
    if (profile) loadDashboard()
  }, [profile])

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

    setCompletedToday(!!(session && session.length > 0))
    setIsLoading(false)
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
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1D212B] border border-white/6">
          <Flame className="w-4 h-4 text-[#F9A826]" />
          <span className="text-sm font-semibold">{profile?.current_streak ?? 0}</span>
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
            href={`/workout/${todayWorkout.id}`}
            className="group flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-3.5 rounded-xl hover:bg-[#A3C4B4] transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            {completedToday ? 'View Workout' : 'Start Workout'}
          </Link>
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
