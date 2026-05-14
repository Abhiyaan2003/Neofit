'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { ChevronLeft, Save } from 'lucide-react'
import { GOAL_LABELS, EXPERIENCE_LABELS, SPLIT_LABELS } from '@/constants'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'
import { Goal, PhysiqueProgram, ExperienceLevel, WorkoutFrequency, SplitType, OnboardingData, EquipmentItem, GymPreset } from '@/types'
import { regenerateWorkoutPlanService } from '@/lib/workout-engine/generator-service'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
    <div className="px-5 pt-14 pb-24 min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-[#A8B0BE] hover:text-white transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold ml-2">Edit Training Plan</h1>
      </div>

      <div className="flex flex-col gap-6">
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
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0B0F19] to-transparent pointer-events-none flex justify-center">
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
