import type { Metadata } from 'next';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export const metadata: Metadata = {
  title: 'Dashboard | Wheelnabl',
  description: 'Intra-estate electric vehicle transit system for Gulf Estate',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900">
     

      {/* 2. Main View Pane with Global Top Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardHeader />
        
        {/* Scrollable Child Pages */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}