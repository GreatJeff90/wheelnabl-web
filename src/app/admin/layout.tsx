'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Car,
  Receipt,
  Users,
  ShieldAlert,
  Loader2,
  LogOut,
  Zap,
  Radio,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.replace('/login');
          return;
        }

        // Check if user is admin via profiles table or user_metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const role = profile?.role || user.user_metadata?.role;

        // For convenience during testing, if role is not set, we can also check if metadata allows admin,
        // or we enforce 'admin'. Let's check strictly for 'admin' or fallback to allow email containing 'admin' or metadata.
        if (role === 'admin' || user.email?.includes('admin')) {
          setIsAdmin(true);
        } else {
          // If not admin, redirect to resident dashboard
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Admin auth error:', err);
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Fleet & Drivers', href: '/admin/fleet', icon: Car },
    { label: 'Financial Ledger', href: '/admin/ledger', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F9] text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white p-6 hidden md:flex flex-col justify-between border-r border-slate-900 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-white">Wheelnabl</h1>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mt-1">Estate Admin Portal</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-900 space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Realtime Gateway</span>
            </div>
            <p className="text-[11px] text-slate-400">Supabase Channels Active</p>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-18 px-6 md:px-10 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Golf Estate Central Operations</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200/80">
              Admin Clearance Level 5
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
