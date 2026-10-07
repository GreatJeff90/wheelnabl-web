import type { Metadata } from 'next';
import Sidebar from '@/components/driver/Sidebar';
import DriverHeader from '@/components/driver/DriverHeader';

export const metadata: Metadata = {
  title: 'Dashboard | Wheelnabl',
  description: 'Intra-estate electric vehicle transit system for Golf Estate',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. Full-height Sidebar on the left */}
      <Sidebar />

      {/* 2. Main View Pane with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DriverHeader />

        {/* Scrollable Child Pages */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}