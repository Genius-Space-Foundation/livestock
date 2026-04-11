'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useStore from '@/store/useStore';
import AdminSidebar from './AdminSidebar';
import { Menu, X, Bell, Search } from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, isAdmin } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser || !isAdmin) {
      router.push('/admin/login');
    }
  }, [currentUser, isAdmin, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!currentUser || !isAdmin) {
    return null;
  }

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className={`${styles.sidebarWrap} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <main
        className={styles.main}
        style={{
          marginLeft: sidebarCollapsed ? '72px' : 'var(--sidebar-width)',
        }}
      >
        {/* Top bar */}
        <header className={styles.topbar}>
          <button
            className={styles.mobileBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={styles.searchBox}>
            <Search size={16} />
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>

          <div className={styles.topActions}>
            <button className={styles.notifBtn} aria-label="Notifications">
              <Bell size={18} />
              <span className={styles.notifDot} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
