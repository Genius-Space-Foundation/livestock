'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useStore from '@/store/useStore';
import { UserPlus } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const { register, addToast } = useStore();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(form.name, form.email, form.phone, form.password);
    if (result.success) {
      addToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <UserPlus size={24} />
            </div>
            <h1>Create Account</h1>
            <p>Start your livestock investment journey</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Kwame Asante"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+233 XX XXX XXXX"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Create Account
            </button>
          </form>

          <div className={styles.footer}>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>
        </div>
      </main>
    </>
  );
}
