'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { WorkoutFrequency } from '@/types'

const OPTIONS: { days: WorkoutFrequency; label: string; description: string }[] = [
  { days: 3, label: '3 days/week', description: 'Full body program — ideal for beginners' },
  { days: 4, label: '4 days/week', description: 'Upper/Lower split — balanced recovery' },
  { days: 5, label: '5 days/week', description: 'Push/Pull/Legs — classic intermediate split' },
  { days: 6, label: '6 days/week', description: 'High frequency — advanced training volume' },
]

export function FrequencyStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()

  const handleSelect = (days: WorkoutFrequency) => {
    updateData({ workout_frequency: days })
    setTimeout(() => goNext(), 300)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen px-6 pt-16 pb-8">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-10 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Step 4 of 5</p>
        <h2 className="text-2xl font-bold mb-2">How often can you train?</h2>
        <p className="text-[#A8B0BE] text-sm mb-8">We&apos;ll build a split that fits your schedule.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map(({ days, label, description }, i) => (
          <motion.button
            key={days}
            onClick={() => handleSelect(days)}
            className={`group flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left ${
              data.workout_frequency === days
                ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]/40'
                : 'bg-[#1D212B] border-white/6 hover:border-white/12 hover:bg-[#222733]'
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <p className="font-semibold text-base">{label}</p>
              <p className="text-[#A8B0BE] text-sm mt-0.5">{description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
              data.workout_frequency === days ? 'bg-[#8BAE9E] border-[#8BAE9E]' : 'border-white/20'
            }`} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
