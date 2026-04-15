'use client'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-nexus-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Logo variant="light" size="md" />
            <p className="mt-4 text-nexus-200 text-sm leading-relaxed max-w-xs">
              India's next-generation PropTech platform. AI-powered market analytics,
              multi-city lease swapping, and intelligent property matching.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-nexus-800 hover:bg-nexus-600 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-nexus-300 text-sm">
                <MapPin className="w-4 h-4 text-nexus-400" />
                <span>Sector 17, Chandigarh, India 160017</span>
              </div>
              <div className="flex items-center gap-2 text-nexus-300 text-sm">
                <Phone className="w-4 h-4 text-nexus-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-nexus-300 text-sm">
                <Mail className="w-4 h-4 text-nexus-400" />
                <span>hello@nexusestate.in</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {['Buy Property', 'Rent Property', 'Sell Property', 'New Launches', 'City Swap', 'Market Insights'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-nexus-300 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-5">Top Cities</h4>
            <ul className="space-y-3">
              {['Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida'].map((city) => (
                <li key={city}>
                  <a href="#" className="text-nexus-300 hover:text-white text-sm transition-colors">{city}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-5">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Contact Us', 'Careers', 'Press', 'Blog', 'Privacy Policy', 'Terms of Service', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-nexus-300 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-nexus-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-nexus-400 text-sm">
            © 2026 NexusEstate. All rights reserved. A PropTech Innovation.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-nexus-500 text-xs font-mono">RERA Registered</span>
            <span className="w-px h-4 bg-nexus-700" />
            <span className="text-nexus-500 text-xs font-mono">ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
