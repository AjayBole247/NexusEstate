'use client'
import { useState } from 'react'
import { X, Phone, Mail, MessageCircle, MapPin, ShieldCheck } from 'lucide-react'
import type { Property } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

interface ContactModalProps {
  property: Property
  onClose: () => void
}

// Mock agent data — replace with real data from your API/DB
const getAgent = (propertyId: string) => ({
  name: 'Rajesh Kumar',
  initials: 'RK',
  title: 'Senior Property Advisor',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'rajesh@nexusestate.in',
  office: 'Koramangala, Bangalore',
  experience: '8 yrs',
  responseTime: 'Within 1hr',
  verified: true,
})

export default function ContactModal({ property, onClose }: ContactModalProps) {
  const [message, setMessage] = useState(
    `Hi, I'm interested in ${property.title}. Please share more details.`
  )
  const [sent, setSent] = useState(false)
  const agent = getAgent(property.id)

  const handleSend = () => {
    // TODO: wire to your real API
    setSent(true)
    setTimeout(() => {
      setSent(false)
      onClose()
    }, 2000)
  }

  const handleCall = () => {
    window.location.href = `tel:${agent.phone}`
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(message)
    window.open(`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank')
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Contact agent for</p>
            <h2 className="font-display font-semibold text-gray-900 text-base leading-tight">
              {property.title}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
              <MapPin className="w-3 h-3 text-nexus-400" />
              <span>{property.location}</span>
              <span className="mx-1">·</span>
              <span className="font-medium text-gray-700">{formatPrice(property.price)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Agent Card */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-12 h-12 rounded-full bg-nexus-100 flex items-center justify-center text-nexus-700 font-semibold text-sm shrink-0">
              {agent.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
              <p className="text-xs text-gray-500">{agent.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {agent.verified && (
                  <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                <span className="text-[10px] text-gray-400">· {agent.experience} exp</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400">Response</p>
              <p className="text-xs font-medium text-gray-700">{agent.responseTime}</p>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Phone, label: 'Phone', value: agent.phone },
              { icon: Mail, label: 'Email', value: agent.email },
              { icon: MessageCircle, label: 'WhatsApp', value: agent.whatsapp },
              { icon: MapPin, label: 'Office', value: agent.office },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-nexus-400" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-xs font-medium text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Message Box */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Send a message</p>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-nexus-300 text-gray-700 bg-gray-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCall}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-green-200 rounded-xl text-green-700 text-sm font-medium hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
            <button
              onClick={handleSend}
              className="py-2.5 bg-nexus-600 hover:bg-nexus-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {sent ? '✓ Sent!' : 'Send'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}