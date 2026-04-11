'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

const NAV = [
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/workout',   icon: '🏋️', label: 'Workout' },
  { href: '/log',       icon: '📋', label: 'Log' },
  { href: '/nutrition', icon: '🍽️', label: 'Nutrisi' },
  { href: '/history',   icon: '📈', label: 'Riwayat' },
  { href: '/profile',   icon: '👤', label: 'Profil' },
];

export default function Navbar({ name }: { name: string }) {
  const path = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link href="/dashboard" className="logo" style={{ textDecoration: 'none' }}>
            💪 GymTrack<span className="logo-accent">Pro</span>
          </Link>
          <nav className="desktop-nav">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className={`nav-btn ${path.startsWith(n.href) ? 'active' : ''}`}>
                <span>{n.icon}</span><span>{n.label}</span>
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggle} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          </div>
        </div>
      </header>

      <nav className="mobile-nav">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} className={`mob-btn ${path.startsWith(n.href) ? 'active' : ''}`}>
            <span className="mob-icon">{n.icon}</span>
            <span className="mob-label">{n.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
