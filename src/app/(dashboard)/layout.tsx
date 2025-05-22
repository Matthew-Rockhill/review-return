// src/app/(dashboard)/layout.tsx
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AuthProvider } from '@/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}