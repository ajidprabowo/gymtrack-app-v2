'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useLanguage } from './LanguageProvider';

export default function Navbar({ name }: { name: string }) {
  const path = usePathname();
  const { theme, toggle } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const NAV = [
    { href: '/dashboard', icon: '⚡', label: t('navbar.dashboard') },
    { href: '/workout',   icon: '🏋️', label: t('navbar.workout') },
    { href: '/nutrition', icon: '🍽️', label: t('navbar.nutrition') },
    { href: '/history',   icon: '📈', label: t('navbar.history') },
    { href: '/profile',   icon: '👤', label: t('navbar.profile') },
  ];

  const handleLanguageToggle = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

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
            <button className="theme-toggle" onClick={handleLanguageToggle} title="Change language" style={{fontSize: '14px', fontWeight: 'bold'}}>
              {language.toUpperCase()}
            </button>
            <button className="theme-toggle" onClick={toggle} title={t('theme.toggle')}>
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
