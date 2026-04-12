'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import useStore from '@/store/useStore';
import { ArrowRight, ArrowLeft, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import styles from './apply.module.css';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, wallet, fetchWallet, getPlanById, submitApplication, addToast } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const plan = getPlanById(params.planId);
  const hasSufficientBalance = wallet && plan ? wallet.balance >= plan.price : false;

  useEffect(() => {
    if (!currentUser) {
      router.push(`/login?redirect=/apply/${params.planId}`);
      return;
    }
    fetchWallet();
    setForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
    });
  }, [currentUser, router, fetchWallet, params.planId]);

  if (!plan) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3 className="empty-state-title">Plan Not Found</h3>
              <Link href="/plans" className="btn btn-primary">Browse Plans</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!hasSufficientBalance) {
      addToast('Insufficient wallet balance. Please deposit funds first.', 'error');
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    try {
      // Wallet-based investment: call submitApplication without a reference
      await submitApplication(currentUser.id, plan.id);
      router.push('/dashboard?applied=true');
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          {/* Progress bar */}
          <div className={styles.progress}>
            {['Personal Info', 'Confirm Plan', 'Review'].map((label, i) => (
              <div
                key={i}
                className={`${styles.progressStep} ${i + 1 <= step ? styles.progressActive : ''}`}
              >
                <div className={styles.progressDot}>{i + 1 <= step ? <CheckCircle size={16} /> : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.formCard}>
            {/* Step 1... (unchanged) */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h2>Personal Information</h2>
                <p className={styles.stepDesc}>Confirm your details for this application</p>
                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
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
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <Link href="/plans" className="btn btn-ghost">
                    <ArrowLeft size={16} /> Back to Plans
                  </Link>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2... (unchanged) */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h2>Confirm Investment Plan</h2>
                <p className={styles.stepDesc}>Review the plan you're applying for</p>
                <div className={styles.planSummary}>
                  <img src={plan.image || '/images/default.jpg'} alt={plan.title} className={styles.planImage} />
                  <h3>{plan.title}</h3>
                  <p>{plan.description}</p>
                  <div className={styles.planSummaryMeta}>
                    <div><Clock size={14} /> {plan.duration}</div>
                    <div><TrendingUp size={14} /> {plan.roiPercentage ? `${plan.roiPercentage}%` : plan.roi} ROI</div>
                  </div>
                  <div className={styles.planSummaryPrice}>
                    <span>Initial Capital</span>
                    <strong>GHS {plan.price}</strong>
                  </div>
                  <div className={styles.planSummaryReturn}>
                    <span>Expected Return</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>GHS {plan.price + (plan.price * (plan.roiPercentage || 20) / 100)}</strong>
                  </div>
                </div>
                <div className={styles.stepActions}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <h2>Portfolio Review & Submit</h2>
                <p className={styles.stepDesc}>Review your portfolio details before investment</p>
                
                {!hasSufficientBalance && (
                  <div className={styles.balanceWarning} style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid var(--status-error)',
                    marginBottom: '1.5rem',
                    color: 'var(--status-error)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} style={{ transform: 'rotate(180deg)' }} /> Insufficient Wallet Balance
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Your current balance is <strong>GHS {wallet?.balance?.toFixed(2) || '0.00'}</strong>. 
                      You need <strong>GHS {plan.price.toFixed(2)}</strong> to proceed.
                    </p>
                    <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                      Go to Dashboard to Deposit
                    </Link>
                  </div>
                )}

                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <span>Name</span>
                    <strong>{form.name}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Email</span>
                    <strong>{form.email}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Phone</span>
                    <strong>{form.phone}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Plan</span>
                    <strong>{plan.title}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Duration</span>
                    <strong>{plan.duration}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Initial Capital</span>
                    <strong className={styles.reviewPrice}>GHS {plan.price}</strong>
                  </div>
                  <div className={styles.reviewItem}>
                    <span>Expected Return</span>
                    <strong className={styles.reviewReturn}>GHS {plan.price + (plan.price * (plan.roiPercentage || 20) / 100)}</strong>
                  </div>
                </div>

                <div className={styles.walletStatus} style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ color: 'var(--accent-primary)' }}><TrendingUp size={20} /></div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wallet Balance</div>
                      <div style={{ fontWeight: '700' }}>GHS {wallet?.balance?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                  {hasSufficientBalance && (
                    <div style={{ color: 'var(--status-success)', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} /> Ready to Invest
                    </div>
                  )}
                </div>

                <div className={styles.stepActions} style={{ marginTop: '2rem' }}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handleSubmit} 
                    disabled={loading || !hasSufficientBalance}
                  >
                    {loading ? 'Processing...' : 'Confirm & Invest from Wallet'} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Paystack Inline Script */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
    </>
  );
}
