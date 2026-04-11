'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { Shield, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '../../login/auth.module.css';

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
      addToast('Welcome to the Command Center', 'success');
      router.push('/admin');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <main className={styles.page} style={{ background: 'var(--bg-primary)' }}>
      <div className={styles.card} style={{ borderTop: '4px solid var(--accent-gold)' }}>
        <div className={styles.header}>
          <div className={styles.iconWrap} style={{ background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)' }}>
            <Shield size={24} />
          </div>
          <h1>Admin Portal</h1>
          <p>Secure access for platform administrators</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@livestock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Key</label>
            <div className={styles.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-gold btn-lg" 
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.backBtn}>
            <ArrowLeft size={14} /> Back to User Login
          </Link>
        </div>
      </div>
    </main>
  );
}
