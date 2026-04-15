'use client'
import { Star, Quote } from 'lucide-react'
import { TESTIMONIALS } from '@/lib/data'

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-3">Testimonials</p>
          <h2 className="section-title">What Our Users Say</h2>
          <p className="text-gray-500 mt-3">Real stories from real people who found their perfect home</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-linear-to-br from-nexus-50 to-white rounded-2xl p-6 border border-nexus-100 hover:shadow-lg transition-shadow">
              <Quote className="w-8 h-8 text-nexus-200 mb-4" />
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">{t.text}</p>

              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role} · {t.city}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
