'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import { Clock, TrendingUp, ArrowRight, Filter } from 'lucide-react';
import styles from './plans.module.css';

export default function PlansPage() {
  const { plans, fetchPlans } = useStore();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const types = ['All', ...new Set(plans.map((p) => p.type))];
  const filtered = filter === 'All' ? plans : plans.filter((p) => p.type === filter);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1>Investment Plans</h1>
              <p className={styles.subtitle}>Choose a livestock plan that fits your goals</p>
            </div>
          </div>

          <div className={styles.filters}>
            <Filter size={16} />
            {types.map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${filter === type ? styles.filterActive : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filtered.map((plan, i) => (
              <div
                key={plan.id}
                className={`${styles.card} ${plan.status?.toLowerCase() === 'inactive' ? styles.inactive : ''}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {plan.status?.toLowerCase() === 'inactive' && (
                  <div className={styles.inactiveBanner}>Coming Soon</div>
                )}
                <div className={styles.cardTop}>
                  <img src={plan.image || '/images/default.jpg'} alt={plan.title} className={styles.planImage} />
                  <span className={styles.planBadge}>{plan.type}</span>
                  <div className={styles.planDurationBadge}>
                    <Clock size={12} /> {plan.duration}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3>{plan.title}</h3>
                  <p className={styles.desc}>{plan.description}</p>
                  <div className={styles.features}>
                    {plan.features.slice(0, 3).map((f, j) => (
                      <div key={j} className={styles.feature}>
                        <span className={styles.featureDot} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <TrendingUp size={14} />
                      {plan.roiPercentage ? `${plan.roiPercentage}%` : plan.roi} ROI
                    </div>
                  </div>
                  <div className={styles.priceRow}>
                    <div>
                      <span className={styles.price}>GHS {plan.price}</span>
                      <span className={styles.priceLabel}>Initial Capital</span>
                    </div>
                    <div className={styles.returnCol}>
                      <span className={styles.returnValue}>GHS {plan.price + (plan.price * (plan.roiPercentage || 20) / 100)}</span>
                      <span className={styles.returnLabel}>Expected Return</span>
                    </div>
                  </div>
                  {plan.status?.toLowerCase() === 'active' ? (
                    <Link href={`/apply/${plan.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                      Invest Now <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.5 }}>
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
