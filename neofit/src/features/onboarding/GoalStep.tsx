'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { GOAL_LABELS } from '@/constants'
import { Goal } from '@/types'

const GOALS = Object.entries(GOAL_LABELS) as [Goal, typeof GOAL_LABELS[keyof typeof GOAL_LABELS]][]

export function GoalStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()

  const handleSelect = (goal: Goal) => {
    updateData({ goal })
    setTimeout(() => goNext(), 300)
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen px-6 pt-16 pb-8">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-10 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Step 1 of 5</p>
        <h2 className="text-2xl font-bold mb-2">What&apos;s your main goal?</h2>
        <p className="text-[#A8B0BE] text-sm mb-8">We&apos;ll tailor your workout plan around this.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3">
        {GOALS.map(([key, { label, description, icon }], i) => (
          <motion.button
            key={key}
            onClick={() => handleSelect(key)}
            className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
              data.goal === key
                ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]/40'
                : 'bg-[#1D212B] border-white/6 hover:border-white/12 hover:bg-[#222733]'
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
              data.goal === key ? 'bg-[#8BAE9E]/20' : 'bg-white/5 group-hover:bg-white/8'
            }`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm transition-colors ${data.goal === key ? 'text-[#EDEDED]' : 'text-[#EDEDED]'}`}>{label}</p>
              <p className="text-[#A8B0BE] text-xs mt-0.5">{description}</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
              data.goal === key ? 'bg-[#8BAE9E] border-[#8BAE9E]' : 'border-white/20'
            }`}>
              {data.goal === key && (
                <motion.div className="w-full h-full rounded-full bg-[#8BAE9E]" layoutId="goal-check" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
