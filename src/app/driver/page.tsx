'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useDriverPresence } from '@/hooks/useDriverPresence';
import { playDispatchChime, requestNotificationPermission, sendPushNotification } from '@/lib/notifications';
import {
  Wallet,
  MapPin,
  Navigation,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
  X,
  Power,
  Car,
  AlertCircle,
  Building2,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
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
  'Access Bank', 'GTBank', 'Zenith Bank', 'First Bank', 'UBA', 'Kuda Bank', 'Opay', 'Moniepoint', 'Stanbic IBTC',
];

const INITIAL_RECENT_RIDES = [
  { id: 'TRP-501', passenger: 'Dr. Alabo Briggs', pickup: 'Phase 1 Gate', dropoff: 'Clubhouse', date: '3:15 PM', payout: '0.9 hp', type: 'Shuttle' },
  { id: 'TRP-500', passenger: 'Grace Nwosu', pickup: 'Road 4 Residential', dropoff: 'Main Gate', date: '1:40 PM', payout: '4.7 hp', type: 'Private EV' },
];

export default function DriverDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Active Dispatch State
  const [activeTrip, setActiveTrip] = useState<ActiveTripRequest | null>(null);
  const [recentTrips, setRecentTrips] = useState(INITIAL_RECENT_RIDES);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Presence
  useDriverPresence('driver', {
    driverId: profile?.id,
    fullName: profile?.full_name || 'Fleet Driver',
    isOnline,
    badgeNumber: 'WNB-DRV-084',
    sector: 'Sector 1 (Phase 1 & Clubhouse)',
    cabNumber: 'EV Unit #04',
    battery: 82,
  });

  // Withdraw State
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }

        const { data: profileData } = await supabase.from('profiles').select('id, email, full_name, wallet_balance').eq('id', user.id).maybeSingle();
        if (profileData) {
          setProfile({ id: user.id, email: user.email || '', full_name: profileData.full_name || 'Fleet Driver', wallet_balance: Number(profileData.wallet_balance ?? 34.4) });
          setAccountName(profileData.full_name || 'Driver Account');
        } else {
          setProfile({ id: user.id, email: user.email || '', full_name: 'Fleet Driver', wallet_balance: 34.4 });
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadDriverData();
  }, [router]);

  useEffect(() => {
    if (!isOnline) {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
      return;
    }
    async function fetchPendingRide() {
      const { data } = await supabase.from('rides').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        const item = data[0];
        setActiveTrip({
          id: item.id, passengerName: item.passenger_name || 'Resident', passengerPhone: '+234 800 000 0000',
          pickup: item.pickup, dropoff: item.dropoff, fare: Number(item.fare),
          serviceType: item.service_type === 'private' ? 'Private EV' : 'Shuttle', distance: '1.2 km', status: 'incoming',
        });
      }
    }
    fetchPendingRide();
    const channel = supabase.channel('driver_dispatch_radar').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rides' }, (payload) => {
      const newOrder = payload.new as any;
      if (newOrder.status === 'pending') {
        setActiveTrip({
          id: newOrder.id, passengerName: newOrder.passenger_name || 'Resident', passengerPhone: '+234 800 000 0000',
          pickup: newOrder.pickup, dropoff: newOrder.dropoff, fare: Number(newOrder.fare),
          serviceType: newOrder.service_type === 'private' ? 'Private EV' : 'Shuttle', distance: '1.2 km', status: 'incoming',
        });
        // Incoming ride: audible chime + browser push so the driver is alerted
        // even when the cockpit tab is backgrounded.
        playDispatchChime();
        void sendPushNotification(
          'Incoming Ride Request',
          `${newOrder.passenger_name || 'A resident'} is requesting a ride. Open the cockpit to accept.`,
        );
      }
    }).subscribe();
    channelRef.current = channel;
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [isOnline]);

  const handleAcceptTrip = async () => {
    if (!activeTrip || !profile) return;
    try {
      const { error } = await supabase.from('rides').update({ status: 'accepted', driver_id: profile.id, driver_name: profile.full_name, cab_number: 'EV Unit #04' }).eq('id', activeTrip.id).eq('status', 'pending');
      if (error) { alert('Trip unavailable.'); setActiveTrip(null); return; }
      setActiveTrip({ ...activeTrip, status: 'accepted' });
    } catch (err) { alert('Accept failed.'); }
  };

  const handleUpdateTripStage = async (nextStage: 'arrived' | 'in_progress' | 'completed') => {
    if (!activeTrip || !profile) return;
    try {
      if (nextStage === 'completed') {
        const earnedFare = activeTrip.fare;
        const newBal = profile.wallet_balance + earnedFare;
        await supabase.from('rides').update({ status: 'completed' }).eq('id', activeTrip.id);
        await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', profile.id);
        setProfile({ ...profile, wallet_balance: newBal });
        setRecentTrips((prev) => [{ id: activeTrip.id, passenger: activeTrip.passengerName, pickup: activeTrip.pickup, dropoff: activeTrip.dropoff, date: 'Just now', payout: `${earnedFare.toFixed(1)} hp`, type: activeTrip.serviceType }, ...prev]);
        setActiveTrip(null);
      } else {
        await supabase.from('rides').update({ status: nextStage }).eq('id', activeTrip.id);
        setActiveTrip({ ...activeTrip, status: nextStage });
      }
    } catch (err) { alert('Update failed.'); }
  };

  const handleProcessWithdrawal = async () => {
    const amountNum = Number(withdrawAmount);
    if (!amountNum || amountNum < 1.0) { setWithdrawError('Min withdrawal 1.0 hp'); return; }
    if (amountNum > (profile?.wallet_balance ?? 0)) { setWithdrawError('Insufficient balance'); return; }
    setIsProcessingWithdraw(true);
    try {
      const newBal = (profile?.wallet_balance ?? 0) - amountNum;
      await supabase.from('profiles').update({ wallet_balance: newBal }).eq('id', profile?.id);
      setProfile((p) => p ? { ...p, wallet_balance: newBal } : null);
      setWithdrawSuccess(true);
      setTimeout(() => { setWithdrawSuccess(false); setIsWithdrawOpen(false); setWithdrawAmount(''); setIsProcessingWithdraw(false); }, 2000);
    } catch (err: any) { setWithdrawError(err.message); setIsProcessingWithdraw(false); }
  };

  const handleToggleOnline = async () => {
    if (isOnline) {
      setIsOnline(false);
      return;
    }
    // Going online: ask for notification permission (user gesture), then arm the cockpit.
    await requestNotificationPermission();
    setIsOnline(true);
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-10">

      {/* ── Header: Duty Status & Metrics ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${isOnline ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}`}>
                <Power className={`w-10 h-10 ${isOnline ? 'animate-pulse' : ''}`} />
             </div>
             <button
                onClick={handleToggleOnline}
                className={`absolute -bottom-2 -right-2 h-10 px-4 rounded-full font-black text-[10px] uppercase tracking-widest border-4 border-slate-50 transition-all ${isOnline ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}
             >
                {isOnline ? 'Off-Duty' : 'On-Duty'}
             </button>
          </div>
          <div className="space-y-1">
             <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{isOnline ? 'System Online' : 'System Paused'}</h1>
             <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fleet #04</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">82% Battery</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="px-6 py-1 border-r border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 text-center">Earnings</p>
              <p className="text-3xl font-black text-slate-900 leading-none">{profile?.wallet_balance.toFixed(1)} <span className="text-xs font-bold text-slate-400">hp</span></p>
           </div>
           <button
              onClick={() => setIsWithdrawOpen(true)}
              className="h-14 px-6 bg-slate-900 text-white rounded-2xl hover:bg-black transition active:scale-95 flex items-center gap-3"
           >
              <span className="text-xs font-black uppercase tracking-widest">Withdraw</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Active Dispatch Terminal ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <Activity className="w-5 h-5 text-teal-600" />
                   <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest">Live Dispatch Radar</h2>
                </div>
                {activeTrip && <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase italic animate-pulse">Request Active</span>}
             </div>

             <div className="p-8">
                {!activeTrip ? (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                         <Zap className="w-10 h-10" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-lg font-black text-slate-900 tracking-tight">No Incoming Requests</p>
                         <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto">
                            {isOnline ? 'Scanning Golf Estate for resident transit calls. Maintain Sector 1 patrol.' : 'Switch to On-Duty to begin receiving trip dispatches.'}
                         </p>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white">
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-teal-400 text-slate-900 flex items-center justify-center text-xl font-black">{activeTrip.passengerName.charAt(0)}</div>
                            <div className="space-y-0.5">
                               <h4 className="text-lg font-black tracking-tight">{activeTrip.passengerName}</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activeTrip.serviceType} • Sector 1</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Fare Payout</p>
                            <p className="text-2xl font-black text-teal-400 leading-none">{activeTrip.fare.toFixed(1)} hp</p>
                         </div>
                      </div>

                      <div className="relative pl-6 space-y-6 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                         <div className="relative">
                            <MapPin className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pickup Coordinate</p>
                            <p className="text-sm font-black text-slate-900 leading-tight">{activeTrip.pickup}</p>
                         </div>
                         <div className="relative">
                            <Navigation className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</p>
                            <p className="text-sm font-black text-slate-900 leading-tight">{activeTrip.dropoff}</p>
                         </div>
                      </div>

                      <div className="pt-4 space-y-3">
                         {activeTrip.status === 'incoming' && (
                            <div className="grid grid-cols-2 gap-3">
                               <button onClick={() => setActiveTrip(null)} className="h-16 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition">Decline</button>
                               <button onClick={handleAcceptTrip} className="h-16 rounded-2xl bg-teal-600 text-white font-black hover:bg-teal-700 transition shadow-xl shadow-teal-900/20">Accept Request</button>
                            </div>
                         )}
                         {activeTrip.status === 'accepted' && (
                            <button onClick={() => handleUpdateTripStage('arrived')} className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition shadow-xl shadow-orange-900/20">Arrived at Pickup</button>
                         )}
                         {activeTrip.status === 'arrived' && (
                            <button onClick={() => handleUpdateTripStage('in_progress')} className="w-full h-16 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition shadow-xl shadow-teal-900/20">Passenger Onboard • Start</button>
                         )}
                         {activeTrip.status === 'in_progress' && (
                            <button onClick={() => handleUpdateTripStage('completed')} className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Complete & Settle Fare</button>
                         )}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* ── Shift Manifest & History ── */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-slate-800">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Clock className="w-5 h-5 text-teal-400" />
                       <h3 className="text-sm font-black uppercase tracking-widest">Shift Log</h3>
                    </div>
                    <button onClick={() => router.push('/driver/history')} className="text-[10px] font-black text-slate-500 hover:text-white transition uppercase tracking-widest">Manifest</button>
                 </div>

                 <div className="space-y-4">
                    {recentTrips.map((trip) => (
                       <div key={trip.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition cursor-default">
                          <div className="flex justify-between items-start gap-4">
                             <div className="space-y-1">
                                <p className="text-xs font-black leading-none">{trip.pickup} → {trip.dropoff}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{trip.passenger} • {trip.date}</p>
                             </div>
                             <span className="text-sm font-black text-teal-400">{trip.payout}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
           </div>

           <div className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600"><ShieldCheck className="w-6 h-6" /></div>
                 <div>
                    <p className="text-xs font-black text-slate-900 leading-none">Security Verified Unit</p>
                    <p className="text-[10px] text-slate-500 font-medium">Auto-barrier clearance active</p>
                 </div>
              </div>
              <History className="w-5 h-5 text-slate-100" />
           </div>
        </div>
      </div>

      {/* ── Withdraw Modal ── */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Settlement Payout</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Convert hp credits to bank settlement.</p>
                </div>
                <button onClick={() => setIsWithdrawOpen(false)} className="p-2 rounded-full hover:bg-slate-100 transition"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              {withdrawSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl"><CheckCircle2 className="w-10 h-10" /></div>
                  <h4 className="text-xl font-black text-slate-900">Payout Scheduled</h4>
                  <p className="text-xs text-slate-500 max-w-[240px] mx-auto">Credit conversion to NGN queued for immediate bank settlement.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available to Settlement</span>
                     <span className="text-2xl font-black text-teal-400">{profile?.wallet_balance.toFixed(1)} hp</span>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">hp to Withdraw</label>
                        <input type="number" placeholder="1.0" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:border-teal-500 transition-all" />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Bank Destination</label>
                        <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none appearance-none cursor-pointer">{NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}</select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">NUBAN Number</label>
                        <input type="text" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g,''))} className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-teal-500 transition-all" />
                     </div>
                  </div>

                  {withdrawError && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] font-bold text-rose-600 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{withdrawError}</span></div>}

                  <button
                    disabled={isProcessingWithdraw || (profile?.wallet_balance ?? 0) < 1}
                    onClick={handleProcessWithdrawal}
                    className="w-full h-16 bg-teal-600 text-white rounded-2xl font-black hover:bg-teal-700 transition active:scale-[0.99] flex items-center justify-center gap-3 shadow-xl shadow-teal-900/20"
                  >
                    {isProcessingWithdraw ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Settle hp to Bank</span><ArrowDownLeft className="w-5 h-5" /></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
