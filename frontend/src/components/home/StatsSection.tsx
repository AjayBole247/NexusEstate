'use client'
import { useEffect, useRef, useState } from 'react'
import { Users, Building2, TrendingUp, Shield, Award, Clock } from 'lucide-react'

const stats = [
  { icon: Users, value: 100000, suffix: '+', label: 'Daily Active Users', color: 'text-nexus-500' },
  { icon: Building2, value: 250000, suffix: '+', label: 'Properties Listed', color: 'text-emerald-500' },
  { icon: TrendingUp, value: 50, suffix: '+', label: 'Cities Covered', color: 'text-amber-500' },
  { icon: Shield, value: 98, suffix: '%', label: 'Verified Listings', color: 'text-purple-500' },
  { icon: Award, value: 12000, suffix: '+', label: 'Happy Buyers Monthly', color: 'text-rose-500' },
  { icon: Clock, value: 4.8, suffix: '/5', label: 'User Rating', color: 'text-cyan-500' },
]

function useCounter(end: number, duration = 2000, started: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!started) return
    const isDecimal = end % 1 !== 0
    const steps = 60
    const stepValue = end / steps
    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [end, duration, started])
  return count
}

function StatItem({ stat, started }: { stat: typeof stats[0], started: boolean }) {
  const count = useCounter(stat.value, 2000, started)
  return (
    <div className="text-center group">
      <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <stat.icon className={`w-7 h-7 ${stat.color}`} />
      </div>
      <div className="text-4xl font-display font-bold text-white mb-1">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="text-nexus-200 text-sm">{stat.label}</div>
    </div>
  )
}

export default function StatsSection() {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-20 nexus-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-nexus-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-nexus-300 text-sm font-semibold tracking-widest uppercase mb-3">Why NexusEstate?</p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            India's Fastest Growing PropTech
          </h2>
          <p className="text-nexus-200 max-w-xl mx-auto">
            Trusted by lakhs of Indians to find their dream home, make smart investments, and seamlessly swap leases across cities.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} started={started} />
          ))}
        </div>
      </div>
    </section>
  )
}
