import { type BreadcrumbItem } from '@/types';
import { ReactNode } from 'react';
import Layout from '@/layouts/app/layout';

export default function AdminLayout({ children, breadcrumbs }: { children: ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Layout breadcrumbs={breadcrumbs}>
      {children}
    </Layout>
  );
}
