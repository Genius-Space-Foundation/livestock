'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import useStore from '@/store/useStore';
import { ArrowRight, ArrowLeft, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import styles from './apply.module.css';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, getPlanById, submitApplication, addToast } = useStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const plan = getPlanById(params.planId);

  useEffect(() => {
    if (!currentUser) {
      router.push(`/login?redirect=/apply/${params.planId}`);
      return;
    }
    setForm({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
    });
  }, [currentUser, router]);

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
    try {
      const appId = await submitApplication(currentUser.id, plan.id, form);
      addToast('Application submitted! Proceed to payment.', 'success');
      router.push(`/payment/${appId}`);
    } catch (e) {
      // Error is handled in store (toast)
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
            {/* Step 1 */}
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

            {/* Step 2 */}
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
                <p className={styles.stepDesc}>Review your portfolio details before payment</p>
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
                <div className={styles.stepActions}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                    Submit Application <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
