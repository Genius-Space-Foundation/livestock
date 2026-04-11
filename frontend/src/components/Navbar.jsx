'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useStore from '@/store/useStore';
import { Menu, X, Sprout, User, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentUser, isAdmin, logout } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/plans', label: 'Plans' },
  ];

  if (mounted && currentUser && !isAdmin) {
    links.push({ href: '/dashboard', label: 'Dashboard' });
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Sprout size={28} />
          <span>LiveStock<strong>Invest</strong></span>
        </Link>

        <div className={`${styles.navLinks} ${mobileOpen ? styles.open : ''}`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile-only actions (to show inside the drawer) */}
          <div className={styles.mobileActions}>
            {!mounted ? null : !currentUser ? (
              <>
                <Link href="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </>
            ) : (
              <button onClick={logout} className="btn btn-ghost" style={{ width: '100%' }}>
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </div>

        <div className={styles.navActions}>
          {!mounted ? (
            <div style={{ width: '80px' }} />
          ) : currentUser ? (
            <div className={styles.userMenu}>
              <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <User size={16} />
                </div>
                <span className={styles.userName}>
                  {currentUser.name ? currentUser.name.split(' ')[0] : (isAdmin ? 'Admin' : 'User')}
                </span>
              </Link>
              <button 
                onClick={logout} 
                className={`btn btn-ghost btn-sm ${styles.logoutBtn}`}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm hide-mobile">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm hide-mobile">
                Get Started
              </Link>
            </>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
