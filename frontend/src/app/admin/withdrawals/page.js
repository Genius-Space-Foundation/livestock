'use client';

import { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Banknote,
  Calendar,
  Phone,
  ArrowRight,
  Filter,
  User,
  CreditCard
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import styles from './withdrawals.module.css';

export default function AdminWithdrawalsPage() {
  const { 
    adminWithdrawals, 
    fetchAdminWithdrawals, 
    approveWithdrawal, 
    rejectWithdrawal 
  } = useStore();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewingWithdrawal, setViewingWithdrawal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminWithdrawals();
  }, [fetchAdminWithdrawals]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAdminWithdrawals();
    setIsRefreshing(false);
  };

  const filteredWithdrawals = adminWithdrawals.filter(w => {
    const matchesSearch = 
      (w.user?.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (w.phoneNumber || '').includes(search);
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && w.status.toLowerCase() === filter.toLowerCase();
  });

  const handleApprove = async (id) => {
    if (window.confirm('Approve this withdrawal and mark as processed?')) {
      await approveWithdrawal(id);
      setViewingWithdrawal(null);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this withdrawal request?')) {
      await rejectWithdrawal(id);
      setViewingWithdrawal(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdrawal Requests</h1>
          <p className="page-subtitle">Review and process platform-wide payout requests</p>
        </div>
        <button 
          className={`btn btn-secondary ${isRefreshing ? 'opacity-50' : ''}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by user or phone number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-sm items-center">
            <Filter size={16} className="text-muted" />
            <select 
              className="form-select" 
              style={{ width: '180px' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Withdrawals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Amount</th>
              <th>Payout Method</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.length > 0 ? (
              filteredWithdrawals.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className={styles.userCell}>
                      <strong>{w.user?.fullName || 'Unknown'}</strong>
                      <span>{w.user?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-bold text-lg">GHS {w.amount?.toLocaleString()}</span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{w.network} Payout</span>
                      <span className="text-xs text-muted flex items-center gap-xs">
                        <Phone size={10} /> {w.phoneNumber}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm opacity-80">
                      {new Date(w.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={w.status} />
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewingWithdrawal(w)}
                      >
                        Review <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-12">
                  <div className="empty-state">
                    <Banknote size={48} className="opacity-10 mb-2" />
                    <p>No withdrawal requests found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!viewingWithdrawal}
        onClose={() => setViewingWithdrawal(null)}
        title="Review Withdrawal Request"
        footer={
          viewingWithdrawal?.status === 'pending' ? (
            <>
              <button 
                className="btn btn-danger" 
                onClick={() => handleReject(viewingWithdrawal.id)}
              >
                <XCircle size={16} /> Reject Request
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleApprove(viewingWithdrawal.id)}
              >
                <CheckCircle size={16} /> Approve & Payout
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setViewingWithdrawal(null)}>Close</button>
          )
        }
      >
        {viewingWithdrawal && (
          <div className={styles.modalContent}>
            <div className={styles.amountBanner}>
              <span className={styles.bannerLabel}>Withdrawal Amount</span>
              <span className={styles.bannerValue}>GHS {viewingWithdrawal.amount?.toLocaleString()}</span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <h5><User size={14} /> User Details</h5>
                <p><strong>Name:</strong> {viewingWithdrawal.user?.fullName}</p>
                <p><strong>Email:</strong> {viewingWithdrawal.user?.email}</p>
                <p><strong>Phone:</strong> {viewingWithdrawal.user?.phone || 'N/A'}</p>
              </div>

              <div className={styles.detailCard}>
                <h5><CreditCard size={14} /> Payout Destination</h5>
                <p><strong>Network:</strong> {viewingWithdrawal.network}</p>
                <p><strong>Mobile Number:</strong> {viewingWithdrawal.phoneNumber}</p>
                <p><strong>Type:</strong> Individual Wallet</p>
              </div>
            </div>

            <div className={styles.timingSection}>
              <div className={styles.timingItem}>
                <Calendar size={14} />
                <span>Requested: {new Date(viewingWithdrawal.createdAt).toLocaleString()}</span>
              </div>
              {viewingWithdrawal.processedAt && (
                <div className={styles.timingItem}>
                  <CheckCircle size={14} className="text-success" />
                  <span>Processed: {new Date(viewingWithdrawal.processedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className={styles.payoutStatus}>
              <span>Current Status</span>
              <StatusBadge status={viewingWithdrawal.status} />
            </div>

            {viewingWithdrawal.status === 'pending' && (
              <div className={styles.warningBox}>
                <strong>Warning:</strong> Ensure you have manually initiated the transfer to the user's mobile number before clicking "Approve". 
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
