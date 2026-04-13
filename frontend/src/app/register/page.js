'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import { Shield, UserPlus, Mail, Phone, Lock, ExternalLink, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import styles from '../login/auth.module.css';

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, addToast } = useStore();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(form.name, form.email, form.phone, form.password);
    if (result.success) {
      addToast('Account created successfully! Welcome aboard.', 'success');
      router.push('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please check your details.');
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* Left Pane: Visual Branding */}
      <section className={styles.visualPane}>
        <img 
          src="/admin_login_bg_1776038406115.png" 
          alt="Registration Branding" 
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
        
        <div className={styles.visualContent}>
          <div className={styles.logo}>
            <Shield size={32} className="text-success" />
            <span>LIVESTOCK PLATFORM</span>
          </div>
          <h1 className={styles.tagline} style={{ color: 'var(--accent-primary)' }}>
            Start Your Journey in Sustainable Agriculture.
          </h1>
          <p className={styles.description}>
            Create your account to browse investment plans, manage your digital portfolio,
            and contribute to a more resilient food ecosystem.
          </p>
        </div>
      </section>

      {/* Right Pane: Registration Form */}
      <section className={styles.formPane}>
        <div className={styles.formWrap}>
          <header className={styles.header}>
            <div className={styles.badge}>
              <UserPlus size={12} />
              Join the Ecosystem
            </div>
            <h2 className={styles.title}>Create account</h2>
            <p className={styles.subtitle}>Fill in your details to get started.</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <Shield size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Full Name</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}><UserPlus size={18} /></div>
                <input
                  type="text"
                  name="name"
                  className={styles.inputField}
                  placeholder="Kwame Asante"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  name="email"
                  className={styles.inputField}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={18} />
                <input
                  type="tel"
                  name="phone"
                  className={styles.inputField}
                  placeholder="+233 XX XXX XXXX"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Security Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  name="password"
                  className={styles.inputField}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ExternalLink size={18} />
                </>
              )}
            </button>
          </form>

          <footer className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account? <Link href="/login" className={styles.footerAction}>Sign in here</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <p>Loading...</p>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </>
  );
}
