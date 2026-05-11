'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { EXPERIENCE_LABELS } from '@/constants'
import { ExperienceLevel } from '@/types'

const LEVELS = Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, typeof EXPERIENCE_LABELS[keyof typeof EXPERIENCE_LABELS]][]

export function ExperienceStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()

  const handleSelect = (level: ExperienceLevel) => {
    updateData({ experience_level: level })
    setTimeout(() => goNext(), 300)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen px-6 pt-16 pb-8">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-10 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Step 2 of 5</p>
        <h2 className="text-2xl font-bold mb-2">Your experience level?</h2>
        <p className="text-[#A8B0BE] text-sm mb-8">This helps us calibrate volume and intensity.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {LEVELS.map(([key, { label, description }], i) => (
          <motion.button
            key={key}
            onClick={() => handleSelect(key)}
            className={`group flex flex-col gap-1 p-5 rounded-2xl border transition-all duration-200 text-left ${
              data.experience_level === key
                ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]/40'
                : 'bg-[#1D212B] border-white/6 hover:border-white/12 hover:bg-[#222733]'
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-base">{label}</p>
              <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                data.experience_level === key ? 'bg-[#8BAE9E] border-[#8BAE9E]' : 'border-white/20'
              }`} />
            </div>
            <p className="text-[#A8B0BE] text-sm">{description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
