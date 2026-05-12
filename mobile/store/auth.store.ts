import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

import type {
  User,
  Session,
} from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null

  isLoading: boolean
  isAuthenticated: boolean

  setSession: (
    session: Session | null
  ) => void

  setProfile: (
    profile: Profile | null
  ) => void

  fetchProfile: (
    userId: string
  ) => Promise<void>

  signOut: () => Promise<void>

  reset: () => void
}

export const useAuthStore =
  create<AuthState>((set, get) => ({
    user: null,
    session: null,
    profile: null,

    isLoading: true,
    isAuthenticated: false,

    setSession: session => {
      console.log(
        '[AuthStore] setSession | Active:',
        !!session,
        'User:',
        session?.user?.email || 'None'
      )

      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      })
    },

    setProfile: profile => {
      console.log(
        '[AuthStore] setProfile | Exists:',
        !!profile
      )

      set({
        profile,
      })
    },

    fetchProfile: async (
      userId: string
    ) => {
      try {
        console.log(
          '[AuthStore] Fetching profile for:',
          userId
        )

        const { data, error } =
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

        if (error) {
          console.error(
            '[AuthStore] Profile query error:',
            error.message
          )

          return
        }

        if (!data) {
          console.warn(
            '[AuthStore] Profile row missing for user. This is okay, continuing...'
          )

          set({
            profile: null,
          })

          return
        }

        console.log(
          '[AuthStore] Profile fetch success'
        )

        set({
          profile: data as Profile,
        })
      } catch (err: any) {
        console.error(
          '[AuthStore] fetchProfile exception:',
          err?.message || err
        )
      }
    },

    signOut: async () => {
      try {
        await supabase.auth.signOut()
      } finally {
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    },

    reset: () =>
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      }),
  }))

