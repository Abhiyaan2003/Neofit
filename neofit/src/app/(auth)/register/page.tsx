'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dumbbell, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name } },
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    toast.success('Account created! Let\'s set up your profile.')
    router.push('/onboarding')
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      if (error.message.toLowerCase().includes('provider') || error.message.toLowerCase().includes('not enabled')) {
        toast.error('Google sign-in is not configured yet. Please use email & password.')
      } else {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-sm"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#8BAE9E] flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-[#0F1115]" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-[#A8B0BE] text-sm">Start training smarter today</p>
        </motion.div>

        <motion.button
          variants={fadeUp}
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#1D212B] border border-white/8 text-sm font-medium hover:bg-[#222733] hover:border-white/12 transition-all mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </motion.button>

        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-xs text-[#A8B0BE]">or</span>
          <div className="flex-1 h-px bg-white/6" />
        </motion.div>

        <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#A8B0BE] mb-2 block">Full name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Alex Johnson"
              className="w-full px-4 py-3 rounded-xl bg-[#1D212B] border border-white/8 text-sm text-[#EDEDED] placeholder:text-[#A8B0BE]/50 focus:outline-none focus:border-[#8BAE9E]/50 transition-colors"
            />
            {errors.name && <p className="text-xs text-[#FF6B6B] mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#A8B0BE] mb-2 block">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@university.edu"
              className="w-full px-4 py-3 rounded-xl bg-[#1D212B] border border-white/8 text-sm text-[#EDEDED] placeholder:text-[#A8B0BE]/50 focus:outline-none focus:border-[#8BAE9E]/50 transition-colors"
            />
            {errors.email && <p className="text-xs text-[#FF6B6B] mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#A8B0BE] mb-2 block">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-[#1D212B] border border-white/8 text-sm text-[#EDEDED] placeholder:text-[#A8B0BE]/50 focus:outline-none focus:border-[#8BAE9E]/50 transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B0BE] hover:text-[#EDEDED] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-[#FF6B6B] mt-1.5">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold py-3 rounded-xl hover:bg-[#A3C4B4] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#0F1115] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Create account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.form>

        <motion.p variants={fadeUp} className="text-center text-sm text-[#A8B0BE] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#8BAE9E] hover:text-[#A3C4B4] font-medium transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
