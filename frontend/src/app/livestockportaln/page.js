'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, Loader2, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import styles from './portal.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, addToast } = useStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await adminLogin(email, password);
    if (result.success) {
      addToast('Authenticated successfully. Welcome back.', 'success');
      router.push('/admin');
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* Left Pane: Visual Branding */}
      <section className={styles.visualPane}>
        <img 
          src="/admin_login_bg_1776038406115.png" 
          alt="Agriculture Branding" 
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
        
        <div className={styles.visualContent}>
          <div className={styles.logo}>
            <div className="flex items-center gap-sm">
              <div className="bg-success p-xs rounded-sm">
                <Shield size={24} className="text-white" />
              </div>
              <span>LIVESTOCK PLATFORM</span>
            </div>
          </div>
          
          <h1 className={styles.tagline} style={{ color: 'var(--accent-primary)' }}>
            Empowering the Future of Sustainable Agriculture.
          </h1>
          <p className={styles.description}>
            Access the centralized management console to monitor investments, 
            verify transactions, and grow the agricultural ecosystem.
          </p>
        </div>
      </section>

      {/* Right Pane: Authentication */}
      <section className={styles.formPane}>
        <div className={styles.formWrap}>
          <header className={styles.header}>
            <div className={styles.badge}>
              <Shield size={12} />
              Secure Administrator Access
            </div>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Please enter your credentials to access the portal.</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <Shield size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Work Email</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  className={styles.inputField}
                  placeholder="admin@livestock.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Security Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={styles.inputField}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.pwToggle}
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} size={18} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ExternalLink size={18} />
                </>
              )}
            </button>
          </form>

          <footer className={styles.footer}>
            <Link href="/login" className={styles.backLink}>
              <ArrowLeft size={14} /> 
              <span>Back to standard login</span>
            </Link>
          </footer>
        </div>
      </section>
    </main>
  );
}
