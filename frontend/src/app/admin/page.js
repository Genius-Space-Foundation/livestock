'use client';

import { useEffect } from 'react';
import useStore from '@/store/useStore';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { 
    applications, 
    payments, 
    getStats,
    fetchApplications,
    fetchPayments
  } = useStore();

  const stats = getStats();

  // Filter recent applications
  const recentApps = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time stats and platform performance</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary btn-sm" onClick={fetchApplications}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">GHS {stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className={styles.statTrend} data-direction="up">
            <ArrowUpRight size={14} />
            <span>12%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalApplications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-gold">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingApplications}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
          {stats.pendingApplications > 0 && (
            <div className={styles.statPulse} />
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-red">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeInvestments}</div>
            <div className="stat-label">Active Portfolios</div>
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Recent Applications */}
        <section className="card">
          <div className={styles.cardHeader}>
            <h3>Recent Applications</h3>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.length > 0 ? (
                  recentApps.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            {app.userName?.[0] || 'U'}
                          </div>
                          <span>{app.userName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>{app.plan?.type || 'Plan'}</td>
                      <td suppressHydrationWarning>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td>
                        <span className={app.paymentStatus === 'paid' ? 'text-success' : 'text-muted'}>
                          {app.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">No applications found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Platform Health / Alerts */}
        <section className="flex flex-col gap-md">
          <div className="card">
            <h3>System Health</h3>
            <div className={styles.healthList}>
              <div className={styles.healthItem}>
                <div className={styles.dotHealthy} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Payment Gateway</p>
                  <p className="text-xs text-muted">Paystack bridge active</p>
                </div>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.dotHealthy} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Database Engine</p>
                  <p className="text-xs text-muted">PostgreSQL via Prisma</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.alertCard} ${stats.pendingApplications > 5 ? styles.alertWarning : ''}`}>
            <AlertCircle size={20} />
            <div>
              <p className="font-semibold text-sm">Action Required</p>
              <p className="text-xs">There are {stats.pendingApplications} applications waiting for review.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
