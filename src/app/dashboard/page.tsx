'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  Wallet,
  MapPin,
  Navigation,
  Clock,
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
  'Gulf Estate Main Gate',
  'Phase 1 Gatehouse',
  'Phase 2 Gatehouse',
  'Clubhouse & Recreation Center',
  'Sports Pavilion & Tennis Court',
  'Road 1 Residential Zone',
  'Road 4 Residential Zone',
  'Peter Odili Exit Link',
];

const RECENT_TRIPS = [
  {
    id: 'TRP-104',
    pickup: 'Phase 1 Gatehouse',
    dropoff: 'Clubhouse & Recreation Center',
    date: 'Today, 2:15 PM',
    fare: '₦500',
    type: 'Electric Shuttle',
  },
  {
    id: 'TRP-103',
    pickup: 'Road 4 Residential Zone',
    dropoff: 'Golf Estate Main Gate',
    date: 'Yesterday, 6:40 PM',
    fare: '₦2,500',
    type: 'Private EV',
  },
  {
    id: 'TRP-102',
    pickup: 'Peter Odili Exit Link',
    dropoff: 'Sports Pavilion & Tennis Court',
    date: '22 Sept 2026, 8:10 AM',
    fare: '₦500',
    type: 'Electric Shuttle',
  },
];

type ModalStage = 'confirming' | 'searching' | 'assigned';

const FUNDING_PRESETS = [500, 1000, 2500, 5000, 10000];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [pickup, setPickup] = useState(ESTATE_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState(ESTATE_LOCATIONS[3]);
  const [serviceType, setServiceType] = useState<'shuttle' | 'private'>('shuttle');

  // Active Dispatch & Realtime Ride Tracking State
  const [activeModalOpen, setActiveModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<ModalStage>('confirming');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<AssignedDriverInfo | null>(null);
  const rideChannelRef = useRef<RealtimeChannel | null>(null);

  // Add Funds Modal State (Bachs Integration)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState<number>(1000);
  const [customFundAmount, setCustomFundAmount] = useState<string>('');
  const [isProcessingFunding, setIsProcessingFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);

  const numericFare = serviceType === 'shuttle' ? 500 : 2500;
  const tripFareFormatted = serviceType === 'shuttle' ? '₦500' : '₦2,500';
  const hasSufficientBalance = (profile?.wallet_balance ?? 0) >= numericFare;

  // Cleanup Supabase Realtime channel subscription on unmount
  useEffect(() => {
    return () => {
      if (rideChannelRef.current) {
        supabase.removeChannel(rideChannelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

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
            wallet_balance: 1500,
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

  // Handle successful Bachs payment redirect and credit wallet in Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = new URLSearchParams(window.location.search);
    const paymentStatus = query.get('payment');
    const creditedAmount = query.get('amount');

    if (paymentStatus === 'success' && creditedAmount && profile) {
      const addedVal = Number(creditedAmount);
      const targetUserId = profile.id;
      const currentBalance = profile.wallet_balance ?? 0;
      const newBalance = currentBalance + addedVal;

      async function creditWallet() {
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', targetUserId);

        setProfile((prev) =>
          prev ? { ...prev, wallet_balance: newBalance } : null
        );

        window.history.replaceState({}, '', '/dashboard');
        alert(`Successfully funded wallet with ₦${addedVal.toLocaleString()} via Bachs!`);
      }

      creditWallet();
    }
  }, [profile]);

  // Step 1: Open Confirmation & Ride Payment Drawer
  const handleOpenBookingSummary = () => {
    if (pickup === dropoff) {
      alert('Pickup and drop-off cannot be the same point in the estate.');
      return;
    }
    setModalStage('confirming');
    setActiveModalOpen(true);
  };

  // Step 2: Confirm, Deduct Wallet Balance, Insert to 'rides' table & Listen for Driver Response
  const handleConfirmAndPay = async () => {
    if (!hasSufficientBalance) {
      alert('Insufficient wallet balance. Please add funds to proceed.');
      return;
    }

    if (!profile) return;

    setIsProcessingPayment(true);

    try {
      const updatedBalance = (profile.wallet_balance ?? 0) - numericFare;

      // 1. Debit Resident Wallet Balance
      await supabase
        .from('profiles')
        .update({ wallet_balance: updatedBalance })
        .eq('id', profile.id);

      setProfile((prev) => (prev ? { ...prev, wallet_balance: updatedBalance } : null));

      // 2. Insert into the 'rides' table with status 'pending'
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
        .select()
        .single();

      if (rideError || !newRide) {
        throw new Error(rideError?.message || 'Failed to dispatch ride to estate fleet.');
      }

      setActiveRideId(newRide.id);
      setModalStage('searching');
      setIsProcessingPayment(false);

      // 3. Remove existing channel if any
      if (rideChannelRef.current) {
        supabase.removeChannel(rideChannelRef.current);
      }

      // 4. Subscribe to Supabase Realtime channel for driver response
      const channel = supabase
        .channel(`ride_status_${newRide.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rides',
            filter: `id=eq.${newRide.id}`,
          },
          (payload) => {
            const updated = payload.new as {
              status: string;
              driver_name: string | null;
              cab_number: string | null;
              security_pin: string | null;
            };

            if (updated.status === 'accepted') {
              setAssignedDriver({
                name: updated.driver_name || 'Assigned Driver',
                phone: '+2348000000000',
                cabNumber: updated.cab_number || 'EV Cab #04',
                securityPin: updated.security_pin || '4821',
                eta: '3 Mins',
              });
              setModalStage('assigned');
            } else if (updated.status === 'canceled') {
              alert('Ride was canceled or declined by the driver.');
              handleCancelTrip();
            }
          }
        )
        .subscribe();

      rideChannelRef.current = channel;
    } catch (error) {
      console.error('Payment/Dispatch failure:', error);
      setIsProcessingPayment(false);
      alert('Could not complete ride booking. Please try again.');
    }
  };

  const handleCancelTrip = async () => {
    if (activeRideId && modalStage === 'searching') {
      // Mark ride as canceled in Supabase
      await supabase
        .from('rides')
        .update({ status: 'canceled' })
        .eq('id', activeRideId);

      // Refund the numeric fare if still searching
      if (profile?.id) {
        const refunded = (profile.wallet_balance ?? 0) + numericFare;
        await supabase
          .from('profiles')
          .update({ wallet_balance: refunded })
          .eq('id', profile.id);

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

  // Step 3: Trigger Bachs Gateway for Wallet Funding
  const handleInitiateAddFunds = async () => {
    const finalAmount = customFundAmount ? Number(customFundAmount) : fundAmount;

    if (!finalAmount || finalAmount < 100) {
      setFundingError('Minimum wallet top-up is ₦100');
      return;
    }

    setIsProcessingFunding(true);
    setFundingError(null);

    try {
      const res = await fetch('/api/funds/bachs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          email: profile?.email || 'resident@gulfestate.ng',
          userId: profile?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize Bachs payment session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from Bachs.');
      }
    } catch (err: unknown) {
      console.error('Add funds error:', err);
      setFundingError((err as Error).message || 'Could not connect to payment gateway. Try again.');
      setIsProcessingFunding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const effectiveFundingAmount = customFundAmount ? Number(customFundAmount) : fundAmount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
      {/* ── Main Content Area ──────────────────────────────────── */}
      <main className="flex-1 p-6 sm:p-10 max-w-4xl mx-auto space-y-8 overflow-y-auto">
        
        {/* Account Balance Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 flex items-center justify-between border border-slate-100 shadow-xl shadow-slate-200/50">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              Account Balance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-slate-900">
              ₦{(profile?.wallet_balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Auto-deducted for internal Golf Estate trips
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFundingError(null);
              setIsAddFundsOpen(true);
            }}
            className="flex items-center gap-2 bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold px-5 py-3 rounded-full transition shadow-md shadow-teal-950/10 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Funds</span>
          </button>
        </div>

        {/* Intra-Estate Booking Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Book Estate Ride</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatch an intra-estate electric vehicle to your coordinates
              </p>
            </div>

            {/* Ride Mode Selector */}
            <div className="inline-flex p-1 bg-slate-100 rounded-full self-start">
              <button
                type="button"
                onClick={() => setServiceType('shuttle')}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition cursor-pointer ${
                  serviceType === 'shuttle'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Shuttle (₦500)
              </button>
              <button
                type="button"
                onClick={() => setServiceType('private')}
                className={`text-xs font-bold px-4 py-1.5 rounded-full transition cursor-pointer ${
                  serviceType === 'private'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Private EV (₦2,500)
              </button>
            </div>
          </div>

          {/* Location Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#004B4F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-2xl pl-11 pr-10 py-3.5 outline-none focus:border-[#004B4F] focus:bg-white appearance-none cursor-pointer transition"
                >
                  {ESTATE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-white text-slate-800">
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                Drop-off Destination
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-[#FF7A00] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-2xl pl-11 pr-10 py-3.5 outline-none focus:border-[#FF7A00] focus:bg-white appearance-none cursor-pointer transition"
                >
                  {ESTATE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-white text-slate-800">
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenBookingSummary}
            className="w-full bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold py-3.5 rounded-full transition shadow-md shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Confirm Payment ({tripFareFormatted})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Rides */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Recent Rides</h3>
            </div>
            <span className="text-xs font-medium text-slate-400">Past activity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {RECENT_TRIPS.map((trip) => (
              <div key={trip.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>{trip.pickup}</span>
                    <span className="text-slate-300">→</span>
                    <span>{trip.dropoff}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {trip.type} • {trip.date}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#004B4F] shrink-0">
                  {trip.fare}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push('/dashboard/history')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition py-2 px-5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              <span>See More</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </main>

      {/* ── 2. Bachs "Add Funds" Modal ──────────────────────────── */}
      {isAddFundsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-bold text-[#004B4F]">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Instant Top-Up</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1">
                  Fund Transit Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFundsOpen(false)}
                aria-label="Close add funds"
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Select Preset Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FUNDING_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setFundAmount(preset);
                        setCustomFundAmount('');
                      }}
                      className={`py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                        effectiveFundingAmount === preset && !customFundAmount
                          ? 'bg-[#004B4F] text-white shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Or Custom Amount (₦)
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-[#004B4F] focus-within:bg-white transition">
                  <span className="text-slate-400 font-bold text-sm mr-2">₦</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    placeholder="e.g. 3500"
                    value={customFundAmount}
                    onChange={(e) => setCustomFundAmount(e.target.value)}
                    className="bg-transparent outline-none w-full text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>

              {fundingError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fundingError}</span>
                </div>
              )}

              {/* Supported Rails Notice */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#004B4F]" />
                  <span>Powered by Bachs Gateway</span>
                </div>
                <span className="font-bold text-slate-700">Cards & Transfers</span>
              </div>

              {/* Submit */}
              <button
                type="button"
                disabled={isProcessingFunding}
                onClick={handleInitiateAddFunds}
                className="w-full bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold py-3.5 rounded-full transition shadow-md shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingFunding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Bachs...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₦{effectiveFundingAmount.toLocaleString()} with Bachs</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Unified Ride Confirmation & Real-time Dispatch Modal ─── */}
      {activeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${modalStage === 'confirming' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalStage === 'confirming' && 'Confirm Ride & Pay'}
                  {modalStage === 'searching' && 'Broadcasting to Estate Drivers...'}
                  {modalStage === 'assigned' && 'Driver Assigned • On Route'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelTrip}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STAGE 1: Confirm Ride & Debit Wallet */}
            {modalStage === 'confirming' && (
              <div className="space-y-5">
                <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Service</span>
                    <span className="font-bold text-slate-900">{serviceType === 'shuttle' ? 'Estate Shuttle' : 'Private EV'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pickup:</span>
                    <span className="font-semibold text-slate-800 text-right">{pickup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-slate-800 text-right">{dropoff}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200/60 text-sm">
                    <span className="font-bold text-slate-800">Total Fare:</span>
                    <span className="font-extrabold text-[#004B4F]">{tripFareFormatted}</span>
                  </div>
                </div>

                {/* Wallet Payment Method Verification */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-[#004B4F] shadow-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">In-App Transit Wallet</p>
                      <p className="text-[11px] text-slate-500">
                        Available Balance: ₦{(profile?.wallet_balance ?? 0).toLocaleString('en-NG')}
                      </p>
                    </div>
                  </div>
                  {hasSufficientBalance ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      Low Balance
                    </span>
                  )}
                </div>

                {!hasSufficientBalance ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-rose-600 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>You need at least {tripFareFormatted} to book this ride.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalOpen(false);
                        setIsAddFundsOpen(true);
                      }}
                      className="w-full bg-[#004B4F] text-white text-xs font-bold py-3.5 rounded-full shadow-md transition hover:bg-[#00383b] cursor-pointer"
                    >
                      Top Up Wallet via Bachs
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleConfirmAndPay}
                    className="w-full bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold py-3.5 rounded-full transition shadow-md shadow-orange-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Debiting Wallet & Notifying Fleet...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Pay {tripFareFormatted}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* STAGE 2: Searching for Fleet EV via Realtime Channel */}
            {modalStage === 'searching' && (
              <div className="py-8 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-75" />
                  <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center relative z-10 text-[#004B4F]">
                    <Zap className="w-7 h-7" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Payment confirmed. Waiting for driver response...
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Dispatched to active patrol drivers in Golf Estate. Your screen will update the moment a driver accepts.
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 3: Matched & Driver Responded in Realtime */}
            {modalStage === 'assigned' && assignedDriver && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#004B4F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {assignedDriver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{assignedDriver.name}</h4>
                      <p className="text-xs text-slate-500">{assignedDriver.cabNumber} • Zero-Emission EV</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${assignedDriver.phone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                      ETA
                    </span>
                    <span className="text-lg font-black text-[#004B4F]">{assignedDriver.eta}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                    <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block">
                      Security PIN
                    </span>
                    <span className="text-lg font-black text-slate-900 tracking-widest font-mono">
                      {assignedDriver.securityPin}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {tripFareFormatted} Paid
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Gatehouse barrier clearance pre-authorized</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel / Dismiss Button */}
            <button
              type="button"
              onClick={handleCancelTrip}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-rose-500 py-1 transition cursor-pointer"
            >
              {modalStage === 'assigned' ? 'Dismiss / Close View' : 'Cancel Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}