'use client'
import Link from 'next/link'

interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, textClass: 'text-lg' },
    md: { icon: 36, textClass: 'text-xl' },
    lg: { icon: 48, textClass: 'text-2xl' },
  }

  const { icon, textClass } = sizes[size]
  const isDark = variant === 'dark'

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* Icon */}
      <div className="relative" style={{ width: icon, height: icon }}>
        <svg width={icon} height={icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagon base */}
          <path
            d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
            fill="url(#nexus-gradient)"
          />
          {/* Building/N symbol */}
          <path
            d="M12 28V13L20 20L28 13V28"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Star accent */}
          <circle cx="20" cy="20" r="2" fill="#fbbf24" />
          <defs>
            <linearGradient id="nexus-gradient" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3837d0" />
              <stop offset="100%" stopColor="#5b6cf3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold ${textClass} ${isDark ? 'text-nexus-950' : 'text-white'} tracking-tight`}>
          Nexus<span className="text-nexus-500">Estate</span>
        </span>
        <span className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-nexus-400' : 'text-nexus-200'}`}>
          PropTech Platform
        </span>
      </div>
    </Link>
  )
}
