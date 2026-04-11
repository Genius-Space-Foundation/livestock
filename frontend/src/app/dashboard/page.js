'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import api from '@/utils/api';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Bell, 
  Award,
  Calendar,
  ChevronRight,
  Download
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import styles from './dashboard.module.css';

export default function UserDashboard() {
  const router = useRouter();
  const { 
    currentUser, 
    wallet, 
    getUserApplications, 
    updates,
    plans,
    fetchWallet,
    fetchApplications,
    fetchUpdates,
    fetchPlans,
    addToast
  } = useStore();

  const [loadingWithdrawal, setLoadingWithdrawal] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    // ensure fresh data
    fetchApplications();
    fetchWallet();
    fetchPlans();
  }, [currentUser, router, fetchApplications, fetchWallet, fetchPlans]);

  if (!currentUser) return null;

  const userApps = getUserApplications(currentUser.id);
  const activeApps = userApps.filter(a => a.status === 'approved' && a.paymentStatus === 'paid');
  const pendingApps = userApps.filter(a => a.status === 'pending');

  const totalInvested = activeApps.reduce((acc, app) => acc + (app.amountInvested || 0), 0);
  const totalExpectedROI = activeApps.reduce((acc, app) => acc + (app.expectedRoiAmount || 0), 0);
  const totalTargetReturn = totalInvested + totalExpectedROI;

  const calculateProgress = (app) => {
    if (!app.maturityDate || !app.createdAt) return 0;
    const start = new Date(app.createdAt).getTime();
    const end = new Date(app.maturityDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const totalDuration = end - start;
    const elapsed = now - start;
    return Math.min(Math.round((elapsed / totalDuration) * 100), 100);
  };

  const handleRequestWithdrawal = async (app) => {
    try {
      setLoadingWithdrawal(app.id);
      // Ensure backend withdrawal matches plan logic, or use generic request
      const network = currentUser.phone ? 'MTN' : 'VODAFONE'; // dummy inference
      await api.post('/withdrawals', {
        amount: (app.amountInvested || 0) + (app.expectedRoiAmount || 0),
        phoneNumber: currentUser.phone,
        network: "MTN",
        applicationId: app.id
      });
      addToast('Withdrawal requested successfully', 'success');
      fetchApplications();
    } catch (e) {
      addToast(e.response?.data?.message || e.message || 'Failed to request withdrawal', 'error');
    } finally {
      setLoadingWithdrawal(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div className={styles.greeting}>
              <h1>Portfolio Overview 👋</h1>
              <p>Track your livestock investments and ROI yields.</p>
            </div>
            <div className={styles.date}>
              <Calendar size={14} />
              <span suppressHydrationWarning>
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </header>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: 'var(--accent-primary)' }}>
                <Wallet size={20} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statValue}>GHS {totalInvested.toFixed(2)}</span>
                <span className={styles.statLabel}>Total Capital</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: 'var(--accent-gold)' }}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statValue}>GHS {totalExpectedROI.toFixed(2)}</span>
                <span className={styles.statLabel}>Expected ROI</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: 'var(--status-success)' }}>
                <Award size={20} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statValue}>GHS {totalTargetReturn.toFixed(2)}</span>
                <span className={styles.statLabel}>Target Maturity</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: 'var(--status-info)' }}>
                <Clock size={20} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statValue}>{activeApps.length}</span>
                <span className={styles.statLabel}>Active Portfolios</span>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            {/* Left Column: Investments */}
            <div className={styles.mainContent}>
              <h2 className={styles.sectionTitle}>
                Active Portfolios
              </h2>
              <div className={styles.investmentList}>
                {userApps.length > 0 ? (
                  userApps.map((app) => {
                    const progress = calculateProgress(app);
                    const isMatured = progress >= 100;
                    
                    return (
                      <div key={app.id} className={styles.portfolioCard}>
                        <div className={styles.portfolioTop}>
                          <div className={styles.planInfo}>
                            <img 
                              src={app.plan?.image || '/images/default.jpg'} 
                              alt={app.plan?.type} 
                              className={styles.planImage} 
                            />
                            <div className={styles.planMeta}>
                              <h3>{app.plan?.type} Operation</h3>
                            <p>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className={styles.statusBox}>
                            <StatusBadge status={app.status === 'approved' ? 'Active' : app.status} />
                          </div>
                        </div>

                        {app.paymentStatus === 'paid' && app.status === 'approved' && (
                          <div className={styles.portfolioBody}>
                            <div className={styles.metricGrid}>
                              <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Capital Invested</span>
                                <strong className={styles.metricValue}>GHS {app.amountInvested?.toFixed(2) || '0.00'}</strong>
                              </div>
                              <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Expected ROI</span>
                                <strong className={styles.metricValue} style={{color: 'var(--accent-gold)'}}>+ GHS {app.expectedRoiAmount?.toFixed(2) || '0.00'}</strong>
                              </div>
                              <div className={styles.metricItem}>
                                <span className={styles.metricLabel}>Maturity Date</span>
                                <strong className={styles.metricValue}>{app.maturityDate ? new Date(app.maturityDate).toLocaleDateString() : 'TBD'}</strong>
                              </div>
                            </div>
                            
                            <div className={styles.progressSection}>
                              <div className={styles.progressHeader}>
                                <span>Cycle Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                              </div>
                            </div>

                            <div className={styles.portfolioActions}>
                              {isMatured ? (
                                app.withdrawalStatus !== 'not_requested' ? (
                                  <span className={styles.withdrawalStatus}>Withdrawal {app.withdrawalStatus}</span>
                                ) : (
                                  <button 
                                    className="btn btn-primary" 
                                    onClick={() => handleRequestWithdrawal(app)}
                                    disabled={loadingWithdrawal === app.id}
                                  >
                                    <Download size={16} /> 
                                    {loadingWithdrawal === app.id ? 'Requesting...' : 'Request Withdrawal (GHS ' + ((app.amountInvested || 0) + (app.expectedRoiAmount || 0)).toFixed(2) + ')'}
                                  </button>
                                )
                              ) : (
                                <p className={styles.immatureNote}>Maturing in {app.maturityDate ? Math.ceil((new Date(app.maturityDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : '?'} days</p>
                              )}
                            </div>
                          </div>
                        )}
                        {app.paymentStatus === 'unpaid' && (
                          <div className={styles.portfolioBody}>
                            <p className="text-muted">Awaiting Payment</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : null}
              </div>

              {/* Available Plans Section */}
              <div className={styles.availableSection}>
                <h2 className={styles.sectionTitle}>
                  <TrendingUp size={18} /> Available Investment Plans
                </h2>
                <div className={styles.plansGrid}>
                  {plans.filter(p => p.status === 'active').map((plan) => (
                    <div key={plan.id} className={styles.planMiniCard}>
                      <div className={styles.planMiniTop}>
                        <img src={plan.image || '/images/default.jpg'} alt={plan.title} />
                        <span className={styles.planMiniBadge}>{plan.type}</span>
                        <div className={styles.planMiniDurationBadge}>
                          <Clock size={12} /> {plan.duration}
                        </div>
                      </div>
                      <div className={styles.planMiniBody}>
                        <h4>{plan.title}</h4>
                        <div className={styles.planMiniMeta}>
                          <span className={styles.planMiniRoi}>{plan.roiPercentage ? `${plan.roiPercentage}%` : plan.roi} ROI</span>
                        </div>
                        <div className={styles.planMiniPrice}>
                          <div className={styles.priceInfo}>
                            <span className={styles.priceLabel}>Capital</span>
                            <span className={styles.priceValue}>GHS {plan.price}</span>
                          </div>
                          <div className={styles.priceInfo}>
                            <span className={styles.priceLabel}>Return</span>
                            <span className={styles.returnValue}>GHS {plan.price + (plan.price * (plan.roiPercentage || 20) / 100)}</span>
                          </div>
                        </div>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ width: '100%', marginTop: 'auto' }}
                          onClick={() => router.push(`/apply/${plan.id}`)}
                        >
                          Invest Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.updatesCard}>
                <div className={styles.sectionTitle}>
                  <Bell size={18} />
                  Latest Farm Updates
                </div>
                {updates.length > 0 ? (
                  updates.slice(0, 3).map((update) => (
                    <div key={update.id} className={styles.updateItem}>
                      <div className={styles.updateHeader}>
                        <h4>{update.title}</h4>
                        <span>{update.date}</span>
                      </div>
                      <p>{update.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm">No updates yet.</p>
                )}
              </div>

              <div className={styles.actionCard}>
                <h3>Need Assistance?</h3>
                <p>Contact your dedicated portfolio manager.</p>
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Support Center
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
