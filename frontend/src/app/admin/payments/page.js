'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import styles from './payments.module.css';

export default function AdminPaymentsPage() {
  const { payments, fetchPayments } = useStore();
  const [search, setSearch] = useState('');

  const filteredPayments = payments.filter(p => 
    (p.userName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Transactions</h1>
          <p className="page-subtitle">Monitor all platform revenue and transaction statuses</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPayments}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by user or transaction ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Transaction ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Gateway</th>
              <th>Status</th>
              <th className="text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.userCell}>
                      <strong>{p.userName}</strong>
                      <span>{p.userEmail || 'via Paystack'}</span>
                    </div>
                  </td>
                  <td>
                    <code className="text-xs">{p.id.slice(0, 12)}...</code>
                  </td>
                  <td>
                    <span className="font-bold">GHS {p.amount.toLocaleString()}</span>
                  </td>
                  <td>{p.date}</td>
                  <td>
                    <div className="flex items-center gap-xs">
                      <CreditCard size={14} className="text-muted" />
                      <span>Paystack</span>
                    </div>
                  </td>
                  <td>
                    <div className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
                      {p.status === 'success' && <CheckCircle2 size={12} />}
                      {p.status === 'pending' && <Clock size={12} />}
                      {p.status === 'failed' && <XCircle size={12} />}
                      <span>{p.status}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button className="btn btn-ghost btn-sm">
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <div className="empty-state">
                    <p>No payment records found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
