'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { GymPreset } from '@/types'
import { GYM_PRESETS } from '@/constants'
import { createClient } from '@/lib/supabase/client'

const PRESETS: { id: GymPreset; label: string; description: string; emoji: string }[] = [
  { id: 'college_gym', label: 'College Gym', description: 'Standard equipment — barbells, dumbbells, machines', emoji: '🏫' },
  { id: 'full_gym', label: 'Full Gym', description: 'Commercial gym with all equipment', emoji: '🏋️' },
  { id: 'minimal', label: 'Minimal Setup', description: 'Dumbbells, pull-up bar, resistance bands', emoji: '⚡' },
  { id: 'dumbbell_only', label: 'Dumbbells Only', description: 'Just a set of dumbbells and a bench', emoji: '💪' },
  { id: 'custom', label: 'Custom', description: 'Choose exactly what your gym has', emoji: '🔧' },
]

const ALL_EQUIPMENT_BY_CATEGORY = [
  {
    category: 'Free Weights',
    items: ['Dumbbells', 'Barbell', 'Flat Bench', 'Weight Plates', 'EZ Curl Bar', 'Incline Bench'],
  },
  {
    category: 'Machines',
    items: ['Chest Press Machine', 'Leg Extension Machine', 'Lat Pulldown Machine', 'Cable Machine', 'Leg Press Machine', 'Smith Machine', 'Seated Row Machine', 'Leg Curl Machine'],
  },
  {
    category: 'Functional',
    items: ['Pull-up Bar', 'Resistance Bands', 'Kettlebells', 'Dip Bars', 'TRX / Suspension Trainer'],
  },
  {
    category: 'Cardio',
    items: ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical'],
  },
]

export function BuildGymStep() {
  const { goNext, goPrev, updateData, data } = useOnboardingStore()
  const [selectedPreset, setSelectedPreset] = useState<GymPreset | null>(data.gym_preset)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(data.selected_equipment || [])

  const handlePresetSelect = (preset: GymPreset) => {
    setSelectedPreset(preset)
    if (preset !== 'custom') {
      setSelectedEquipment(GYM_PRESETS[preset])
    }
  }

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    )
  }

  const handleNext = () => {
    updateData({
      gym_preset: selectedPreset,
      selected_equipment: selectedEquipment,
    })
    goNext()
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-16 pb-28">
      <button onClick={goPrev} className="flex items-center gap-1 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors mb-8 -ml-1">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[#8BAE9E] text-sm font-medium mb-2 uppercase tracking-wider">Step 5 of 5</p>
        <h2 className="text-2xl font-bold mb-2">Build your gym</h2>
        <p className="text-[#A8B0BE] text-sm mb-6">Select a preset or pick your equipment individually.</p>
      </motion.div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {PRESETS.map((preset, i) => (
          <motion.button
            key={preset.id}
            onClick={() => handlePresetSelect(preset.id)}
            className={`flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all duration-200 text-left ${
              selectedPreset === preset.id
                ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]/40'
                : 'bg-[#1D212B] border-white/6 hover:border-white/12'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-xl">{preset.emoji}</span>
            <p className="font-semibold text-sm">{preset.label}</p>
            <p className="text-[#A8B0BE] text-xs leading-tight">{preset.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Custom equipment picker */}
      {(selectedPreset === 'custom' || selectedPreset) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-medium text-[#A8B0BE] mb-4">
            {selectedPreset === 'custom' ? 'Select your equipment' : 'Or customize your selection:'}
          </p>
          {ALL_EQUIPMENT_BY_CATEGORY.map((cat) => (
            <div key={cat.category} className="mb-5">
              <p className="text-xs text-[#8BAE9E] font-medium uppercase tracking-wider mb-2.5">{cat.category}</p>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleEquipment(item)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      selectedEquipment.includes(item)
                        ? 'bg-[#8BAE9E]/15 border-[#8BAE9E]/40 text-[#8BAE9E]'
                        : 'bg-transparent border-white/10 text-[#A8B0BE] hover:border-white/20'
                    }`}
                  >
                    {selectedEquipment.includes(item) && <Check className="w-3 h-3" />}
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/95 to-transparent">
        <button
          onClick={handleNext}
          disabled={!selectedPreset || selectedEquipment.length === 0}
          className="group w-full flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-4 rounded-2xl hover:bg-[#A3C4B4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate my plan
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        {selectedEquipment.length > 0 && (
          <p className="text-center text-xs text-[#A8B0BE] mt-2">{selectedEquipment.length} equipment item{selectedEquipment.length !== 1 ? 's' : ''} selected</p>
        )}
      </div>
    </div>
  )
}
