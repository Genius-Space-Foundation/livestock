'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { User, Mail, Phone, Shield, LogOut } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, logout } = useStore();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Your Profile</h1>
            <p className={styles.subtitle}>Manage your account details and settings.</p>
          </header>

          <div className={styles.profileCard}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>
                <User size={40} />
              </div>
              <div className={styles.userName}>{currentUser.name}</div>
              <div className={styles.roleBadge}>{currentUser.role || 'User'}</div>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <Mail size={16} /> Email Address
                </span>
                <span className={styles.detailValue}>{currentUser.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <Phone size={16} /> Phone Number
                </span>
                <span className={styles.detailValue}>{currentUser.phone || 'Not provided'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>
                  <Shield size={16} /> Account Status
                </span>
                <span className={styles.detailValue} style={{ color: 'var(--status-success)' }}>Active</span>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={`btn ${styles.logoutBtn}`} onClick={handleLogout}>
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
