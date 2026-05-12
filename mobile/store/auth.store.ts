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
        '[AuthStore] setSession:',
        !!session
      )

      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,

        /**
         * IMPORTANT:
         * Do NOT block UI loading
         * waiting for profile fetch.
         */
        isLoading: false,
      })
    },

    setProfile: profile => {
      console.log(
        '[AuthStore] setProfile:',
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
          '[AuthStore] Fetching profile:',
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
            '[AuthStore] Profile fetch error:',
            error
          )

          return
        }

        if (!data) {
          console.warn(
            '[AuthStore] No profile found'
          )

          /**
           * IMPORTANT:
           * User is still authenticated
           * even without profile row.
           */
          set({
            profile: null,
          })

          return
        }

        console.log(
          '[AuthStore] Profile loaded'
        )

        set({
          profile: data as Profile,
        })
      } catch (err) {
        console.error(
          '[AuthStore] fetchProfile failed:',
          err
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

