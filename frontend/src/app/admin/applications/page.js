'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  ArrowRight,
  ExternalLink,
  User,
  Mail,
  Phone
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import styles from './applications.module.css';

export default function AdminApplicationsPage() {
  const { applications, approveApplication, rejectApplication } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewingApp, setViewingApp] = useState(null);

  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      (a.userName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (a.plan?.type?.toLowerCase() || '').includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && a.status.toLowerCase() === filter.toLowerCase();
  });

  const handleApprove = async (id) => {
    if (window.confirm('Approve this investment application?')) {
      await approveApplication(id);
      setViewingApp(null);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this application? The user will be notified.')) {
      await rejectApplication(id);
      setViewingApp(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investment Applications</h1>
          <p className="page-subtitle">Review and manage platform applications</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by investor or plan..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ width: '200px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Investor</th>
              <th>Investment Plan</th>
              <th>Applied Date</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-center">Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length > 0 ? (
              filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className={styles.userCell}>
                      <strong>{app.userName || 'Unknown'}</strong>
                      <span>{app.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-semibold">{app.plan?.type} Operation</span>
                      <span className="text-xs text-muted">{app.plan?.duration} Cycle</span>
                    </div>
                  </td>
                  <td>{app.appliedDate || new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={app.paymentStatus === 'paid' ? 'text-success' : 'text-muted'}>
                      {app.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewingApp(app)}
                      >
                        Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <div className="empty-state">
                    <p>No applications found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="Application Details"
        footer={
          viewingApp?.status === 'pending' ? (
            <>
              <button 
                className="btn btn-danger" 
                onClick={() => handleReject(viewingApp.id)}
              >
                <XCircle size={16} /> Reject
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleApprove(viewingApp.id)}
              >
                <CheckCircle size={16} /> Approve
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setViewingApp(null)}>Close</button>
          )
        }
      >
        {viewingApp && (
          <div className={styles.modalContent}>
            <div className={styles.section}>
              <h4>Investor Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <User size={14} />
                  <span>{viewingApp.userName}</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail size={14} />
                  <span>{viewingApp.userEmail}</span>
                </div>
                <div className={styles.infoItem}>
                  <Phone size={14} />
                  <span>{viewingApp.userPhone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Plan Details</h4>
              <div className={styles.planBox}>
                <img src={viewingApp.plan?.image} alt="" />
                <div>
                  <h5>{viewingApp.plan?.type} Investment</h5>
                  <p>{viewingApp.plan?.duration} Duration • GHS {viewingApp.plan?.price} Fee</p>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Financial Status</h4>
              <div className={styles.statusBox}>
                <div className={styles.statusItem}>
                  <span>Application Status</span>
                  <StatusBadge status={viewingApp.status} />
                </div>
                <div className={styles.statusItem}>
                  <span>Payment Status</span>
                  <span className={viewingApp.paymentStatus === 'paid' ? 'text-success font-semibold' : 'text-muted'}>
                    {viewingApp.paymentStatus === 'paid' ? 'Fully Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
