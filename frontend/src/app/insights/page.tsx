"use client";

import {
  BarChart3,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { MARKET_STATS, PRICE_TREND_DATA } from "@/lib/data";

const newsArticles = [
  {
    id: 1,
    title: "Indian real estate market sees record Rs 2.1 lakh crore transactions in Q1 2026",
    source: "Economic Times",
    date: "Apr 13, 2026",
    category: "Market News",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
  },
  {
    id: 2,
    title: "Hyderabad overtakes Bengaluru in new home launches for the first time since 2020",
    source: "Business Standard",
    date: "Apr 11, 2026",
    category: "City Report",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
  },
  {
    id: 3,
    title: "RBI keeps repo rate unchanged; home loan EMIs remain stable",
    source: "Mint",
    date: "Apr 09, 2026",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  },
  {
    id: 4,
    title: "Mumbai luxury segment leads with 15 percent year-over-year price appreciation",
    source: "Times of India",
    date: "Apr 07, 2026",
    category: "Luxury Segment",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
  },
];

const categoryColors: Record<string, string> = {
  "Market News": "bg-nexus-100 text-nexus-700",
  "City Report": "bg-emerald-100 text-emerald-700",
  Finance: "bg-amber-100 text-amber-700",
  "Luxury Segment": "bg-purple-100 text-purple-700",
};

export default function InsightsPage() {
  const maxTrendValue = Math.max(
    ...PRICE_TREND_DATA.flatMap((point) => [
      point.Mumbai,
      point.Bangalore,
      point.Delhi,
      point.Hyderabad,
    ])
  );
  const maxListings = Math.max(...MARKET_STATS.map((stat) => stat.listings));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="nexus-gradient py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-nexus-300" />
            <div>
              <h1 className="font-display text-4xl font-bold text-white">Market Insights</h1>
              <p className="mt-1 text-nexus-200">AI-powered real estate analytics and news across India</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Mumbai Avg. Price", value: "Rs 25,000/sqft", change: "+8.5%", up: true },
              { label: "Bangalore Growth", value: "12.3% YoY", change: "Best performer", up: true },
              { label: "Delhi NCR Demand", value: "+18% QoQ", change: "High demand", up: true },
              { label: "Hyderabad Launches", value: "4,200 units", change: "Q1 2026", up: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="mb-2 text-xs text-nexus-300">{stat.label}</p>
                <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                <p className={`mt-1 flex items-center gap-1 text-xs ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-gray-900">Price Trends by City</h2>
                <p className="text-sm text-gray-500">Average price per sqft over the last 6 months</p>
              </div>

              <div className="space-y-5">
                {[
                  { key: "Mumbai", color: "bg-nexus-600" },
                  { key: "Bangalore", color: "bg-emerald-500" },
                  { key: "Delhi", color: "bg-amber-500" },
                  { key: "Hyderabad", color: "bg-violet-500" },
                ].map((series) => (
                  <div key={series.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{series.key}</span>
                      <span className="text-gray-500">
                        {PRICE_TREND_DATA[0][series.key as keyof (typeof PRICE_TREND_DATA)[number]].toLocaleString()} to {" "}
                        {PRICE_TREND_DATA[PRICE_TREND_DATA.length - 1][series.key as keyof (typeof PRICE_TREND_DATA)[number]].toLocaleString()} Rs/sqft
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {PRICE_TREND_DATA.map((point) => {
                        const value = point[series.key as keyof typeof point] as number;
                        const height = Math.max(18, Math.round((value / maxTrendValue) * 120));

                        return (
                          <div key={`${series.key}-${point.month}`} className="flex flex-col items-center gap-2">
                            <div className="flex h-32 items-end">
                              <div
                                className={`${series.color} w-8 rounded-t-lg`}
                                style={{ height }}
                                title={`${point.month}: ${value.toLocaleString()} Rs/sqft`}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{point.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-display text-xl font-bold text-gray-900">City-wise Active Listings</h2>
              <p className="mb-6 text-sm text-gray-500">Total property listings across major cities</p>
              <div className="space-y-4">
                {MARKET_STATS.map((stat) => (
                  <div key={stat.city}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{stat.city}</span>
                      <span className="text-gray-500">{stat.listings.toLocaleString()} listings</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-nexus-600"
                        style={{ width: `${(stat.listings / maxListings) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-gray-900">Latest Real Estate News</h2>
                <span className="text-sm font-medium text-nexus-500">Live feed</span>
              </div>

              <div className="space-y-4">
                {newsArticles.map((article) => (
                  <div
                    key={article.id}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[article.category]}`}>
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-400">{article.date}</span>
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-nexus-600">
                          {article.title}
                        </h3>
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                          <Newspaper className="h-3 w-3" />
                          {article.source}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-display font-bold text-gray-900">City Price Summary</h3>
              <div className="space-y-3">
                {MARKET_STATS.map((stat) => (
                  <div key={stat.city} className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-nexus-400" />
                      <span className="text-sm font-medium text-gray-800">{stat.city}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">Rs {stat.avgPrice.toLocaleString()}/sqft</p>
                      <p className={`flex items-center justify-end gap-0.5 text-xs ${stat.change > 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {stat.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {stat.change}% YoY
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-linear-to-br from-nexus-600 to-nexus-800 p-5 text-white">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-nexus-900">
                  AI
                </div>
                <span className="text-sm font-semibold">NexusAI Prediction</span>
              </div>
              <p className="mb-4 text-sm text-nexus-100">Based on historical data and market trends:</p>
              <div className="space-y-2">
                {[
                  { city: "Hyderabad", prediction: "+14-18% in 12 months" },
                  { city: "Bangalore", prediction: "+10-13% in 12 months" },
                  { city: "Pune", prediction: "+8-11% in 12 months" },
                ].map((prediction) => (
                  <div key={prediction.city} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                    <span className="text-sm">{prediction.city}</span>
                    <span className="text-xs font-bold text-emerald-300">{prediction.prediction}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-nexus-300">AI predictions are directional estimates, not financial advice.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-display font-bold text-gray-900">Market Sentiment</h3>
              {[
                { label: "Buyer Demand", value: 78, color: "bg-nexus-500" },
                { label: "New Supply", value: 62, color: "bg-emerald-500" },
                { label: "Price Growth", value: 85, color: "bg-amber-500" },
                { label: "Investor Interest", value: 91, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
