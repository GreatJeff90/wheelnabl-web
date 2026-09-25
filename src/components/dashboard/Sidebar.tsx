'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutGrid,
  Car,
  Clock,
  User,
  Moon,
  LogOut,
} from 'lucide-react';

export type DashboardTab = 'home' | 'rides' | 'history' | 'profile';

interface NavItem {
  id: DashboardTab;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  activeTab?: DashboardTab;
  setActiveTab?: (tab: DashboardTab) => void;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Overview', href: '/dashboard', icon: LayoutGrid },
  { id: 'rides', label: 'Fleet & Rides', href: '/dashboard/rides', icon: Car },
  { id: 'history', label: 'Trip History', href: '/dashboard/history', icon: Clock },
  { id: 'profile', label: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const checkIsActive = (item: NavItem) => {
    if (activeTab) return activeTab === item.id;
    return item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href);
  };

  return (
    <>
      {/* ── 1. Desktop / Tablet Left Sidebar (Hidden on mobile) ──── */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-100 flex-col items-center justify-between py-6 shrink-0 h-screen sticky top-0 z-40">
        <div className="flex flex-col items-center gap-7 w-full">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center justify-center p-2 rounded-2xl hover:bg-slate-50 transition"
          >
            <Image
              src="/logo.png"
              alt="Wheelnabl Logo"
              width={40}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation Links Stack */}
          <nav className="flex flex-col items-center gap-3 w-full px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = checkIsActive(item);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveTab?.(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition cursor-pointer ${
                    isActive
                      ? 'bg-[#004B4F] text-white shadow-md shadow-teal-950/15'
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Controls */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            title="Log Out"
            aria-label="Log Out"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-2xl text-slate-300 flex items-center justify-center">
            <Moon className="w-4 h-4" />
          </div>
        </div>
      </aside>

      {/* ── 2. Mobile Floating Bottom Navigation Bar (Hidden on desktop) */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/90 backdrop-blur-lg border border-slate-200/80 shadow-xl shadow-slate-900/10 rounded-full px-4 py-2 flex items-center gap-2 max-w-sm w-full justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveTab?.(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-[#004B4F] text-white shadow-md shadow-teal-950/20'
                    : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}

          {/* Quick Sign Out Action on Mobile */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Log Out"
            aria-label="Log Out"
            className="flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-rose-600 active:scale-95 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </>
  );
}