'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Dumbbell, Zap, Target, BarChart3, ChevronDown } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const FEATURES = [
  { icon: Dumbbell, title: 'Equipment-Aware Plans', desc: 'Tell us what your gym has. We build the perfect plan around it.' },
  { icon: Target, title: 'Goal-Driven Programming', desc: 'Muscle gain, fat loss, or strength — we adapt every variable.' },
  { icon: Zap, title: 'No Trainer Needed', desc: 'Structured workouts with video demos. Just show up and train.' },
  { icon: BarChart3, title: 'Track Your Progress', desc: 'Streaks, volume logs, and weekly summaries — see your growth.' },
]

const EQUIPMENT_CATEGORIES = [
  { label: 'Free Weights', items: ['Dumbbells', 'Barbell', 'Plates'] },
  { label: 'Machines', items: ['Leg Press', 'Lat Pulldown', 'Cable'] },
  { label: 'Functional', items: ['Pull-up Bar', 'Bands', 'Dip Bars'] },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0F1115] text-[#EDEDED] overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-xl bg-[#0F1115]/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8BAE9E] flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[#0F1115]" />
          </div>
          <span className="font-semibold text-[#EDEDED] tracking-tight">Neofit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#A8B0BE] hover:text-[#EDEDED] transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#8BAE9E] text-[#0F1115] font-medium px-4 py-2 rounded-full hover:bg-[#A3C4B4] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center mesh-bg">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#8BAE9E]/5 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#74C69D]/4 blur-3xl" />
        </div>

        <motion.div
          className="relative z-10 max-w-2xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#8BAE9E]/10 text-[#8BAE9E] border border-[#8BAE9E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74C69D] animate-pulse" />
              Built for college gym-goers
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
          >
            Train smarter.
            <br />
            <span className="text-gradient">No trainer needed.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg text-[#A8B0BE] leading-relaxed mb-10 max-w-lg mx-auto"
          >
            Neofit builds personalized workout plans based on the equipment in your gym — automatically adapting to your goals and experience level.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold text-base px-7 py-3.5 rounded-full hover:bg-[#A3C4B4] transition-all duration-200"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center text-base text-[#A8B0BE] hover:text-[#EDEDED] px-7 py-3.5 rounded-full border border-white/8 hover:border-white/15 transition-all duration-200"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown className="w-5 h-5 text-[#A8B0BE]/40 animate-bounce" />
        </motion.div>
      </section>

      {/* FEATURE GRID */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Everything you need to train effectively
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#A8B0BE] text-lg max-w-xl mx-auto">
            A complete training system that adapts to you — not the other way around.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group p-6 rounded-2xl bg-[#1D212B] border border-white/5 hover:border-[#8BAE9E]/20 transition-all duration-300 hover:bg-[#222733]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#8BAE9E]/10 flex items-center justify-center mb-4 group-hover:bg-[#8BAE9E]/15 transition-colors">
                <feature.icon className="w-5 h-5 text-[#8BAE9E]" />
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-[#A8B0BE] text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* EQUIPMENT SECTION */}
      <section className="px-6 py-20 bg-[#171A21]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="inline-block text-[#8BAE9E] text-sm font-medium mb-3 uppercase tracking-wider">
              Equipment-Aware
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Build your gym. Get your plan.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#A8B0BE] text-lg max-w-lg mx-auto">
              Select the equipment available in your gym. Neofit will never generate an exercise you can't actually do.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <motion.div
                key={cat.label}
                variants={fadeUp}
                className="p-5 rounded-2xl bg-[#1D212B] border border-white/5"
              >
                <p className="text-xs text-[#8BAE9E] font-medium uppercase tracking-wider mb-3">{cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-full text-sm bg-white/5 text-[#A8B0BE] border border-white/5">
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKOUT PREVIEW */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div>
            <motion.span variants={fadeUp} className="inline-block text-[#8BAE9E] text-sm font-medium mb-3 uppercase tracking-wider">
              Structured Programming
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-5 tracking-tight leading-tight">
              Workouts with purpose. Not random exercises.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#A8B0BE] text-base leading-relaxed mb-6">
              Every session is generated using proven training principles — compound-first ordering, appropriate volume, and progressive overload built in. Your plan adapts to whether you&apos;re a beginner or an experienced lifter.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col gap-3">
              {['Push/Pull/Legs split', 'Upper/Lower programming', 'Full body for 3-day schedules'].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#A8B0BE]">
                  <div className="w-4 h-4 rounded-full bg-[#74C69D]/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#74C69D]" />
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="space-y-3">
            {[
              { day: 'Monday', label: 'Push Day', focus: 'Chest · Shoulders · Triceps', duration: '52 min' },
              { day: 'Wednesday', label: 'Pull Day', focus: 'Back · Biceps', duration: '48 min' },
              { day: 'Friday', label: 'Leg Day', focus: 'Quads · Hamstrings · Glutes', duration: '55 min' },
            ].map((day, i) => (
              <div
                key={day.day}
                className="flex items-center justify-between p-4 rounded-xl bg-[#1D212B] border border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-[#8BAE9E]/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-[#8BAE9E]">{day.day.slice(0, 2)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{day.label}</p>
                    <p className="text-xs text-[#A8B0BE]">{day.focus}</p>
                  </div>
                </div>
                <span className="text-xs text-[#A8B0BE]">{day.duration}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-[#171A21]">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">
            Your gym. Your plan. Start today.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#A8B0BE] text-lg mb-10">
            Join thousands of college gym-goers who train smarter with Neofit.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-[#8BAE9E] text-[#0F1115] font-semibold text-base px-8 py-4 rounded-full hover:bg-[#A3C4B4] transition-all duration-200"
            >
              Build your workout plan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#8BAE9E] flex items-center justify-center">
              <Dumbbell className="w-3.5 h-3.5 text-[#0F1115]" />
            </div>
            <span className="font-semibold text-sm">Neofit</span>
          </div>
          <p className="text-xs text-[#A8B0BE]">© 2024 Neofit. Train intentionally.</p>
          <div className="flex items-center gap-4 text-xs text-[#A8B0BE]">
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#EDEDED] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
