'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useDriverPresence } from '@/hooks/useDriverPresence';
import {
  Wallet,
  MapPin,
  Navigation,
  Plus,
  Loader2,
  ChevronDown,
  ArrowUpRight,
  Zap,
  Phone,
  ShieldCheck,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Car,
  Clock,
  History,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  wallet_balance: number;
}

interface AssignedDriverInfo {
  name: string;
  phone: string;
  cabNumber: string;
  securityPin: string;
  eta: string;
}

const ESTATE_LOCATIONS = [
  'Golf Estate Main Gate',
  'Phase 1 Gatehouse',
  'Phase 2 Gatehouse',
  'Clubhouse & Recreation Center',
  'Sports Pavilion & Tennis Court',
  'Town Houses',
  'JDP Round about',
];

const RECENT_TRIPS_MOCK = [
  {
    id: 'TRP-104',
    pickup: 'Phase 1 Gatehouse',
    dropoff: 'Clubhouse & Recreation Center',
    date: '2:15 PM',
    fare: '0.9 hp',
    type: 'Shuttle',
  },
  {
    id: 'TRP-103',
    pickup: 'Road 4 Residential',
    dropoff: 'Main Gate',
    date: 'Yesterday',
    fare: '4.6 hp',
    type: 'Private EV',
  },
];

type ModalStage = 'confirming' | 'searching' | 'assigned';
const FUNDING_PRESETS = [1.0, 5.0, 10.0, 20.0];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [pickup, setPickup] = useState(ESTATE_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState(ESTATE_LOCATIONS[3]);
  const [serviceType, setServiceType] = useState<'shuttle' | 'private'>('shuttle');

  // Active Dispatch State
  const [activeModalOpen, setActiveModalOpen] = useState(false);
  const { onlineCount } = useDriverPresence('resident');
  const [modalStage, setModalStage] = useState<ModalStage>('confirming');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<AssignedDriverInfo | null>(null);
  const rideChannelRef = useRef<RealtimeChannel | null>(null);

  // Add Funds State
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(5.0);
  const [customFundAmount, setCustomFundAmount] = useState<string>('');
  const [isProcessingFunding, setIsProcessingFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);

  const numericFare = serviceType === 'shuttle' ? 0.9 : 4.6;
  const tripFareFormatted = `${numericFare.toFixed(1)} hp`;
  const hasSufficientBalance = (profile?.wallet_balance ?? 0) >= numericFare;

  useEffect(() => {
    return () => {
      if (rideChannelRef.current) supabase.removeChannel(rideChannelRef.current);
    };
  }, []);

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
            full_name: user.user_metadata?.full_name || 'Resident',
            wallet_balance: 2.8,
          });
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error loading dashboard profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [router]);

  const handleOpenBookingSummary = () => {
    if (pickup === dropoff) {
      alert('Pickup and drop-off cannot be the same point.');
      return;
    }
    setModalStage('confirming');
    setActiveModalOpen(true);
  };

  const handleConfirmAndPay = async () => {
    if (!hasSufficientBalance || !profile) return;
    setIsProcessingPayment(true);
    try {
      const updatedBalance = (profile.wallet_balance ?? 0) - numericFare;
      await supabase.from('profiles').update({ wallet_balance: updatedBalance }).eq('id', profile.id);
      setProfile((prev) => (prev ? { ...prev, wallet_balance: updatedBalance } : null));

      const { data: newRide, error: rideError } = await supabase
        .from('rides')
        .insert({
          passenger_id: profile.id,
          passenger_name: profile.full_name || 'Resident',
          pickup,
          dropoff,
          fare: numericFare,
          service_type: serviceType,
          status: 'pending',
        })
        .select().single();

      if (rideError || !newRide) throw new Error(rideError?.message || 'Dispatch failed.');

      setActiveRideId(newRide.id);
      setModalStage('searching');
      setIsProcessingPayment(false);

      if (rideChannelRef.current) supabase.removeChannel(rideChannelRef.current);
      const channel = supabase.channel(`ride_status_${newRide.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${newRide.id}` },
        (payload) => {
          const updated = payload.new as any;
          if (updated.status === 'accepted') {
            setAssignedDriver({
              name: updated.driver_name || 'Assigned Driver',
              phone: '+234 800 000 0000',
              cabNumber: updated.cab_number || 'EV Unit #04',
              securityPin: updated.security_pin || '4821',
              eta: '3 Mins',
            });
            setModalStage('assigned');
          } else if (updated.status === 'canceled') {
            alert('Ride was canceled.');
            handleCancelTrip();
          }
        }).subscribe();
      rideChannelRef.current = channel;
    } catch (error) {
      console.error('Dispatch failure:', error);
      setIsProcessingPayment(false);
      alert('Dispatch failed. Please try again.');
    }
  };

  const handleCancelTrip = async () => {
    if (activeRideId && modalStage === 'searching') {
      await supabase.from('rides').update({ status: 'canceled' }).eq('id', activeRideId);
      if (profile?.id) {
        const refunded = (profile.wallet_balance ?? 0) + numericFare;
        await supabase.from('profiles').update({ wallet_balance: refunded }).eq('id', profile.id);
        setProfile((prev) => (prev ? { ...prev, wallet_balance: refunded } : null));
      }
    }
    if (rideChannelRef.current) {
      supabase.removeChannel(rideChannelRef.current);
      rideChannelRef.current = null;
    }
    setActiveRideId(null);
    setActiveModalOpen(false);
    setModalStage('confirming');
    setIsProcessingPayment(false);
    setAssignedDriver(null);
  };

  const handleInitiateAddFunds = async () => {
    const finalAmount = customFundAmount ? Number(customFundAmount) : fundAmount;
    if (!finalAmount || finalAmount < 0.1) {
      setFundingError('Minimum top-up is 0.1 hp');
      return;
    }
    setIsProcessingFunding(true);
    try {
      const res = await fetch('/api/funds/bachs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount * 537.5, email: profile?.email, userId: profile?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gateway error');
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setFundingError(err.message);
      setIsProcessingFunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const effectiveFundingAmount = customFundAmount ? Number(customFundAmount) : fundAmount;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-10">

      {/* ── Top Level Context & Navigation ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
              <Zap className="w-3 h-3 fill-current" />
              {onlineCount} {onlineCount === 1 ? 'Driver' : 'Drivers'} Available
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-500">Golf Estate Sector 1</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm self-start md:self-auto">
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Wallet Balance</p>
            <p className="text-2xl font-black text-slate-900 leading-none">
              {profile?.wallet_balance.toFixed(1)} <span className="text-sm font-bold text-slate-400">hp</span>
            </p>
          </div>
          <button
            onClick={() => setIsAddFundsOpen(true)}
            className="h-12 w-12 flex items-center justify-center bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition shadow-lg shadow-teal-900/10 active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* ── Main Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Booking Terminal */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Book Estate Transit</h2>
              <p className="text-xs text-slate-500">Zero-emission electric vehicle dispatch</p>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setServiceType('shuttle')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  serviceType === 'shuttle' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shuttle
              </button>
              <button
                onClick={() => setServiceType('private')}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  serviceType === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Private EV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pickup Coordinate</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 z-10" />
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full h-14 pl-12 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-teal-500 transition-all appearance-none cursor-pointer"
                >
                  {ESTATE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Drop-off Destination</label>
              <div className="relative group">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 z-10" />
                <select
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full h-14 pl-12 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-orange-500 transition-all appearance-none cursor-pointer"
                >
                  {ESTATE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenBookingSummary}
            className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-3 transition group active:scale-[0.99] shadow-xl shadow-slate-900/10"
          >
            <span className="font-bold tracking-tight">Confirm Ride</span>
            <span className="h-6 w-px bg-white/20" />
            <span className="font-black text-teal-400">{tripFareFormatted}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Recent Activity */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative border border-slate-800">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold tracking-tight">Recent Intra-Estate Activity</h3>
                </div>
                <button onClick={() => router.push('/dashboard/history')} className="text-[10px] font-bold text-slate-400 hover:text-white transition uppercase tracking-widest">View All</button>
              </div>

              <div className="space-y-3">
                {RECENT_TRIPS_MOCK.map((trip) => (
                  <div key={trip.id} className="group p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition cursor-default">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-[11px] font-bold truncate leading-none">{trip.pickup} → {trip.dropoff}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{trip.type} • {trip.date}</p>
                      </div>
                      <span className="text-xs font-black text-teal-400 shrink-0">{trip.fare}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual Fluff */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Support Widget */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 leading-none">Security Verified Transit</p>
                <p className="text-[10px] text-slate-500 font-medium">Pre-cleared barrier access</p>
              </div>
            </div>
            <button className="text-[10px] font-bold text-slate-400 hover:text-teal-600 transition uppercase tracking-widest">Help</button>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* 1. Add Funds Modal */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Fund Transit Credits</h3>
                  <p className="text-xs text-slate-500 font-medium">Credits are used for intra-estate electric vehicle fares.</p>
                </div>
                <button onClick={() => setIsAddFundsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {FUNDING_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => { setFundAmount(preset); setCustomFundAmount(''); }}
                      className={`h-16 rounded-2xl flex flex-col items-center justify-center transition border-2 ${
                        effectiveFundingAmount === preset && !customFundAmount
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md'
                          : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-sm font-black">{preset.toFixed(1)} hp</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">₦{(preset * 537.5).toLocaleString()} NGN</span>
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <Plus className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="Custom hp amount..."
                    value={customFundAmount}
                    onChange={(e) => setCustomFundAmount(e.target.value)}
                    className="w-full h-14 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 outline-none focus:bg-white focus:border-teal-500 transition-all"
                  />
                </div>

                {fundingError && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-bold text-rose-600 flex items-center gap-2 animate-shake"><AlertCircle className="w-4 h-4 shrink-0" /><span>{fundingError}</span></div>}

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">Total Payable</span>
                  </div>
                  <span className="text-lg font-black text-teal-400">₦{(effectiveFundingAmount * 537.5).toLocaleString()}</span>
                </div>

                <button
                  disabled={isProcessingFunding}
                  onClick={handleInitiateAddFunds}
                  className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-teal-900/20"
                >
                  {isProcessingFunding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Pay with Bachs Secure</span><ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dispatch Terminal Modal */}
      {activeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-300">

            {/* Header Stage */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${modalStage === 'confirming' ? 'bg-amber-500' : 'bg-teal-500 animate-pulse'}`} />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  {modalStage === 'confirming' && 'Review Request'}
                  {modalStage === 'searching' && 'Dispatching Fleet'}
                  {modalStage === 'assigned' && 'Driver Dispatched'}
                </h3>
              </div>
              <button onClick={handleCancelTrip} className="p-2 rounded-full hover:bg-slate-100 transition"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="p-8 space-y-8">
              {/* STAGE 1: Review */}
              {modalStage === 'confirming' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="relative pl-6 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                      <div className="relative mb-6">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal-500 ring-4 ring-teal-50" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pickup</p>
                        <p className="text-sm font-black text-slate-900 leading-tight">{pickup}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-50" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Drop-off</p>
                        <p className="text-sm font-black text-slate-900 leading-tight">{dropoff}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Fare</p>
                      <p className="text-2xl font-black text-slate-900 leading-none">{tripFareFormatted}</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-tighter italic">FastPass Auth</div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm"><CreditCard className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">In-App Credits</p>
                       <p className="text-[10px] text-slate-500 font-medium italic">Balance: {profile?.wallet_balance.toFixed(1)} hp</p>
                    </div>
                    {!hasSufficientBalance && <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg uppercase tracking-tighter">Low Funds</span>}
                  </div>

                  {!hasSufficientBalance ? (
                    <button onClick={() => { setActiveModalOpen(false); setIsAddFundsOpen(true); }} className="w-full h-16 bg-slate-100 text-slate-900 rounded-2xl font-black transition hover:bg-slate-200 active:scale-[0.99] flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> Top Up Wallet to Continue
                    </button>
                  ) : (
                    <button
                      disabled={isProcessingPayment}
                      onClick={handleConfirmAndPay}
                      className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black transition active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl shadow-teal-900/20"
                    >
                      {isProcessingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Pay & Request Fleet</span><ArrowRight className="w-5 h-5" /></>}
                    </button>
                  )}
                </div>
              )}

              {/* STAGE 2: Searching */}
              {modalStage === 'searching' && (
                <div className="py-12 flex flex-col items-center text-center space-y-8">
                  <div className="relative h-24 w-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-50 border-t-teal-500 animate-spin" />
                    <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center text-teal-400">
                      <Car className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-black text-slate-900 tracking-tight">Broadcasting to Patrol Drivers...</p>
                    <p className="text-xs text-slate-500 font-medium max-w-[240px] mx-auto">Connecting your request to available electric vehicles in the estate sector.</p>
                  </div>
                  <button onClick={handleCancelTrip} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition">Cancel Request</button>
                </div>
              )}

              {/* STAGE 3: Assigned */}
              {modalStage === 'assigned' && assignedDriver && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-5 p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
                    <div className="w-16 h-16 rounded-2xl bg-teal-400 text-slate-900 flex items-center justify-center text-2xl font-black shadow-lg shadow-teal-400/20 relative z-10">
                      {assignedDriver.name.charAt(0)}
                    </div>
                    <div className="relative z-10 space-y-1">
                      <h4 className="text-xl font-black tracking-tight">{assignedDriver.name}</h4>
                      <p className="text-[11px] text-teal-400 font-bold uppercase tracking-widest leading-none">{assignedDriver.cabNumber}</p>
                    </div>
                    <div className="absolute top-0 right-0 p-6 opacity-20"><Zap className="w-16 h-16" /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-1 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ETA</p>
                      <p className="text-2xl font-black text-slate-900 leading-none">{assignedDriver.eta}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100 flex flex-col items-center gap-1 text-center">
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none">Gate PIN</p>
                      <p className="text-2xl font-black text-orange-600 font-mono tracking-widest leading-none">{assignedDriver.securityPin}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a href={`tel:${assignedDriver.phone}`} className="flex-1 h-16 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-2 font-black text-slate-900 hover:bg-slate-50 transition active:scale-[0.98]">
                      <Phone className="w-5 h-5 text-teal-600" /> Call Driver
                    </a>
                    <button onClick={() => router.push('/dashboard/rides')} className="flex-1 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 font-black hover:bg-black transition active:scale-[0.98]">
                      <Navigation className="w-5 h-5" /> Track Live
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
