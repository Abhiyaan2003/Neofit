'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { Dumbbell, Clock, ChevronRight, Calendar } from 'lucide-react'

export default function WorkoutsPage() {
  const { profile } = useAuthStore()
  const [workouts, setWorkouts] = useState<any[]>([])
  const [splitType, setSplitType] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile) loadWorkouts()
  }, [profile])

  const loadWorkouts = async () => {
    const supabase = createClient()
    const { data: split } = await supabase
      .from('workout_splits')
      .select('split_type, workouts(*, workout_exercises(*, exercises(*)))')
      .eq('user_id', profile!.id)
      .eq('is_active', true)
      .single()

    if (split) {
      setSplitType(split.split_type)
      setWorkouts((split.workouts as any[]).sort((a, b) => a.day_of_week - b.day_of_week))
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="px-5 pt-14 flex flex-col gap-3">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-[#1D212B] shimmer" />)}
      </div>
    )
  }

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">My Workouts</h1>
        {splitType && (
          <p className="text-sm text-[#A8B0BE] capitalize">{splitType.replace(/_/g, ' ')} Split</p>
        )}
      </motion.div>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#8BAE9E]/10 flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-[#8BAE9E]/50" />
          </div>
          <p className="text-[#A8B0BE] text-sm mb-4">No workout plan yet</p>
          <Link href="/onboarding" className="text-sm bg-[#8BAE9E] text-[#0F1115] px-5 py-2.5 rounded-xl font-semibold">
            Create My Plan
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w, i) => {
            const allExs: any[] = w.workout_exercises || []
            const coreExs = allExs.filter((ex: any) => ex.exercises?.muscle_group === 'core')
            const mainExs = allExs.filter((ex: any) => ex.exercises?.muscle_group !== 'core')
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/workout/${w.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#1D212B] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#8BAE9E]/10 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-[#8BAE9E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm">{w.day_label}</p>
                    </div>
                    <p className="text-xs text-[#A8B0BE] truncate">{w.focus}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-xs text-[#A8B0BE]/60">
                        <Dumbbell className="w-3 h-3" />
                        {mainExs.length} lifts
                        {coreExs.length > 0 && (
                          <span className="text-[#74C69D]/70 ml-1">+ {coreExs.length} core</span>
                        )}
                      </div>
                      {w.estimated_duration_minutes && (
                        <div className="flex items-center gap-1 text-xs text-[#A8B0BE]/60">
                          <Clock className="w-3 h-3" />
                          {w.estimated_duration_minutes} min
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A8B0BE]/30 flex-shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
