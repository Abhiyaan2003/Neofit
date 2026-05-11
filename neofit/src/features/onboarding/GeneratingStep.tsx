'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { createClient } from '@/lib/supabase/client'
import { generateWorkoutPlan, getEquipmentFromPreset } from '@/lib/workout-engine'
import { toast } from 'sonner'

const MESSAGES = [
  'Analyzing your goals…',
  'Filtering exercises for your gym…',
  'Building your training split…',
  'Ordering compound movements…',
  'Setting up your weekly plan…',
  'Almost ready…',
]

export function GeneratingStep() {
  const router = useRouter()
  const { data, reset } = useOnboardingStore()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    generatePlan()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const generatePlan = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 1. Update profile
      await supabase.from('profiles').update({
        goal: data.goal,
        experience_level: data.experience_level,
        age: data.age,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        workout_frequency: data.workout_frequency,
        onboarding_complete: true,
      }).eq('id', user.id)

      // 2. Deactivate any existing splits
      await supabase.from('workout_splits').update({ is_active: false }).eq('user_id', user.id)

      // 3. Create or update gym profile
      const { data: gymProfile } = await supabase
        .from('gym_profiles')
        .upsert({ user_id: user.id, name: 'My Gym', preset: data.gym_preset }, { onConflict: 'user_id' })
        .select()
        .single()

      if (gymProfile) {
        // Link equipment: delete old links first, then re-insert
        await supabase.from('gym_equipment').delete().eq('gym_profile_id', gymProfile.id)
        const { data: dbEquipment } = await supabase.from('equipment').select('id, name')
        const matching = (dbEquipment || []).filter(e => data.selected_equipment.includes(e.name))
        if (matching.length > 0) {
          await supabase.from('gym_equipment').insert(
            matching.map(e => ({ gym_profile_id: gymProfile.id, equipment_id: e.id }))
          )
        }
      }

      // 4. Run the workout engine (uses local exercise data)
      const equipmentNames = getEquipmentFromPreset(data.gym_preset!, data.selected_equipment)
      const { splitType, days } = generateWorkoutPlan(
        data.goal!,
        data.experience_level!,
        data.workout_frequency!,
        equipmentNames,
        data.gym_preset ?? undefined,
      )

      // 5. Fetch all exercise UUIDs from DB indexed by slug
      const { data: dbExercises } = await supabase.from('exercises').select('id, slug')
      const slugToId: Record<string, string> = {}
      ;(dbExercises || []).forEach(ex => { slugToId[ex.slug] = ex.id })

      // 6. Save split
      const { data: split } = await supabase.from('workout_splits').insert({
        user_id: user.id,
        split_type: splitType,
        is_active: true,
      }).select().single()

      if (split) {
        for (let i = 0; i < days.length; i++) {
          const day = days[i]
          const { data: workout } = await supabase.from('workouts').insert({
            split_id: split.id,
            user_id: user.id,
            day_of_week: i + 1,
            day_label: day.dayLabel,
            focus: day.focus,
            estimated_duration_minutes: day.estimatedDuration,
          }).select().single()

          if (workout) {
            // Only insert exercises that have a matching DB UUID
            type ExerciseRow = {
              workout_id: string
              exercise_id: string
              order_index: number
              sets: number
              reps: string
              rest_time_seconds: number
            }
            const exerciseRows: ExerciseRow[] = day.exercises
              .map((ex, idx) => {
                const dbId = slugToId[ex.exercise.slug]
                if (!dbId) return null
                return {
                  workout_id: workout.id,
                  exercise_id: dbId,
                  order_index: idx,
                  sets: ex.sets,
                  reps: ex.reps,
                  rest_time_seconds: ex.restTime,
                } satisfies ExerciseRow
              })
              .filter((r): r is ExerciseRow => r !== null)

            if (exerciseRows.length > 0) {
              await supabase.from('workout_exercises').insert(exerciseRows)
            }
          }
        }
      }

      reset()
      router.push('/dashboard')
    } catch (err) {
      console.error('Plan generation error:', err)
      toast.error('Something went wrong generating your plan.')
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8BAE9E]/5 blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated rings */}
        <div className="relative w-24 h-24 mb-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-[#8BAE9E]/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
            />
          ))}
          <div className="absolute inset-3 rounded-full bg-[#8BAE9E]/20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#8BAE9E] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">Building your plan</h2>

        <RotatingMessages messages={MESSAGES} />

        <p className="text-xs text-[#A8B0BE]/40 mt-8">Personalized just for you</p>
      </motion.div>
    </div>
  )
}

function RotatingMessages({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, 1500)
    return () => clearInterval(timer)
  }, [messages.length])

  return (
    <div className="h-6 overflow-hidden">
      <motion.p
        key={index}
        className="text-[#A8B0BE] text-base"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {messages[index]}
      </motion.p>
    </div>
  )
}
