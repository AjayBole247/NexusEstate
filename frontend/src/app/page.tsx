import HeroSection from '../components/home/HeroSection'
import ExploreCards from '../components/home/ExploreCards'
import NewlyLaunched from '../components/home/NewlyLaunched'
import StatsSection from '../components/home/StatsSection'
import ArticlesSection from '../components/home/ArticlesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import AIPriceEstimator from '../components/home/AIPriceEstimator'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ExploreCards />
      <NewlyLaunched />

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
              <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-3">🤖 AI-Powered</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">Instant Property<br />Price Estimate</h2>
              <AIPriceEstimator />
            </div>
            <div className="lg:col-span-2">
              <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-3">📊 Live Market</p>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">City Price Snapshot</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { city: 'Mumbai', price: '₹28,000', change: '+8.5%' },
                  { city: 'Bangalore', price: '₹9,500', change: '+12.3%' },
                  { city: 'Hyderabad', price: '₹7,800', change: '+15.2%' },
                  { city: 'Pune', price: '₹8,200', change: '+9.4%' },
                  { city: 'Gurgaon', price: '₹14,500', change: '+7.8%' },
                  { city: 'Delhi', price: '₹18,000', change: '+6.1%' },
                ].map(stat => (
                  <div key={stat.city} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="text-gray-500 text-xs mb-1">{stat.city}</p>
                    <p className="font-display font-bold text-gray-900 text-lg">{stat.price}</p>
                    <p className="text-xs text-gray-400 mb-2">per sqft</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{stat.change} YoY</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
      <ArticlesSection />
      <TestimonialsSection />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-linear-to-br from-nexus-50 to-nexus-100 rounded-3xl p-12 border border-nexus-200">
            <p className="text-nexus-600 text-sm font-semibold tracking-widest uppercase mb-3">Ready to Start?</p>
            <h2 className="font-display text-4xl font-bold text-nexus-950 mb-4">Your Dream Property<br />is One Click Away</h2>
            <p className="text-nexus-600 mb-8 max-w-md mx-auto">
              Join over 1 lakh daily users who trust NexusEstate to find, buy, rent, and swap properties across India.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="/properties" className="nexus-btn-primary">Browse Properties</a>
              <a href="/swap" className="nexus-btn-outline">Try City Swap</a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
