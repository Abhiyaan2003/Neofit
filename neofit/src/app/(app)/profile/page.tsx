'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { LogOut, ChevronRight, Dumbbell, Target, Calendar, User, Sparkles, Layers, Wrench } from 'lucide-react'
import { GOAL_LABELS, EXPERIENCE_LABELS, SPLIT_LABELS } from '@/constants'
import { PHYSIQUE_PROGRAMS } from '@/constants/physique-programs'
import { PhysiqueProgram, SplitType } from '@/types'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, setProfile } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  // Physique program display
  const physiqueProgram = profile?.physique_program
    ? PHYSIQUE_PROGRAMS[profile.physique_program as PhysiqueProgram]
    : null

  // Split display
  const splitType = profile?.split_type
    ? SPLIT_LABELS[profile.split_type as SplitType]
    : null

  // Equipment count
  const equipmentCount = (profile as any)?.selected_equipment?.length ?? 0

  const PROFILE_ITEMS = [
    {
      label: 'Goal',
      value: profile?.goal ? GOAL_LABELS[profile.goal]?.label : 'Not set',
      icon: Target,
      color: '#F9A826',
    },
    {
      label: 'Physique Program',
      value: physiqueProgram ? `${physiqueProgram.icon} ${physiqueProgram.name}` : 'Not set',
      icon: Sparkles,
      color: '#A274C6',
    },
    {
      label: 'Training Split',
      value: splitType ? `${splitType.icon} ${splitType.label}` : 'Not set',
      icon: Layers,
      color: '#8BAE9E',
    },
    {
      label: 'Experience',
      value: profile?.experience_level ? EXPERIENCE_LABELS[profile.experience_level]?.label : 'Not set',
      icon: Dumbbell,
      color: '#8BAE9E',
    },
    {
      label: 'Training Days',
      value: profile?.workout_frequency ? `${profile.workout_frequency} days/week` : 'Not set',
      icon: Calendar,
      color: '#74C69D',
    },
    {
      label: 'Equipment',
      value: equipmentCount > 0 ? `${equipmentCount} items` : 'Not set',
      icon: Wrench,
      color: '#6BA3C6',
    },
    {
      label: 'Body',
      value: profile?.height_cm && profile?.weight_kg
        ? `${profile.height_cm}cm · ${profile.weight_kg}kg`
        : 'Not set',
      icon: User,
      color: '#A8B0BE',
    },
  ]

  return (
    <div className="px-5 pt-14 pb-4 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
      </motion.div>

      {/* Avatar + Name */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-[#8BAE9E]/20 flex items-center justify-center mb-3 border-2 border-[#8BAE9E]/20">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#8BAE9E]">
              {profile?.name?.[0]?.toUpperCase() ?? 'N'}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold">{profile?.name ?? 'Athlete'}</h2>
        {physiqueProgram && (
          <p className="text-sm text-[#8BAE9E] mt-0.5">{physiqueProgram.icon} {physiqueProgram.name}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-[#A8B0BE] px-3 py-1 rounded-full bg-white/5">
            🔥 {profile?.current_streak ?? 0} day streak
          </span>
          {profile?.longest_streak ? (
            <span className="text-xs text-[#A8B0BE] px-3 py-1 rounded-full bg-white/5">
              🏆 Best: {profile.longest_streak}d
            </span>
          ) : null}
        </div>
      </motion.div>

      {/* Profile details */}
      <div className="flex flex-col gap-2 mb-6">
        <p className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-1 font-medium">Training Profile</p>
        {PROFILE_ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-xl bg-[#1D212B] border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="text-sm text-[#A8B0BE]">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mb-6">
        <p className="text-xs text-[#A8B0BE] uppercase tracking-wider mb-1 font-medium">Settings</p>
        <button
          onClick={() => router.push('/profile/edit')}
          className="flex items-center justify-between p-4 rounded-xl bg-[#1D212B] border border-white/5 hover:border-white/10 transition-all w-full text-left"
        >
          <span className="text-sm font-medium">Edit Profile & Plan</span>
          <ChevronRight className="w-4 h-4 text-[#A8B0BE]/40" />
        </button>
      </div>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-[#FF6B6B]/20 text-[#FF6B6B] text-sm font-medium hover:bg-[#FF6B6B]/5 transition-all disabled:opacity-50"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {isLoggingOut ? (
          <div className="w-4 h-4 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        Sign out
      </motion.button>
    </div>
  )
}
