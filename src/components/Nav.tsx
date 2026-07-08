'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/quiz', label: 'Quiz' },
    { href: '/quiz/fellow', label: 'Fellow Quiz' },
    { href: '/fellows', label: 'Fellows' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[200] bg-[rgba(10,10,15,0.6)] backdrop-blur-2xl border-b border-white/[0.06] px-[4vw] flex items-center justify-between h-14">
      <Link href="/" className="font-heading font-extrabold text-lg tracking-tight hover:brightness-130 transition-[filter] duration-300">
        <span className="text-neon-cyan">pdku</span>
        <span className="text-neon-pink">:</span>
        <span className="text-neon-purple">personas</span>
      </Link>

      <div className="desktop-only flex gap-8 text-xs font-medium">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`uppercase tracking-widest transition-colors duration-200 ${
              pathname === link.href
                ? 'text-neon-cyan'
                : 'text-white/40 hover:text-neon-cyan'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        className="mobile-only text-white/60 text-xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="mobile-only absolute top-14 left-0 right-0 bg-[rgba(10,10,15,0.95)] backdrop-blur-2xl border-b border-white/[0.06] p-6 flex flex-col gap-4">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm uppercase tracking-widest ${
                pathname === link.href ? 'text-neon-cyan' : 'text-white/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
