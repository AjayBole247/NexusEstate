'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath, Maximize2, TrendingUp, ShieldCheck } from 'lucide-react'
import type { Property } from '@/lib/data'
import { formatPrice, formatArea } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import ContactModal from '@/components/properties/ContactModal'

interface PropertyCardProps {
  property: Property
  isRent?: boolean
}

const tagColors: Record<string, string> = {
  'NEW LAUNCH': 'bg-nexus-600 text-white',
  'NEW ARRIVAL': 'bg-emerald-500 text-white',
  'FEATURED': 'bg-purple-600 text-white',
  'HOT': 'bg-red-500 text-white',
}

export default function PropertyCard({ property, isRent }: PropertyCardProps) {
  const { wishlist, toggleWishlist } = useAppStore()
  const isWishlisted = wishlist.includes(property.id)
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="property-card group">
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.images?.[0] ?? property.image ?? 'https://via.placeholder.com/1200x800?text=Property'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {property.tag && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg ${tagColors[property.tag]}`}>
            {property.tag}
          </span>
        )}

        {property.isRera && (
          <span className="absolute top-3 right-12 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="w-2.5 h-2.5" />RERA
          </span>
        )}

        <button
          onClick={() => toggleWishlist(property.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
        </button>

        {property.priceChange && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold">{property.priceChange}% in 1yr</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-2xl font-display font-bold text-gray-900">
              {formatPrice(property.price)}
              {isRent && <span className="text-sm font-body font-normal text-gray-500">/mo</span>}
            </p>
          </div>
          {property.status && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              property.status === 'ready-to-move' ? 'bg-green-50 text-green-700' :
              property.status === 'under-construction' ? 'bg-amber-50 text-amber-700' :
              'bg-nexus-50 text-nexus-700'
            }`}>
              {property.status === 'ready-to-move' ? 'Ready' :
               property.status === 'under-construction' ? `UC · ${property.possession}` :
               'New Launch'}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-gray-800 mb-1 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 text-nexus-400 shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <BedDouble className="w-4 h-4 text-nexus-400" />
            <span>{property.bedrooms} BHK</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <Bath className="w-4 h-4 text-nexus-400" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <Maximize2 className="w-4 h-4 text-nexus-400" />
            <span>{formatArea(property.area)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 text-center py-2.5 bg-nexus-50 hover:bg-nexus-100 text-nexus-700 font-medium text-sm rounded-xl transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={() => setShowContact(true)}
            className="flex-1 py-2.5 bg-nexus-600 hover:bg-nexus-700 text-white font-medium text-sm rounded-xl transition-colors"
          >
            Contact
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <ContactModal
          property={property}
          onClose={() => setShowContact(false)}
        />
      )}
    </div>
  )
}