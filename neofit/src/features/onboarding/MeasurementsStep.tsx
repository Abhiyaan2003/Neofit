'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'

export function MeasurementsStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()
  const [age, setAge] = useState(data.age ?? 20)
  const [height, setHeight] = useState(data.height_cm ?? 170)
  const [weight, setWeight] = useState(data.weight_kg ?? 70)

  const handleNext = () => {
    updateData({ age, height_cm: height, weight_kg: weight })
    goNext()
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen px-6 pt-16 pb-8">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-10 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Step 3 of 5</p>
        <h2 className="text-2xl font-bold mb-2">About your body</h2>
        <p className="text-[#A8B0BE] text-sm mb-8">Used to estimate calories and tailor programming.</p>
      </motion.div>

      <div className="flex flex-col gap-8 flex-1">
        {/* Age */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#A8B0BE]">Age</label>
            <span className="text-2xl font-bold">{age}<span className="text-sm text-[#A8B0BE] font-normal ml-1">yrs</span></span>
          </div>
          <input
            type="range"
            min={15}
            max={60}
            value={age}
            onChange={e => setAge(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8BAE9E]"
          />
          <div className="flex justify-between text-xs text-[#A8B0BE]/50 mt-1.5">
            <span>15</span><span>60</span>
          </div>
        </motion.div>

        {/* Height */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#A8B0BE]">Height</label>
            <span className="text-2xl font-bold">{height}<span className="text-sm text-[#A8B0BE] font-normal ml-1">cm</span></span>
          </div>
          <input
            type="range"
            min={140}
            max={220}
            value={height}
            onChange={e => setHeight(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8BAE9E]"
          />
          <div className="flex justify-between text-xs text-[#A8B0BE]/50 mt-1.5">
            <span>140cm</span><span>220cm</span>
          </div>
        </motion.div>

        {/* Weight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-[#A8B0BE]">Body Weight</label>
            <span className="text-2xl font-bold">{weight}<span className="text-sm text-[#A8B0BE] font-normal ml-1">kg</span></span>
          </div>
          <input
            type="range"
            min={40}
            max={150}
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#8BAE9E]"
          />
          <div className="flex justify-between text-xs text-[#A8B0BE]/50 mt-1.5">
            <span>40kg</span><span>150kg</span>
          </div>
        </motion.div>
      </div>

      <motion.button
        onClick={handleNext}
        className="group mt-8 w-full flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-4 rounded-2xl hover:bg-[#A3C4B4] transition-colors"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.98 }}
      >
        Continue
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  )
}
