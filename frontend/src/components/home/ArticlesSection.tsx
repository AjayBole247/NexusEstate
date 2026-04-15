'use client'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

const tabs = ['News', 'Tax & Legal', 'Help Guides', 'Investment']

const articles = {
  News: [
    {
      id: 1,
      title: 'Noida Sports City projects update: Registry opens for select units',
      date: 'Apr 08, 2026',
      image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
      category: 'News',
    },
    {
      id: 2,
      title: 'Mumbai realty sees 12% price surge in Q1 2026',
      date: 'Apr 05, 2026',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',
      category: 'News',
    },
    {
      id: 3,
      title: 'Hyderabad emerges as top investment destination for 2026',
      date: 'Mar 28, 2026',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
      category: 'News',
    },
    {
      id: 4,
      title: 'RERA compliance rises to 94% across major Indian cities',
      date: 'Mar 20, 2026',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80',
      category: 'News',
    },
  ],
  'Tax & Legal': [
    {
      id: 5,
      title: 'New GST rules on housing under-construction explained',
      date: 'Apr 10, 2026',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
      category: 'Tax & Legal',
    },
    {
      id: 6,
      title: 'How to save tax on home loan: Section 24 & 80C guide',
      date: 'Apr 02, 2026',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80',
      category: 'Tax & Legal',
    },
    {
      id: 7,
      title: 'Stamp duty reduction in Maharashtra: What buyers must know',
      date: 'Mar 15, 2026',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
      category: 'Tax & Legal',
    },
    {
      id: 8,
      title: 'Capital gains exemption on property sale: New 2026 rules',
      date: 'Mar 10, 2026',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80',
      category: 'Tax & Legal',
    },
  ],
  'Help Guides': [
    {
      id: 9,
      title: "First-time homebuyer's complete checklist for 2026",
      date: 'Apr 12, 2026',
      image: 'https://images.unsplash.com/photo-1560440021-33f9b867899d?w=400&q=80',
      category: 'Help Guides',
    },
    {
      id: 10,
      title: 'How to verify a property legally before buying',
      date: 'Apr 01, 2026',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80',
      category: 'Help Guides',
    },
    {
      id: 11,
      title: 'Home loan eligibility: How to maximize your approval chances',
      date: 'Mar 22, 2026',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
      category: 'Help Guides',
    },
    {
      id: 12,
      title: 'NRI guide to buying property in India 2026',
      date: 'Mar 05, 2026',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80',
      category: 'Help Guides',
    },
  ],
  Investment: [
    {
      id: 13,
      title: 'Top 5 cities for real estate investment in 2026',
      date: 'Apr 11, 2026',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
      category: 'Investment',
    },
    {
      id: 14,
      title: 'REITs vs direct property investment: A 2026 comparison',
      date: 'Apr 04, 2026',
      image: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=400&q=80',
      category: 'Investment',
    },
    {
      id: 15,
      title: 'Fractional ownership: The new way millennials invest in realty',
      date: 'Mar 28, 2026',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&q=80',
      category: 'Investment',
    },
    {
      id: 16,
      title: 'Rental yield analysis: Which cities offer best returns?',
      date: 'Mar 18, 2026',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
      category: 'Investment',
    },
  ],
}

interface ArticlesSectionProps {
  title?: string
  subtitle?: string
  mode?: 'buy' | 'rent'
}

export default function ArticlesSection({ title = 'Top Articles on Home Buying', subtitle = 'Read from Beginners checklist to Pro Tips', mode = 'buy' }: ArticlesSectionProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-24">
              {mode === 'rent' && (
                <div className="mb-6 rounded-2xl overflow-hidden h-48">
                  <img
                    src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&q=80"
                    alt="Renting"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 text-sm mb-6">{subtitle}</p>
              <Link href="/insights" className="flex items-center gap-2 text-nexus-600 font-semibold text-sm hover:text-nexus-700 transition-colors group">
                Read all realty news, guides & articles
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <ArticlesTabs />
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticlesTabs() {
  return (
    <div>
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              i === 0 ? 'border-nexus-600 text-nexus-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.News.map((article) => (
          <Link key={article.id} href="/insights" className="group flex gap-4 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all">
            <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm font-medium line-clamp-2 group-hover:text-nexus-600 transition-colors leading-snug mb-2">
                {article.title}
              </p>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Calendar className="w-3 h-3" />
                {article.date}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export { ArticlesSection };
