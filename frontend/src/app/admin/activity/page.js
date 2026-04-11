'use client';

import { useState } from 'react';
import useStore from '@/store/useStore';
import { 
  Activity, 
  Search, 
  Clock, 
  User, 
  Shield, 
  FilePlus, 
  CreditCard,
  PlusCircle,
  Filter
} from 'lucide-react';
import styles from './activity.module.css';

export default function AdminActivityPage() {
  const { activities } = useStore();
  const [search, setSearch] = useState('');

  const filteredActivities = activities.filter(a => 
    (a.message?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (a.actor?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const getIcon = (type) => {
    switch(type) {
      case 'auth': return <Shield size={16} className="text-info" />;
      case 'investment': return <FilePlus size={16} className="text-primary" />;
      case 'payment': return <CreditCard size={16} className="text-success" />;
      case 'admin': return <PlusCircle size={16} className="text-gold" />;
      default: return <Activity size={16} className="text-muted" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Activity Log</h1>
          <p className="page-subtitle">Historical record of all system and user actions</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-ghost btn-sm">
            <Filter size={16} /> Filter Logs
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by action or keyword..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.timeline}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((act) => (
            <div key={act.id} className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                {getIcon(act.type)}
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <p className={styles.message}>{act.message}</p>
                  <span className={styles.timestamp}>
                    <Clock size={12} />
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className={styles.timelineMeta}>
                  <span className={styles.actor}>
                    <User size={12} />
                    {act.actor || 'System'}
                  </span>
                  <span className={`${styles.tag} ${styles[act.type]}`}>
                    {act.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state py-10">
            <div className="empty-state-icon">📋</div>
            <h3 className="empty-state-title">No Activity Records</h3>
            <p>Action logs will appear here as they occur on the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}
