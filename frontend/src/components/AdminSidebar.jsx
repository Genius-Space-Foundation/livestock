'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import {
  LayoutDashboard,
  Beef,
  FileText,
  CreditCard,
  Megaphone,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Shield,
  Banknote
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/plans', icon: Beef, label: 'Manage Plans' },
  { href: '/admin/applications', icon: FileText, label: 'Applications' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/withdrawals', icon: Banknote, label: 'Withdrawals' },
  { href: '/admin/updates', icon: Megaphone, label: 'Farm Updates' },
  { href: '/admin/activity', icon: Activity, label: 'Activity Log' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.logo}>
          <Sprout size={26} />
          {!collapsed && <span>Admin<strong>Panel</strong></span>}
        </Link>
        <button className={styles.toggleBtn} onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <Shield size={16} />
          </div>
          {!collapsed && (
            <div className={styles.userMeta}>
              <span className={styles.userName}>{currentUser?.name || 'Admin'}</span>
              <span className={styles.userRole}>Administrator</span>
            </div>
          )}
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
