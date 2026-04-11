'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { 
  CreditCard, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Info,
  CheckCircle2
} from 'lucide-react';
import styles from './payment.module.css';

export default function PaymentPage() {
  const { appId } = useParams();
  const router = useRouter();
  const { applications, simulatePayment, fetchApplications, currentUser } = useStore();
  const [loading, setLoading] = useState(false);

  const application = applications.find(a => a.id === appId);

  useEffect(() => {
    if (!application && applications.length > 0) {
      // If we have apps but not this one, maybe it was just submitted. 
      // initializeData usually handles this, but let's be safe.
      fetchApplications();
    }
  }, [application, applications.length, fetchApplications]);

  if (!application) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <h3 className="empty-state-title">Loading Application...</h3>
              <p>Please wait while we retrieve your application details.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      await simulatePayment(application.id, currentUser.id, currentUser.name);
      // Redirect happens inside simulatePayment
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <Link href="/dashboard" className={styles.backBtn}>
                <ArrowLeft size={16} /> Back to Dashboard
              </Link>
              <h1>Complete Your Payment</h1>
              <p>Seal your investment by paying the application fee</p>
            </div>

            <div className={styles.content}>
              <div className={styles.summary}>
                <div className={styles.planHeader}>
                  <img 
                    src={application.plan?.image || '/images/default.jpg'} 
                    alt={application.plan?.type} 
                    className={styles.planImage} 
                  />
                  <div>
                    <h3>{application.plan?.type} Operation</h3>
                    <p>Selection: {application.plan?.duration} Cycle</p>
                  </div>
                </div>

                <div className={styles.breakdown}>
                  <div className={styles.row}>
                    <span>Application Processing Fee</span>
                    <span>GHS {application.plan?.price || '100.00'}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Administrative Charges</span>
                    <span>GHS 0.00</span>
                  </div>
                  <div className={`${styles.row} ${styles.total}`}>
                    <span>Total Amount</span>
                    <span>GHS {application.plan?.price || '100.00'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.paymentMethod}>
                <div className={styles.methodHeader}>
                  <CreditCard size={18} />
                  <span>Secure Payment via Paystack</span>
                </div>
                <div className={styles.methodBody}>
                  <p>You will be redirected to Paystack to complete your payment using Mobile Money or Card.</p>
                  <div className={styles.secureBadge}>
                    <ShieldCheck size={14} />
                    <span>Bank-level 256-bit encryption</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%' }}
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? 'Initializing...' : `Pay GHS ${application.plan?.price || '100.00'} Now`}
                </button>
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.infoBox}>
                <Info size={16} />
                <p>Payment confirmation is instant. Your investment status will update automatically after a successful transaction.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
