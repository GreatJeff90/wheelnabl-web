'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Wallet,
  MapPin,
  Navigation,
  Clock,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Phone,
  ShieldCheck,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  Check,
  Power,
  User,
  Car,
} from 'lucide-react';

interface DriverProfile {
  id: string;
  email: string;
  full_name: string | null;
  wallet_balance: number;
}

interface ActiveTripRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: string;
  dropoff: string;
  fare: number;
  serviceType: 'Shuttle' | 'Private EV';
  distance: string;
  status: 'incoming' | 'accepted' | 'arrived' | 'in_progress';
}

const NIGERIAN_BANKS = [
  'Access Bank',
  'GTBank (Guaranty Trust Bank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'UBA (United Bank for Africa)',
  'Kuda Bank',
  'Opay',
  'Moniepoint',
  'Stanbic IBTC Bank',
];

const INITIAL_RECENT_RIDES = [
  {
    id: 'TRP-501',
    passenger: 'Dr. Alabo Briggs',
    pickup: 'Phase 1 Gatehouse',
    dropoff: 'Clubhouse & Recreation Center',
    date: 'Today, 3:15 PM',
    payout: '₦500',
    type: 'Shuttle',
  },
  {
    id: 'TRP-500',
    passenger: 'Grace Nwosu',
    pickup: 'Road 4 Residential Zone',
    dropoff: 'Gulf Estate Main Gate',
    date: 'Today, 1:40 PM',
    payout: '₦2,500',
    type: 'Private EV',
  },
  {
    id: 'TRP-499',
    passenger: 'Pastor Tari',
    pickup: 'Peter Odili Exit Link',
    dropoff: 'Sports Pavilion & Tennis Court',
    date: 'Today, 11:20 AM',
    payout: '₦500',
    type: 'Shuttle',
  },
];

export default function DriverDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Active Dispatch State
  const [activeTrip, setActiveTrip] = useState<ActiveTripRequest | null>({
    id: 'REQ-884',
    passengerName: 'Olamide Praise',
    passengerPhone: '+234 810 555 0192',
    pickup: 'Phase 2 Gatehouse',
    dropoff: 'Golf Estate Clubhouse',
    fare: 2500,
    serviceType: 'Private EV',
    distance: '1.2 km',
    status: 'incoming',
  });

  const [recentTrips, setRecentTrips] = useState(INITIAL_RECENT_RIDES);

  // Withdraw Modal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    async function loadDriverData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/login');
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name, wallet_balance')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: profileData.full_name || user.user_metadata?.full_name || 'Fleet Driver 01',
            wallet_balance: Number(profileData.wallet_balance ?? 18500),
          });
          setAccountName(profileData.full_name || user.user_metadata?.full_name || 'Driver Account');
        } else {
          setProfile({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'Fleet Driver 01',
            wallet_balance: 18500,
          });
        }
      } catch (err) {
        console.error('Error loading driver profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDriverData();
  }, [router]);

  // Trip Workflow Handlers
  const handleAcceptTrip = () => {
    if (!activeTrip) return;
    setActiveTrip({ ...activeTrip, status: 'accepted' });
  };

  const handleDeclineTrip = () => {
    setActiveTrip(null);
  };

  const handleUpdateTripStage = async (nextStage: 'arrived' | 'in_progress' | 'completed') => {
    if (!activeTrip) return;

    if (nextStage === 'completed') {
      const earnedFare = activeTrip.fare;
      const newBal = (profile?.wallet_balance ?? 0) + earnedFare;

      // Persist to Supabase if authenticated
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBal })
          .eq('id', profile.id);
      }

      setProfile((prev) => (prev ? { ...prev, wallet_balance: newBal } : null));

      setRecentTrips((prev) => [
        {
          id: activeTrip.id,
          passenger: activeTrip.passengerName,
          pickup: activeTrip.pickup,
          dropoff: activeTrip.dropoff,
          date: 'Just now',
          payout: `₦${earnedFare.toLocaleString()}`,
          type: activeTrip.serviceType,
        },
        ...prev,
      ]);

      setActiveTrip(null);
      alert(`Trip completed! ₦${earnedFare.toLocaleString()} credited to your balance.`);
    } else {
      setActiveTrip({ ...activeTrip, status: nextStage });
    }
  };

  // Withdraw Handler
  const handleProcessWithdrawal = async () => {
    const amountNum = Number(withdrawAmount);
    setWithdrawError(null);

    const currentBal = profile?.wallet_balance ?? 0;

    if (!amountNum || amountNum < 500) {
      setWithdrawError('Minimum withdrawal amount is ₦500');
      return;
    }

    if (amountNum > currentBal) {
      setWithdrawError(`Insufficient earnings. Maximum withdrawable is ₦${currentBal.toLocaleString()}`);
      return;
    }

    if (!accountNumber || accountNumber.length < 10) {
      setWithdrawError('Please enter a valid 10-digit NUBAN account number');
      return;
    }

    setIsProcessingWithdraw(true);

    try {
      const newBalance = currentBal - amountNum;

      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({ wallet_balance: newBalance })
          .eq('id', profile.id);
      }

      setProfile((prev) => (prev ? { ...prev, wallet_balance: newBalance } : null));
      setWithdrawSuccess(true);

      setTimeout(() => {
        setWithdrawSuccess(false);
        setIsWithdrawOpen(false);
        setWithdrawAmount('');
        setAccountNumber('');
        setIsProcessingWithdraw(false);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Settlement payout failed';
      setWithdrawError(msg);
      setIsProcessingWithdraw(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDF0F8] text-slate-900 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      <main className="flex-1 p-6 sm:p-10 max-w-4xl mx-auto space-y-8 overflow-y-auto">
        
        {/* Top Duty Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isOnline ? 'You Are On-Duty • Receiving Estate Rides' : 'Offline • Duty Paused'}
              </h2>
              <p className="text-xs text-slate-500">
                Assigned Unit: Golf Estate EV Shuttle #04
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs transition cursor-pointer ${
              isOnline
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-[#004B4F] text-white hover:bg-[#00383b] shadow-sm'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>

        {/* Driver Account Balance Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-200/60 shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              Driver Earnings Balance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 text-slate-900">
              ₦{(profile?.wallet_balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span>Today&apos;s Runs: <strong className="text-slate-800">4 Completed</strong></span>
              <span>•</span>
              <span>Settlement: <strong className="text-emerald-700">Direct to Bank</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setWithdrawError(null);
              setIsWithdrawOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold px-6 py-3.5 rounded-full transition shadow-md shadow-teal-950/10 active:scale-95 cursor-pointer self-start sm:self-center"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
            <span>Withdraw Funds</span>
          </button>
        </div>

        {/* ── Active Ride Dispatch Card ────────────────────────── */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#004B4F]" />
              <h3 className="text-base font-bold text-slate-900">Active Trip Dispatch</h3>
            </div>
            {activeTrip && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {activeTrip.status.toUpperCase()}
              </span>
            )}
          </div>

          {!activeTrip ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Navigation className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Active Ride Requests</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Keep your status set to &quot;Online&quot; to automatically receive nearby resident bookings across Golf Estate.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Passenger & Fare Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#004B4F] text-white flex items-center justify-center font-black text-sm">
                    {activeTrip.passengerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeTrip.passengerName}</h4>
                    <p className="text-xs text-slate-500">Verified Golf Estate Resident • {activeTrip.distance}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fare Payout</span>
                    <span className="text-lg font-black text-[#004B4F]">₦{activeTrip.fare.toLocaleString()}</span>
                  </div>
                  <a
                    href={`tel:${activeTrip.passengerPhone}`}
                    className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Waypoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1">
                    Pickup Location
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <MapPin className="w-4 h-4 text-[#004B4F] shrink-0" />
                    <span>{activeTrip.pickup}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100">
                  <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block mb-1">
                    Destination
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <Navigation className="w-4 h-4 text-[#FF7A00] shrink-0" />
                    <span>{activeTrip.dropoff}</span>
                  </div>
                </div>
              </div>

              {/* State Dependent Actions */}
              {activeTrip.status === 'incoming' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDeclineTrip}
                    className="w-full py-3.5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptTrip}
                    className="w-full py-3.5 rounded-full bg-[#004B4F] hover:bg-[#00383b] text-white font-bold text-xs transition shadow-md shadow-teal-950/15 cursor-pointer"
                  >
                    Accept Trip (₦{activeTrip.fare.toLocaleString()})
                  </button>
                </div>
              )}

              {activeTrip.status === 'accepted' && (
                <button
                  type="button"
                  onClick={() => handleUpdateTripStage('arrived')}
                  className="w-full bg-[#FF7A00] hover:bg-[#e66e00] text-white font-bold text-xs py-3.5 rounded-full transition shadow-md shadow-orange-500/20 active:scale-[0.99] cursor-pointer"
                >
                  Arrived at Passenger Pickup
                </button>
              )}

              {activeTrip.status === 'arrived' && (
                <button
                  type="button"
                  onClick={() => handleUpdateTripStage('in_progress')}
                  className="w-full bg-[#004B4F] hover:bg-[#00383b] text-white font-bold text-xs py-3.5 rounded-full transition shadow-md shadow-teal-950/20 active:scale-[0.99] cursor-pointer"
                >
                  Passenger Onboard • Start Trip
                </button>
              )}

              {activeTrip.status === 'in_progress' && (
                <button
                  type="button"
                  onClick={() => handleUpdateTripStage('completed')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-full transition shadow-md shadow-emerald-600/25 active:scale-[0.99] cursor-pointer"
                >
                  Complete Trip & Collect ₦{activeTrip.fare.toLocaleString()}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Recent Rides Manifest ────────────────────────────── */}
        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="text-base font-bold text-slate-900">Recent Completed Trips</h3>
            </div>
            <span className="text-xs font-medium text-slate-400">Shift audit logs</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>{trip.pickup}</span>
                    <span className="text-slate-300">→</span>
                    <span>{trip.dropoff}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {trip.passenger} • {trip.type} • {trip.date}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-[#004B4F] shrink-0">
                  {trip.payout}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push('/driver/history')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition py-2 px-5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              <span>View Full Trip Manifest</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </main>

      {/* ── Withdraw Funds Modal ───────────────────────────────── */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-800">
                  <Building2 className="w-3 h-3 text-amber-600" />
                  <span>Driver Settlement</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 pt-1">
                  Withdraw Shift Earnings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Payout Processed!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  ₦{Number(withdrawAmount).toLocaleString()} has been queued for immediate settlement to your {selectedBank} account.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200/70 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-slate-500">Available to withdraw:</span>
                  <span className="font-extrabold text-slate-900">
                    ₦{(profile?.wallet_balance ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Amount to Withdraw (₦)
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-[#004B4F] focus-within:bg-white transition">
                    <span className="text-slate-400 font-bold text-sm mr-2">₦</span>
                    <input
                      type="number"
                      min="500"
                      max={profile?.wallet_balance ?? 0}
                      placeholder="e.g. 5000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-transparent outline-none w-full text-slate-900 font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(profile?.wallet_balance ?? 0))}
                      className="text-[10px] font-bold text-[#004B4F] bg-teal-50 px-2.5 py-1 rounded-md hover:bg-teal-100 transition cursor-pointer"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Destination Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white cursor-pointer transition"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Account Number (10 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Driver Account Name"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                  />
                </div>

                {withdrawError && (
                  <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessingWithdraw || (profile?.wallet_balance ?? 0) < 500}
                  onClick={handleProcessWithdrawal}
                  className="w-full bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold py-3.5 rounded-full transition shadow-md shadow-teal-950/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingWithdraw ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending to {selectedBank}...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm & Withdraw ₦{withdrawAmount ? Number(withdrawAmount).toLocaleString() : '0.00'}</span>
                      <ArrowDownLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}