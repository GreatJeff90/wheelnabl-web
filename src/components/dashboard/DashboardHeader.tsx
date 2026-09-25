'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Bell, ShieldCheck } from 'lucide-react';

export default function DashboardHeader() {
  const [userName, setUserName] = useState<string>('Resident');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          const resolvedName =
            profile?.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (user.email ? user.email.split('@')[0] : 'Resident');

          setUserName(resolvedName);
        }
      } catch (err) {
        console.error('Failed to load user header info:', err);
      }
    }

    fetchUser();
  }, []);

  const initials = userName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-20 px-6 sm:px-8 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
      {/* Search Input Bar */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-2.5 w-64 sm:w-80 md:w-96 text-xs text-slate-800 focus-within:bg-white focus-within:border-[#004B4F] transition">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search zones, cab ID, gatehouse..."
          className="bg-transparent outline-none w-full placeholder:text-slate-400 text-xs"
        />
      </div>

      {/* Right User & Notification Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Estate Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[11px] font-bold text-[#004B4F]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gulf Estate Transit</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => alert('No new gate alerts')}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#FF7A00] absolute top-2.5 right-2.5" />
        </button>

        {/* Profile Chip */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full pl-1.5 pr-3.5 py-1 hover:bg-slate-100 transition cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-[#004B4F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {initials || 'R'}
          </div>
          <span className="text-xs font-bold text-slate-800 max-w-[110px] sm:max-w-[140px] truncate">
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}