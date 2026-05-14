'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { ChevronLeft, Save, Check } from 'lucide-react'
import { GOAL_LABELS, EXPERIENCE_LABELS, SPLIT_LABELS, GYM_PRESETS, EQUIPMENT_ITEMS } from '@/constants'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'
import { Goal, PhysiqueProgram, ExperienceLevel, WorkoutFrequency, SplitType, OnboardingData, EquipmentItem, GymPreset } from '@/types'
import { regenerateWorkoutPlanService } from '@/lib/workout-engine/generator-service'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const PRESETS: { id: GymPreset; label: string; description: string; emoji: string }[] = [
  { id: 'college_gym', label: 'College Gym', description: 'Standard equipment — barbells, dumbbells, machines', emoji: '🏫' },
  { id: 'full_gym', label: 'Full Gym', description: 'Commercial gym with all equipment', emoji: '🏋️' },
  { id: 'minimal', label: 'Minimal Setup', description: 'Dumbbells, pull-up bar, resistance bands', emoji: '⚡' },
  { id: 'dumbbell_only', label: 'Dumbbells Only', description: 'Just a set of dumbbells and a bench', emoji: '💪' },
  { id: 'custom', label: 'Custom', description: 'Choose exactly what your gym has', emoji: '🔧' },
]

const EQUIPMENT_CATEGORIES = [
  { category: 'Free Weights', items: EQUIPMENT_ITEMS.filter(e => ['dumbbells', 'barbell', 'bench', 'incline_bench', 'kettlebell'].includes(e.id)) },
  { category: 'Machines', items: EQUIPMENT_ITEMS.filter(e => ['cable_machine', 'smith_machine', 'leg_press_machine', 'leg_extension_machine', 'leg_curl_machine', 'lat_pulldown_machine', 'chest_press_machine', 'calf_raise_machine'].includes(e.id)) },
  { category: 'Functional', items: EQUIPMENT_ITEMS.filter(e => ['pullup_bar', 'resistance_bands', 'dip_bars', 'plyo_box', 'ab_wheel', 'trx'].includes(e.id)) },
]

export default function EditProfilePage() {
  const router = useRouter()
  const { profile, fetchProfile } = useAuthStore()
  
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<OnboardingData>>({})

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        goal: profile.goal,
        physique_program: profile.physique_program,
        experience_level: profile.experience_level,
        workout_frequency: profile.workout_frequency,
        split_type: profile.split_type,
        age: profile.age,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        selected_equipment: (profile as any).selected_equipment || [],
        gym_preset: profile.gym_preset,
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      await regenerateWorkoutPlanService(session.user.id, formData as OnboardingData)
      
      await fetchProfile() // refresh local store
      toast.success('Profile & Plan updated successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!profile) return null

  return (
    <div className="px-5 pt-14 pb-52 min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-[#A8B0BE] hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Edit Training Plan</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* Equipment Selection - PRIORITY #1 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-[#8BAE9E] uppercase tracking-wider font-bold">Equipment Setup</label>
            <span className="text-[10px] text-[#A8B0BE] bg-white/5 px-2 py-0.5 rounded-full">
              {(formData.selected_equipment || []).length} items
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  const items = preset.id === 'custom' ? (formData.selected_equipment || []) : GYM_PRESETS[preset.id]
                  setFormData(prev => ({ ...prev, gym_preset: preset.id, selected_equipment: items }))
                }}
                className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all ${
                  formData.gym_preset === preset.id
                    ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]'
                    : 'bg-[#1D212B] border-white/5 hover:border-white/10'
                }`}
              >
                <span className="text-lg">{preset.emoji}</span>
                <div className="font-bold text-xs text-white">{preset.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <p className="text-[10px] text-[#A8B0BE] uppercase tracking-widest mb-2 px-1">{cat.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => {
                    const isSelected = (formData.selected_equipment || []).includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          const current = formData.selected_equipment || []
                          const next = isSelected 
                            ? current.filter(e => e !== item.id)
                            : [...current, item.id]
                          setFormData(prev => ({ ...prev, selected_equipment: next, gym_preset: 'custom' }))
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                          isSelected
                            ? 'bg-[#8BAE9E]/20 border-[#8BAE9E] text-[#8BAE9E]'
                            : 'bg-[#0F1115] border-white/5 text-[#A8B0BE]'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                        {item.icon} {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-white/5 mx-2" />

        <div className="flex flex-col gap-6 opacity-80">
        {/* Goal */}
        <section>
          <label className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-2 block font-medium">Primary Goal</label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(GOAL_LABELS) as Goal[]).map((goal) => {
              const info = GOAL_LABELS[goal]
              const isSelected = formData.goal === goal
              return (
                <button
                  key={goal}
                  onClick={() => setFormData(prev => ({ ...prev, goal }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]' 
                      : 'bg-[#1D212B] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="font-medium text-sm text-white mb-0.5">{info.label}</div>
                  <div className="text-xs text-[#A8B0BE]">{info.description}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Physique Program */}
        <section>
          <label className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-2 block font-medium">Physique Program</label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(PHYSIQUE_PROGRAMS) as PhysiqueProgram[]).map((progId) => {
              const prog = PHYSIQUE_PROGRAMS[progId]
              const isSelected = formData.physique_program === progId
              return (
                <button
                  key={progId}
                  onClick={() => setFormData(prev => ({ ...prev, physique_program: progId }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-[#A274C6]/10 border-[#A274C6]' 
                      : 'bg-[#1D212B] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{prog.icon}</span>
                    <span className="font-medium text-sm text-white">{prog.name}</span>
                  </div>
                  <div className="text-xs text-[#A8B0BE]">{prog.tagline}</div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Training Split */}
        <section>
          <label className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-2 block font-medium">Training Split</label>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(SPLIT_LABELS) as SplitType[]).map((split) => {
              const info = SPLIT_LABELS[split]
              const isSelected = formData.split_type === split
              return (
                <button
                  key={split}
                  onClick={() => setFormData(prev => ({ ...prev, split_type: split }))}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]' 
                      : 'bg-[#1D212B] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    <div className="font-medium text-sm text-white mb-0.5">{info.icon} {info.label}</div>
                    <div className="text-xs text-[#A8B0BE]">{info.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Training Frequency */}
        <section>
          <label className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-2 block font-medium">Days per Week</label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map((days) => {
              const isSelected = formData.workout_frequency === days
              return (
                <button
                  key={days}
                  onClick={() => setFormData(prev => ({ ...prev, workout_frequency: days as WorkoutFrequency }))}
                  className={`flex-1 py-3 rounded-xl border text-center transition-all ${
                    isSelected 
                      ? 'bg-[#8BAE9E]/10 border-[#8BAE9E] text-white' 
                      : 'bg-[#1D212B] border-white/5 text-[#A8B0BE] hover:border-white/10'
                  }`}
                >
                  {days}
                </button>
              )
            })}
          </div>
        </section>

        {/* Experience */}
        <section>
          <label className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-2 block font-medium">Experience Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => {
              const info = EXPERIENCE_LABELS[level]
              const isSelected = formData.experience_level === level
              return (
                <button
                  key={level}
                  onClick={() => setFormData(prev => ({ ...prev, experience_level: level }))}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    isSelected 
                      ? 'bg-[#8BAE9E]/10 border-[#8BAE9E]' 
                      : 'bg-[#1D212B] border-white/5 hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span className="text-xs font-medium text-white">{info.label}</span>
                </button>
              )
            })}
          </div>
        </section>

      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-24 left-0 right-0 p-5 z-50 pointer-events-none flex justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full max-w-md bg-[#8BAE9E] text-[#0B0F19] font-bold py-4 rounded-full pointer-events-auto shadow-[0_0_20px_rgba(139,174,158,0.3)] flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-[#0B0F19] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Rebuilding Plan...' : 'Save & Rebuild Plan'}
        </button>
      </div>
    </div>
  )
}
