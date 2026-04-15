'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown, Mic } from 'lucide-react'
import { INDIAN_CITIES } from '@/lib/data'

const searchTabs = ['Buy', 'Rent', 'New Launch', 'Commercial', 'Plots/Land', 'Projects']

export default function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Buy')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCity) params.set('city', selectedCity)
    if (activeTab === 'Rent') router.push(`/rent?${params}`)
    else router.push(`/properties?${params}`)
  }

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
          alt="Real Estate"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-nexus-950/90 via-nexus-900/75 to-nexus-800/50" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">100K+ Daily Users · AI-Powered Platform</span>
          </div>

          <h1 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Find, Buy &{' '}
            <span className="relative">
              <span className="text-gold-400">Own</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none">
                <path d="M0 8 Q100 0 200 8" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </span>{' '}
            <br />Your Dream Home
          </h1>

          <p className="text-white/75 text-lg mb-10 max-w-xl">
            Explore apartments, villas, plots, and commercial spaces across India.
            AI-powered insights to help you make the smartest investment.
          </p>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-5 py-3.5 text-sm font-medium transition-all relative ${
                    activeTab === tab
                      ? 'text-nexus-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                  {tab === 'New Launch' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-stretch">
              <div className="relative border-r border-gray-200">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 px-4 h-full min-w-35 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-nexus-500 shrink-0" />
                  <span className="text-sm font-medium truncate">{selectedCity || 'All India'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {showCityDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-64 overflow-y-auto z-50">
                    <button
                      onClick={() => { setSelectedCity(''); setShowCityDropdown(false) }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-nexus-50"
                    >
                      All India
                    </button>
                    {INDIAN_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setShowCityDropdown(false) }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-nexus-50 hover:text-nexus-600"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search locality, project, society, landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm py-4"
                />
                <button className="p-2 text-gray-400 hover:text-nexus-500 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSearch}
                className="bg-nexus-600 hover:bg-nexus-700 text-white px-8 font-semibold transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 flex-wrap">
              <span className="text-gray-500 text-xs font-medium">Popular:</span>
              {['2 BHK in Mumbai', '3 BHK in Bangalore', 'Villa in Gurgaon', 'Plot in Noida', 'PG in Delhi'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="text-xs bg-white hover:bg-nexus-50 border border-gray-200 hover:border-nexus-300 text-gray-600 hover:text-nexus-600 px-3 py-1 rounded-full transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
        {[
          { value: '2.5L+', label: 'Properties' },
          { value: '50+', label: 'Cities' },
          { value: '1.2L+', label: 'Happy Buyers' },
        ].map((stat) => (
          <div key={stat.label} className="glass-dark rounded-2xl px-5 py-4 text-center">
            <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
            <div className="text-nexus-300 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
