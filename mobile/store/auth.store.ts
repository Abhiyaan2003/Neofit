import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => set({
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isLoading: false,
  }),

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ profile: data as Profile })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null, isAuthenticated: false })
  },

  reset: () => set({ user: null, session: null, profile: null, isLoading: false, isAuthenticated: false }),
}))
