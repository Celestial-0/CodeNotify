'use client';

import { ReactNode } from 'react';
import { AdminLayout } from '@/components/core/admin/admin-layout';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  // The AdminLayout component handles all auth and role checking
  // No need to duplicate it here
  return <AdminLayout>{children}</AdminLayout>;
}
