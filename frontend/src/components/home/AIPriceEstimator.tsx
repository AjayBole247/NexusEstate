'use client'
import { useMemo, useState } from 'react'

const cities = [
  { label: 'Mumbai', factor: 28 },
  { label: 'Bangalore', factor: 9.5 },
  { label: 'Hyderabad', factor: 7.8 },
  { label: 'Pune', factor: 8.2 },
  { label: 'Gurgaon', factor: 14.5 },
  { label: 'Delhi', factor: 18.0 },
]

export default function AIPriceEstimator() {
  const [city, setCity] = useState(cities[0].label)
  const [area, setArea] = useState('1200')

  const estimate = useMemo(() => {
    const found = cities.find((item) => item.label === city)
    const numericArea = Number(area) || 0
    const value = found ? numericArea * found.factor : 0
    return `₹${value.toLocaleString('en-IN')}`
  }, [city, area])

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-gray-700">
          City
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-nexus-500"
          >
            {cities.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-gray-700">
          Area (sqft)
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-nexus-500"
            placeholder="1200"
          />
        </label>
      </div>

      <div className="mt-6 rounded-3xl bg-nexus-950 px-5 py-6 text-white">
        <p className="text-sm uppercase tracking-[0.28em] text-nexus-300">Estimated price</p>
        <p className="mt-3 text-3xl font-bold tracking-tight">{estimate}</p>
        <p className="mt-2 text-sm text-nexus-300">Based on market averages and city demand.</p>
      </div>
    </div>
  )
}
