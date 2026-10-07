'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Search, Bell, ShieldCheck, Zap } from 'lucide-react';

export default function DriverHeader() {
  const [driverName, setDriverName] = useState<string>('Fleet Driver');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDriverInfo() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .maybeSingle();

          const resolvedName =
            profile?.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (user.email ? user.email.split('@')[0] : 'Fleet Driver');

          setDriverName(resolvedName);
        }
      } catch (err) {
        console.error('Failed to load driver header info:', err);
      }
    }

    fetchDriverInfo();
  }, []);

  const initials = driverName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#EDF0F8]/90 backdrop-blur-md transition-all">
      {/* 
        md:pl-24 offsets the 20-unit (w-20) driver sidebar on desktop.
        On mobile, it reverts to px-4 to fit flush and centered.
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:pl-24 md:pr-8 py-4 flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Brand Logo + Driver Dispatch Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Logo on mobile screens */}
          <Link href="/driver" className="md:hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Wheelnabl Driver"
              width={32}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Search Input Bar */}
          <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-full px-4 py-2.5 w-full text-xs text-slate-800 shadow-2xs focus-within:border-[#004B4F] focus-within:ring-2 focus-within:ring-[#004B4F]/10 transition">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickup zones, trip IDs, manifests..."
              className="bg-transparent outline-none w-full placeholder:text-slate-400 text-xs font-medium"
            />
          </div>
        </div>

        {/* Right Side: Security Badge, Dispatch Notifications & Driver Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Fleet Clearance Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Patrol Cleared • Unit #04</span>
          </div>

          {/* Dispatch Notice Trigger */}
          <button
            type="button"
            aria-label="Dispatch and Gate Alerts"
            onClick={() => alert('No active estate security alerts or barricade delays.')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#FF7A00] absolute top-2 right-2 border-2 border-white" />
          </button>

          {/* Driver Dossier Pill */}
          <Link
            href="/driver/profile"
            className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-full pl-1 pr-3 py-1 hover:border-slate-300 hover:shadow-2xs transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#004B4F] text-white flex items-center justify-center font-black text-[11px] shadow-xs">
              {initials || 'D1'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 max-w-[100px] sm:max-w-[130px] truncate leading-tight">
                {driverName}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-tight">
                Driver Dossier
              </span>
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
}