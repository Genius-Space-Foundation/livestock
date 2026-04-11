'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import useStore from '@/store/useStore';
import {
  Sprout,
  Shield,
  TrendingUp,
  Eye,
  ArrowRight,
  CheckCircle,
  Users,
  BarChart3,
  Clock,
  Star,
} from 'lucide-react';
import styles from './page.module.css';

export default function LandingPage() {
  const { plans, fetchPlans } = useStore();
  const activePlans = plans.filter((p) => p.status?.toLowerCase() === 'active').slice(0, 3);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sprout size={14} />
              <span>Trusted by 500+ Investors in Ghana</span>
            </div>
            <h1 className={styles.heroTitle}>
              Invest in <span className={styles.heroHighlight}>Livestock</span>,
              <br />Harvest <span className={styles.heroGold}>Real Returns</span>
            </h1>
            <p className={styles.heroText}>
              Join Ghana&#39;s leading agricultural investment platform. Fund real livestock 
              farming operations, earn competitive returns, and track every milestone 
              with full transparency.
            </p>
            <div className={styles.heroActions}>
              <Link href="/plans" className="btn btn-primary btn-lg">
                Browse Plans <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn btn-ghost btn-lg">
                Create Account
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>GHS 2.5M+</span>
                <span className={styles.heroStatLabel}>Invested</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>500+</span>
                <span className={styles.heroStatLabel}>Investors</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>50+%</span>
                <span className={styles.heroStatLabel}>Avg. ROI</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <img src="/images/cattle.jpg" alt="Cattle" className={`${styles.pieImage} ${styles.slide1}`} />
            <img src="/images/poultry.jpg" alt="Poultry" className={`${styles.pieImage} ${styles.slide2}`} />
            <img src="/images/goat.jpg" alt="Goat" className={`${styles.pieImage} ${styles.slide3}`} />
          </div>
        </section>

        {/* Value Props */}
        <section className={styles.valueSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Why Choose LiveStockInvest?</h2>
              <p>We combine technology with traditional farming to deliver reliable returns</p>
            </div>
            <div className={styles.valueGrid}>
              {[
                {
                  icon: Shield,
                  title: 'Secure & Insured',
                  desc: 'Every investment is backed by livestock insurance and professional farm management.',
                  color: 'green',
                },
                {
                  icon: TrendingUp,
                  title: 'Competitive Returns',
                  desc: 'Earn 25-55% ROI across our diverse portfolio of livestock investment plans.',
                  color: 'gold',
                },
                {
                  icon: Eye,
                  title: 'Full Transparency',
                  desc: 'Receive regular farm updates with photos, health reports, and growth metrics.',
                  color: 'blue',
                },
                {
                  icon: Clock,
                  title: 'Flexible Duration',
                  desc: 'Choose from 3-month to 12-month plans that match your investment timeline.',
                  color: 'purple',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className={styles.valueCard} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`${styles.valueIcon} ${styles[`valueIcon_${item.color}`]}`}>
                      <Icon size={24} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.howSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>How It Works</h2>
              <p>Start investing in 4 simple steps</p>
            </div>
            <div className={styles.stepsGrid}>
              {[
                { step: '01', title: 'Choose a Plan', desc: 'Browse our curated livestock investment plans', icon: '📋' },
                { step: '02', title: 'Apply & Pay', desc: 'Fill your details and pay the GHS 50 investment amount', icon: '💳' },
                { step: '03', title: 'Track Progress', desc: 'Receive regular updates on your livestock investment', icon: '📊' },
                { step: '04', title: 'Earn Returns', desc: 'Receive your investment returns at cycle completion', icon: '💰' },
              ].map((item, i) => (
                <div key={i} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{item.step}</div>
                  <div className={styles.stepEmoji}>{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  {i < 3 && <div className={styles.stepArrow}><ArrowRight size={18} /></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Plans */}
        <section className={styles.plansSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Featured Investment Plans</h2>
              <p>Start with as little as GHS 50</p>
            </div>
            <div className={styles.plansGrid}>
              {activePlans.map((plan, i) => (
                <div key={plan.id} className={styles.planCard} style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={styles.planTop}>
                    <img src={plan.image || '/images/default.jpg'} alt={plan.title} className={styles.planImage} />
                    <div className={styles.planBadge}>{plan.type}</div>
                    <div className={styles.planDurationBadge}>
                      <Clock size={12} /> {plan.duration}
                    </div>
                  </div>
                  <div className={styles.planBody}>
                    <h3>{plan.title}</h3>
                    <p className={styles.planDesc}>{plan.description}</p>
                    <div className={styles.planMeta}>
                      <div className={styles.planMetaItem}>
                        <TrendingUp size={14} />
                        <span>{plan.roiPercentage ? `${plan.roiPercentage}%` : plan.roi} ROI</span>
                      </div>
                    </div>
                    <div className={styles.planPrice}>
                      <div>
                        <span className={styles.planPriceValue}>GHS {plan.price}</span>
                        <span className={styles.planPriceLabel}>Initial Capital</span>
                      </div>
                      <div className={styles.planReturn}>
                        <span className={styles.planReturnValue}>GHS {plan.price + (plan.price * (plan.roiPercentage || 20) / 100)}</span>
                        <span className={styles.planReturnLabel}>Expected Return</span>
                      </div>
                    </div>
                    <Link href={`/apply/${plan.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                      Invest Now <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.plansMore}>
              <Link href="/plans" className="btn btn-ghost btn-lg">
                View All Plans <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={styles.testimonialSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>What Our Investors Say</h2>
              <p>Real feedback from real investors</p>
            </div>
            <div className={styles.testimonialGrid}>
              {[
                {
                  name: 'Akua Boateng',
                  role: 'Poultry Investor',
                  text: 'I invested in the layer program and received weekly updates with actual photos. My returns exceeded expectations!',
                  rating: 5,
                },
                {
                  name: 'Daniel Mensah',
                  role: 'Cattle Investor',
                  text: 'The transparency is unmatched. I can track my cattle\'s weight gain and health status at any time. Truly professional.',
                  rating: 5,
                },
                {
                  name: 'Abena Serwaa',
                  role: 'Goat Investor',
                  text: 'Started with one goat plan and now I\'m on my third cycle. The compound returns are incredible for a passive investment.',
                  rating: 5,
                },
              ].map((t, i) => (
                <div key={i} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p>&ldquo;{t.text}&rdquo;</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2>Ready to Start Investing?</h2>
              <p>Join hundreds of investors earning passive income through sustainable livestock farming.</p>
              <div className={styles.ctaActions}>
                <Link href="/register" className="btn btn-primary btn-lg">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link href="/plans" className="btn btn-ghost btn-lg">
                  Explore Plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
