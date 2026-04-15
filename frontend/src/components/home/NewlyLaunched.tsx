'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { MOCK_PROPERTIES } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import PropertyCard from '@/components/properties/PropertyCard'

export default function NewlyLaunched() {
  const newLaunches = MOCK_PROPERTIES.filter(p => p.tag === 'NEW LAUNCH' || p.tag === 'NEW ARRIVAL').slice(0, 3)
  const featured = MOCK_PROPERTIES.filter(p => p.tag === 'FEATURED' || p.tag === 'HOT').slice(0, 3)
  const placeholderImage = 'https://via.placeholder.com/1200x800?text=Property'

  return (
    <section className="py-16 bg-linear-to-b from-nexus-50/50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-2">🚀 Just Launched</p>
              <h2 className="section-title">Newly Launched Projects</h2>
              <p className="text-gray-500 mt-2">Bigger home in the same budget</p>
            </div>
            <Link href="/properties?status=new-launch" className="hidden md:flex items-center gap-2 text-nexus-600 font-semibold hover:text-nexus-700 transition-colors group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newLaunches.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={property.images?.[0] ?? property.image ?? placeholderImage}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    property.tag === 'NEW LAUNCH' ? 'bg-nexus-600 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {property.tag}
                  </span>
                  {property.isRera && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-2.5 h-2.5" />RERA
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-display font-bold text-gray-900 text-lg">{property.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{property.location}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-display font-bold text-nexus-700">{formatPrice(property.price)}</span>
                    <span className="text-gray-500 text-sm">{property.bedrooms} BHK Apartment</span>
                  </div>

                  {property.priceChange && (
                    <div className="flex items-center gap-1 text-emerald-600 text-sm mb-4">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-medium">{property.priceChange}% price increase in last 1 year</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      🏷️ Get preferred options @zero brokerage
                    </span>
                    <button className="bg-nexus-600 hover:bg-nexus-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                      View Number
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-2">⭐ Handpicked</p>
              <h2 className="section-title">Featured Residential Projects</h2>
              <p className="text-gray-500 mt-2">Featured projects across India</p>
            </div>
            <Link href="/properties?tag=featured" className="hidden md:flex items-center gap-2 text-nexus-600 font-semibold hover:text-nexus-700 transition-colors group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
