'use client';

import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  
  // Don't apply the dashboard layout to the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
