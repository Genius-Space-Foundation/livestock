'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
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
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Banknote,
  Phone,
  Wifi,
  History,
  CheckCircle,
  XCircle,
  Loader,
  Activity,
  Zap,
  RefreshCw
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
    myWithdrawals,
    fetchWallet,
    fetchApplications,
    fetchUpdates,
    fetchPlans,
    fetchMyWithdrawals,
    fetchPlatformActivities,
    activities,
    payments,
    fetchMyPayments,
    verifyPayment,
    depositToWallet,
    requestWalletWithdrawal,
    reinvestApplication,
    addToast
  } = useStore();

  const [loadingWithdrawal, setLoadingWithdrawal] = useState(null);
  const [loadingReinvest, setLoadingReinvest] = useState(null);
  const [verifyingRef, setVerifyingRef] = useState(null);

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStartIndex, setActiveStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('MTN');
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    // ensure fresh data
    fetchApplications();
    fetchWallet();
    fetchPlans();
    fetchMyWithdrawals();
    fetchPlatformActivities();
    fetchMyPayments();
  }, [currentUser, router, fetchApplications, fetchWallet, fetchPlans, fetchMyWithdrawals, fetchPlatformActivities, fetchMyPayments]);

  useEffect(() => {
    if (activities.length <= 4) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setActiveStartIndex((prev) => {
        const next = prev + 1;
        // If we reached the end of real activities (transitioning into duplicates)
        if (next > activities.length) {
          setIsTransitioning(false);
          return 0;
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [activities.length]);

  // Seamless reset logic: if we reached the index past the length, jump back to 0 instantly
  useEffect(() => {
    if (activeStartIndex === activities.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveStartIndex(0);
      }, 800); // Wait for transition to finish
      return () => clearTimeout(timer);
    }
  }, [activeStartIndex, activities.length]);

  if (!currentUser) return null;

  const handleRefreshWallet = async () => {
    setIsRefreshing(true);
    try {
      await fetchWallet();
      addToast('Wallet balance updated', 'success');
    } catch (e) {
      addToast('Failed to refresh wallet', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const formatActivityTime = (date) => {
    const diff = new Date() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getVisibleActivities = () => {
    // Return activities + the first few items duplicated at the end for seamless looping
    if (activities.length <= 4) return activities;
    return [...activities, ...activities.slice(0, 4)];
  };

  const handleVerifyPayment = async (ref) => {
    setVerifyingRef(ref);
    try {
      await verifyPayment(ref);
    } finally {
      setVerifyingRef(null);
    }
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

  const handleReinvest = async (app) => {
    if (!window.confirm('Are you sure you want to reinvest the total matured amount into a new plan?')) return;
    try {
      setLoadingReinvest(app.id);
      await reinvestApplication(app.id);
      fetchApplications();
    } catch (e) {
      // toast is handled in store
    } finally {
      setLoadingReinvest(null);
    }
  };

  // Deposit handler
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    try {
      setLoadingDeposit(true);
      await depositToWallet(amount);
    } catch (err) {
      // toast handled in store
    } finally {
      setLoadingDeposit(false);
    }
  };

  // Withdrawal handler
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    if (!withdrawPhone || withdrawPhone.length < 10) {
      addToast('Please enter a valid phone number', 'error');
      return;
    }
    try {
      setLoadingWithdraw(true);
      await requestWalletWithdrawal(amount, withdrawPhone, withdrawNetwork);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawPhone('');
      setWithdrawNetwork('MTN');
    } catch (err) {
      // toast handled in store
    } finally {
      setLoadingWithdraw(false);
    }
  };

  const getWithdrawalStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Loader size={14} />;
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
                                  <span className={styles.withdrawalStatus}>Status: {app.withdrawalStatus}</span>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                    <button 
                                      className="btn btn-primary" 
                                      style={{ flex: 1, padding: '0.5rem' }}
                                      onClick={() => handleRequestWithdrawal(app)}
                                      disabled={loadingWithdrawal === app.id || loadingReinvest === app.id}
                                    >
                                      <Download size={14} /> 
                                      {loadingWithdrawal === app.id ? 'Wait...' : 'Withdraw'}
                                    </button>
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ flex: 1, padding: '0.5rem' }}
                                      onClick={() => handleReinvest(app)}
                                      disabled={loadingWithdrawal === app.id || loadingReinvest === app.id}
                                    >
                                      <RefreshCw size={14} /> 
                                      {loadingReinvest === app.id ? 'Wait...' : 'Reinvest'}
                                    </button>
                                  </div>
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
              {/* Wallet Card */}
              <div className={styles.walletCard}>
                <div className={styles.walletHeader}>
                  <div className={styles.walletIcon}>
                    <Wallet size={20} />
                  </div>
                  <span className={styles.walletLabel}>Wallet Balance</span>
                  <button 
                    className={styles.refreshBtn} 
                    onClick={handleRefreshWallet}
                    disabled={isRefreshing}
                    title="Refresh Balance"
                  >
                    <Loader size={12} className={isRefreshing ? styles.spin : ''} />
                  </button>
                </div>
                <div className={styles.walletBalance}>
                  <span className={styles.walletCurrency}>GHS</span>
                  <span className={styles.walletAmount}>{wallet?.balance?.toFixed(2) || '0.00'}</span>
                </div>
                <div className={styles.walletStats}>
                  <div className={styles.walletStatItem}>
                    <ArrowDownLeft size={12} className={styles.depositIcon} />
                    <span>Deposits: GHS {wallet?.totalDeposits?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className={styles.walletStatItem}>
                    <ArrowUpRight size={12} className={styles.withdrawIcon} />
                    <span>Withdrawals: GHS {wallet?.totalWithdrawals?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
                <div className={styles.walletActions}>
                  <button 
                    id="deposit-btn"
                    className={`btn ${styles.depositBtn}`}
                    onClick={() => setShowDepositModal(true)}
                  >
                    <ArrowDownLeft size={16} />
                    Deposit
                  </button>
                  <button 
                    id="withdraw-btn"
                    className={`btn ${styles.withdrawBtn}`}
                    onClick={() => {
                      setWithdrawPhone(currentUser.phone || '');
                      setShowWithdrawModal(true);
                    }}
                  >
                    <ArrowUpRight size={16} />
                    Withdraw
                  </button>
                </div>
              </div>

              {/* Withdrawal History */}
              {myWithdrawals && myWithdrawals.length > 0 && (
                <div className={styles.withdrawalHistoryCard}>
                  <div className={styles.sectionTitle}>
                    <History size={18} />
                    Withdrawal History
                  </div>
                  <div className={styles.withdrawalList}>
                    {myWithdrawals.slice(0, 5).map((w) => (
                      <div key={w.id} className={styles.withdrawalItem}>
                        <div className={styles.withdrawalItemLeft}>
                          <div className={`${styles.withdrawalStatusIcon} ${styles[`wStatus_${w.status}`]}`}>
                            {getWithdrawalStatusIcon(w.status)}
                          </div>
                          <div className={styles.withdrawalItemMeta}>
                            <span className={styles.withdrawalItemAmount}>GHS {w.amount?.toFixed(2)}</span>
                            <span className={styles.withdrawalItemDate}>
                              {new Date(w.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' · '}{w.network}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={w.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Syncs Section */}
              {payments.filter(p => p.status === 'pending').length > 0 && (
                <div className={styles.syncCard}>
                  <div className={styles.sectionTitle}>
                    <RefreshCw size={14} /> Pending Deposits
                  </div>
                  <div className={styles.syncList}>
                    {payments.filter(p => p.status === 'pending').map(p => (
                      <div key={p.id} className={styles.syncItem}>
                        <div className={styles.syncInfo}>
                          <span className={styles.syncRef}>...{p.reference.slice(-8).toUpperCase()}</span>
                          <span className={styles.syncAmount}>GHS {p.amount.toFixed(2)}</span>
                        </div>
                        <button 
                          className={styles.syncBtn}
                          onClick={() => handleVerifyPayment(p.reference)}
                          disabled={verifyingRef === p.reference}
                        >
                          {verifyingRef === p.reference ? (
                            <Loader size={12} className={styles.spin} />
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className={styles.syncNote}>Click verify if your deposit hasn't reflected.</p>
                </div>
              )}

              <div className={styles.updatesCard}>
                <div className={styles.sectionTitle}>
                  <Zap size={18} className={styles.zapIcon} />
                  Live Activity Feed
                </div>
                <div className={styles.activityFeed}>
                  {activities.length > 0 ? (
                    <div 
                      className={`${styles.activityTrack} ${isTransitioning ? styles.transitioning : ''}`}
                      style={{ transform: `translateY(-${activeStartIndex * 90}px)` }}
                    >
                      {getVisibleActivities().map((activity, idx) => (
                        <div key={`${activity.id}-${idx}`} className={styles.activityItem}>
                          <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                            {activity.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          </div>
                          <div className={styles.activityContent}>
                            <p className={styles.activityText}>
                              <span className={styles.activityUser}>{activity.userName}</span>{' '}
                              {activity.type === 'deposit' ? 'deposited' : 'withdrew'}{' '}
                              <span className={styles.activityAmount}>GHS {activity.amount.toLocaleString()}</span>
                            </p>
                            <span className={styles.activityTime}>{formatActivityTime(activity.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-sm px-4 py-2">No activity recorded yet.</p>
                  )}
                </div>
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

      {/* ── Deposit Modal ── */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => { setShowDepositModal(false); setDepositAmount(''); }}
        title="Deposit to Wallet"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setShowDepositModal(false); setDepositAmount(''); }}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={handleDeposit}
              disabled={loadingDeposit || !depositAmount}
            >
              <CreditCard size={16} />
              {loadingDeposit ? 'Processing...' : 'Pay with Paystack'}
            </button>
          </>
        }
      >
        <div className={styles.modalIntro}>
          <div className={styles.modalIconWrap}>
            <ArrowDownLeft size={24} />
          </div>
          <p>Fund your wallet via Paystack. Your balance updates automatically after payment.</p>
          <p className={styles.modalSubNote} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            * It may take a few moments for your balance to reflect after payment. You can use the refresh button in your wallet card to sync manually.
          </p>
        </div>
        <form onSubmit={handleDeposit} className={styles.modalForm}>
          <div className="form-group">
            <label className="form-label">Amount (GHS)</label>
            <input
              id="deposit-amount"
              type="number"
              className="form-input"
              placeholder="e.g. 500"
              min="1"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
            />
          </div>
          <div className={styles.quickAmounts}>
            {[50, 100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                className={`${styles.quickAmountBtn} ${parseFloat(depositAmount) === amt ? styles.quickAmountActive : ''}`}
                onClick={() => setDepositAmount(String(amt))}
              >
                GHS {amt}
              </button>
            ))}
          </div>
        </form>
      </Modal>

      {/* ── Withdrawal Modal ── */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawPhone(''); }}
        title="Request Withdrawal"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawPhone(''); }}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={handleWithdrawSubmit}
              disabled={loadingWithdraw || !withdrawAmount || !withdrawPhone}
            >
              <Banknote size={16} />
              {loadingWithdraw ? 'Submitting...' : 'Submit Request'}
            </button>
          </>
        }
      >
        <div className={styles.modalIntro}>
          <div className={`${styles.modalIconWrap} ${styles.modalIconWithdraw}`}>
            <ArrowUpRight size={24} />
          </div>
          <p>Withdraw funds to your mobile money wallet. Requests are reviewed within 24 hours.</p>
        </div>
        {wallet && (
          <div className={styles.availableBalance}>
            <span>Available Balance</span>
            <strong>GHS {wallet.balance?.toFixed(2) || '0.00'}</strong>
          </div>
        )}
        <form onSubmit={handleWithdrawSubmit} className={styles.modalForm}>
          <div className="form-group">
            <label className="form-label">Amount (GHS)</label>
            <input
              id="withdraw-amount"
              type="number"
              className="form-input"
              placeholder="e.g. 200"
              min="1"
              step="0.01"
              max={wallet?.balance || 0}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className={styles.inputWithIcon}>
              <Phone size={16} className={styles.inputIcon} />
              <input
                id="withdraw-phone"
                type="tel"
                className="form-input"
                placeholder="0241234567"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Network</label>
            <div className={styles.networkOptions}>
              {['MTN', 'Vodafone', 'AirtelTigo'].map((net) => (
                <button
                  key={net}
                  type="button"
                  className={`${styles.networkBtn} ${withdrawNetwork === net ? styles.networkActive : ''}`}
                  onClick={() => setWithdrawNetwork(net)}
                >
                  <Wifi size={14} />
                  {net}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
