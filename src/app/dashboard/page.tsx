'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Wallet,
  MapPin,
  Navigation,
  Car,
  Bus,
  Package,
  PlusCircle,
  Clock,
  ShieldCheck,
  LogOut,
  Loader2,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  wallet_balance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<'shuttle' | 'car' | 'delivery'>('shuttle');
  const [pickup, setPickup] = useState('Gulf Estate Phase 1, Gatehouse');
  const [dropoff, setDropoff] = useState('Peter Odili Road Junction');

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/login');
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, wallet_balance')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'Resident User',
            wallet_balance: 0,
          });
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error fetching dashboard user:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 selection:bg-teal-100 selection:text-teal-900">
      
      {/* ── Top Dashboard Navbar ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Wheelnabl"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#004B4F] border border-teal-100">
              Gulf Estate Resident
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF7A00] rounded-full" />
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 py-1.5 px-3 rounded-full hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Dashboard Grid ───────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Welcome & Wallet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Greeting Box */}
          <div className="lg:col-span-2 bg-gradient-to-br from-teal-950 via-[#00373B] to-[#004B4F] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#50E3C2]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs uppercase font-bold tracking-wider text-[#50E3C2]">
                Passenger Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1">
                Hello, {profile?.full_name || 'Resident'}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-md">
                Fast-track security verification and pre-cleared access are active for your account.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-medium text-teal-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#50E3C2]" /> Pre-Cleared Pass Active
              </span>
              <span>•</span>
              <span>Account: {profile?.email}</span>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-3 bg-teal-50 text-[#004B4F] rounded-2xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Instant Auto-Pay
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Transit Balance
              </p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                ₦{(profile?.wallet_balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Fund wallet via card</span>
              <button
                type="button"
                onClick={() => alert('Paystack funding gateway opens here')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-[#e66e00] transition"
              >
                <PlusCircle className="w-4 h-4" /> Add Funds
              </button>
            </div>
          </div>

        </div>

        {/* ── Main Booking & Route Area ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Trip Planner Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
            <h3 className="text-lg font-bold text-teal-950 mb-1">Book Transit</h3>
            <p className="text-xs text-slate-500 mb-6">Select your pickup spot within Gulf Estate and destination.</p>

            {/* Ride Mode Selector */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedService('shuttle')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition text-center ${
                  selectedService === 'shuttle'
                    ? 'border-teal-700 bg-teal-50/50 text-[#004B4F]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Bus className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-bold">Estate Shuttle</span>
                <span className="text-[10px] text-slate-400 mt-0.5">₦500</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedService('car')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition text-center ${
                  selectedService === 'car'
                    ? 'border-teal-700 bg-teal-50/50 text-[#004B4F]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Car className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-bold">Private Car</span>
                <span className="text-[10px] text-slate-400 mt-0.5">₦2,500</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedService('delivery')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition text-center ${
                  selectedService === 'delivery'
                    ? 'border-teal-700 bg-teal-50/50 text-[#004B4F]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Package className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-bold">Parcel Drop</span>
                <span className="text-[10px] text-slate-400 mt-0.5">₦800</span>
              </button>
            </div>

            {/* Inputs: Origin & Destination */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Pickup Point
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#004B4F] focus-within:bg-white transition">
                  <MapPin className="w-4 h-4 text-[#004B4F] shrink-0" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    placeholder="E.g., House 14, Road 4, Phase 2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Destination
                </label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-[#004B4F] focus-within:bg-white transition">
                  <Navigation className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    placeholder="E.g., Spar Port Harcourt, GRA 2, Airport"
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => alert(`Ride dispatched from ${pickup} to ${dropoff}`)}
              className="w-full mt-6 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-sm font-bold py-3.5 px-4 rounded-full transition shadow-md shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Dispatch Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Active Status & Fast Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Estate Transit Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
              <h4 className="text-sm font-bold text-teal-950 mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Estate Gate Activity
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Main Gate Security Desk</span>
                  <span className="font-bold text-emerald-700">Clear • Fast Pass</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Average Transit Arrival</span>
                  <span className="font-bold text-slate-800">~ 4 mins inside estate</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Patrolling Shuttles</span>
                  <span className="font-bold text-teal-900">3 Vehicles Active</span>
                </div>
              </div>
            </div>

            {/* Recent Trips Placeholder */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-teal-950">Recent Trips</h4>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Gulf Phase 1 → Polo Club GRA</p>
                    <p className="text-[10px] text-slate-400">Yesterday • Completed</p>
                  </div>
                  <span className="text-xs font-bold text-teal-950">₦2,500</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Internal Gate Shuttle</p>
                    <p className="text-[10px] text-slate-400">22 Sept • Completed</p>
                  </div>
                  <span className="text-xs font-bold text-teal-950">₦500</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}