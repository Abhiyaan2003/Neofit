'use client'
// [Touched to refresh IDE]

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { PhysiqueProgram } from '@/types'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'

const PROGRAMS = Object.values(PHYSIQUE_PROGRAMS)

export function PhysiqueProgramStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()
  const [selected, setSelected] = useState<PhysiqueProgram | null>(data.physique_program)

  const handleNext = () => {
    if (!selected) return
    updateData({ physique_program: selected })
    goNext()
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-28">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-8 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Physique Program</p>
        <h2 className="text-2xl font-bold mb-2">What physique are you building?</h2>
        <p className="text-[#A8B0BE] text-sm mb-6">This drives muscle priority and exercise selection throughout your program.</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {PROGRAMS.map((program, i) => (
          <motion.button
            key={program.id}
            onClick={() => setSelected(program.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              selected === program.id
                ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]/40'
                : 'bg-[#1D212B] border-white/6 hover:border-white/12'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl mt-0.5">{program.icon}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{program.name}</p>
              <p className="text-[#A8B0BE] text-xs mt-0.5">{program.tagline}</p>
              <p className="text-[#A8B0BE]/60 text-[11px] mt-1 leading-snug">{program.description}</p>
            </div>
            {selected === program.id && (
              <div className="w-5 h-5 rounded-full bg-[#8BAE9E] flex items-center justify-center mt-1 shrink-0">
                <svg className="w-3 h-3 text-[#0F1115]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/95 to-transparent">
        <button
          onClick={handleNext}
          disabled={!selected}
          className="group w-full flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-4 rounded-2xl hover:bg-[#A3C4B4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
