'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { createClient } from '@/lib/supabase/client'
import { regenerateWorkoutPlanService } from '@/lib/workout-engine/generator-service'
import { toast } from 'sonner'

const MESSAGES = [
  'Analyzing your goals…',
  'Filtering exercises for your gym…',
  'Building your training split…',
  'Scoring exercises for your physique goals…',
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

      await regenerateWorkoutPlanService(user.id, {
        goal: data.goal,
        physique_program: data.physique_program,
        experience_level: data.experience_level,
        workout_frequency: data.workout_frequency,
        split_type: data.split_type,
        age: data.age,
        height_cm: data.height_cm,
        weight_kg: data.weight_kg,
        selected_equipment: data.selected_equipment,
        gym_preset: data.gym_preset,
      })

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
