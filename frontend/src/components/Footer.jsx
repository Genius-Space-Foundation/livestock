'use client';

import Link from 'next/link';
import { Sprout, Github, Mail, Phone } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Sprout size={24} />
            <span>LiveStock<strong>Invest</strong></span>
          </div>
          <p className={styles.tagline}>
            Empowering investors through transparent, sustainable livestock farming in Ghana.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>Platform</h4>
            <Link href="/plans">Browse Plans</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/register">Get Started</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Blog</a>
          </div>
          <div className={styles.linkGroup}>
            <h4>Contact</h4>
            <a href="mailto:info@livestockinvest.com">
              <Mail size={14} /> info@livestockinvest.com
            </a>
            <a href="tel:+233241234567">
              <Phone size={14} /> +233 24 123 4567
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} LiveStockInvest. All rights reserved.</p>
      </div>
    </footer>
  );
}
