'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { useAppStore } from '@/store/useAppStore'
import {
  Search, MapPin, ChevronDown, Menu, X, User, Heart,
  LogOut, Bell, TrendingUp, ArrowLeftRight, BarChart3
} from 'lucide-react'

const navLinks = [
  {
    label: 'Buy',
    href: '/properties',
    dropdown: [
      { label: 'Apartments', href: '/properties?type=apartment' },
      { label: 'Villas', href: '/properties?type=villa' },
      { label: 'Builder Floors', href: '/properties?type=builder-floor' },
      { label: 'Plots & Land', href: '/properties?type=plot' },
      { label: 'New Launches', href: '/properties?status=new-launch' },
    ],
  },
  {
    label: 'Rent',
    href: '/rent',
    dropdown: [
      { label: 'Residential', href: '/rent?type=residential' },
      { label: 'Commercial', href: '/rent?type=commercial' },
      { label: 'PG/Co-living', href: '/rent?type=pg' },
    ],
  },
  { label: 'City Swap', href: '/swap', icon: ArrowLeftRight, highlight: true },
  {
    label: 'Market Insights',
    href: '/insights',
    icon: BarChart3,
  },
  { label: 'Sell Property', href: '/sell' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg border-b border-gray-100' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Logo variant="dark" size="md" />

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      link.highlight
                        ? 'bg-nexus-50 text-nexus-600 hover:bg-nexus-100'
                        : 'text-gray-700 hover:text-nexus-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.icon && <link.icon className="w-3.5 h-3.5" />}
                    {link.label}
                    {link.dropdown && <ChevronDown className="w-3 h-3" />}
                    {link.highlight && (
                      <span className="ml-1 bg-nexus-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                        New
                      </span>
                    )}
                  </Link>

                  {link.dropdown && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:text-nexus-600 hover:bg-nexus-50 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-nexus-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50">
                <MapPin className="w-4 h-4 text-nexus-500" />
                <span>All India</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-nexus-600 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-nexus-600 transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-nexus-50 hover:bg-nexus-100 px-3 py-1.5 rounded-xl transition-colors">
                      <div className="w-6 h-6 rounded-full bg-nexus-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium text-nexus-700">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3 text-nexus-500" />
                    </button>
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-nexus-600 hover:bg-nexus-50">
                        <User className="w-4 h-4" />Profile
                      </Link>
                      <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                        <LogOut className="w-4 h-4" />Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-nexus-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link href="/auth?mode=register" className="nexus-btn-primary text-sm py-2 px-4">
                    Post Property Free
                  </Link>
                </div>
              )}
            </div>

            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'bg-nexus-50 text-nexus-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/auth" className="text-center py-3 border border-nexus-500 text-nexus-600 rounded-xl text-sm font-medium">
                Login / Register
              </Link>
              <Link href="/sell" className="text-center py-3 bg-nexus-600 text-white rounded-xl text-sm font-medium">
                Post Property Free
              </Link>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  )
}
