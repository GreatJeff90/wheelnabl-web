'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar, { DashboardTab } from '@/components/dashboard/Sidebar';
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
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  wallet_balance: number;
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
    dropoff: 'Gulf Estate Main Gate',
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

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');

  // Form State
  const [pickup, setPickup] = useState(ESTATE_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState(ESTATE_LOCATIONS[3]);
  const [serviceType, setServiceType] = useState<'shuttle' | 'private'>('shuttle');

  // Active Dispatch & Payment Modal State
  const [activeModalOpen, setActiveModalOpen] = useState(false);
  const [modalStage, setModalStage] = useState<ModalStage>('confirming');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const numericFare = serviceType === 'shuttle' ? 500 : 2500;
  const tripFareFormatted = serviceType === 'shuttle' ? '₦500' : '₦2,500';
  const hasSufficientBalance = (profile?.wallet_balance ?? 0) >= numericFare;

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
            wallet_balance: 1500, // Demo starting balance
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

  // Step 1: Open Confirmation & Payment Drawer
  const handleOpenBookingSummary = () => {
    if (pickup === dropoff) {
      alert('Pickup and drop-off cannot be the same point in the estate.');
      return;
    }
    setModalStage('confirming');
    setActiveModalOpen(true);
  };

  // Step 2: Confirm, Deduct Wallet Balance & Dispatch Driver
  const handleConfirmAndPay = async () => {
    if (!hasSufficientBalance) {
      alert('Insufficient wallet balance. Please add funds to proceed.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Deduct balance locally (and update profile in state)
      const updatedBalance = (profile?.wallet_balance ?? 0) - numericFare;

      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ wallet_balance: updatedBalance })
          .eq('id', profile.id);
      }

      setProfile((prev) =>
        prev ? { ...prev, wallet_balance: updatedBalance } : null
      );

      // Transition to vehicle searching
      setModalStage('searching');

      // Driver assigned after brief dispatch simulation
      setTimeout(() => {
        setModalStage('assigned');
        setIsProcessingPayment(false);
      }, 3000);
    } catch (error) {
      console.error('Payment failure:', error);
      setIsProcessingPayment(false);
      alert('Could not complete ride payment. Please try again.');
    }
  };

  const handleCancelTrip = () => {
    setActiveModalOpen(false);
    setModalStage('confirming');
    setIsProcessingPayment(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* ── 1. Reusable Left Sidebar Component ────────────────────── */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── 2. Main Content Area ──────────────────────────────────── */}
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
              Auto-deducted for internal Gulf Estate trips
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert('Paystack funding gateway opens here')}
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
            <span>Proceed to Confirmation & Payment ({tripFareFormatted})</span>
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

      {/* ── 3. Unified Ride Confirmation & Dispatch Modal ─────────── */}
      {activeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${modalStage === 'confirming' ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <h3 className="text-sm font-bold text-slate-900">
                  {modalStage === 'confirming' && 'Confirm Ride & Pay'}
                  {modalStage === 'searching' && 'Locating Gulf Estate EV...'}
                  {modalStage === 'assigned' && 'Cab En Route • Paid'}
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
                      onClick={() => alert('Paystack funding gateway opens here')}
                      className="w-full bg-[#004B4F] text-white text-xs font-bold py-3.5 rounded-full shadow-md transition hover:bg-[#00383b]"
                    >
                      Top Up Wallet via Paystack
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
                        <span>Debiting Wallet & Booking...</span>
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

            {/* STAGE 2: Searching for Fleet EV */}
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
                    Payment confirmed. Dispatching EV...
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Connecting to nearest patrol vehicle at {pickup}...
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 3: Matched, Paid & Call Driver */}
            {modalStage === 'assigned' && (
              <div className="space-y-5">
                {/* Driver Info & Immediate Call Button */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#004B4F] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      EK
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Emeka K.</h4>
                      <p className="text-xs text-slate-500">Cab #03 • Zero-Emission EV</p>
                    </div>
                  </div>

                  {/* Call Driver Button */}
                  <a
                    href="tel:+2348000000000"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>

                {/* Verification PIN & ETA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                      ETA
                    </span>
                    <span className="text-lg font-black text-[#004B4F]">3 Mins</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                    <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block">
                      Security PIN
                    </span>
                    <span className="text-lg font-black text-slate-900 tracking-widest font-mono">
                      4821
                    </span>
                  </div>
                </div>

                {/* Paid Status & Gate Pass Confirmation */}
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

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancelTrip}
              className="w-full text-center text-xs font-semibold text-slate-400 hover:text-rose-500 py-1 transition cursor-pointer"
            >
              {modalStage === 'assigned' ? 'End / Dismiss Ride View' : 'Cancel Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}