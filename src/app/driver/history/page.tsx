'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  Car,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Inbox,
  ArrowRight,
} from 'lucide-react';

interface RideDbRow {
  id: string;
  passenger_id?: string;
  passenger_name: string | null;
  pickup: string;
  dropoff: string;
  fare: number | string;
  service_type: string;
  status: string;
  driver_id?: string | null;
  driver_name?: string | null;
  cab_number?: string | null;
  security_pin?: string | null;
  created_at?: string;
}

interface DriverTripTransaction {
  id: string;
  txHash: string;
  title: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  date: string;
  amount: string;
  subAmount: string;
  type: 'shuttle_fare' | 'private_fare' | 'settlement_payout';
  status: 'in_progress' | 'settled' | 'flagged' | 'canceled';
  barrierPassUsed: string;
  passengerPhone?: string;
  driverRating?: string;
}

export default function DriverHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<DriverTripTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<DriverTripTransaction | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Convert raw DB ride rows into manifest transactions
  const mapDbRowToTransaction = (row: RideDbRow): DriverTripTransaction => {
    const isPrivate = row.service_type === 'private';
    const isCompleted = row.status === 'completed';
    const isCanceled = row.status === 'canceled';

    let mappedStatus: 'in_progress' | 'settled' | 'flagged' | 'canceled' = 'in_progress';
    if (isCompleted) {
      mappedStatus = 'settled';
    } else if (isCanceled) {
      mappedStatus = 'canceled';
    }

    const formattedDate = row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent Run';

    return {
      id: row.id,
      txHash: `0x${row.id.replace(/-/g, '').slice(0, 4)}...${row.id.slice(-6)}`,
      title: isPrivate ? 'Private EV Direct Trip' : 'Estate Electric Shuttle',
      passengerName: row.passenger_name || 'Golf Resident',
      pickup: row.pickup,
      dropoff: row.dropoff,
      date: isCompleted ? formattedDate : 'In progress right now...',
      amount: `+ ₦${Number(row.fare).toLocaleString()}`,
      subAmount: isCompleted ? 'Fare Credited' : isCanceled ? 'Voided' : 'Trip In Progress',
      type: isPrivate ? 'private_fare' : 'shuttle_fare',
      status: mappedStatus,
      barrierPassUsed: `BARRIER-PASS-${row.cab_number ? row.cab_number.replace(/\D/g, '') : '04'} (Gate Clearance)`,
      passengerPhone: '+234 800 000 0000',
      driverRating: '5.0 ★ Verified',
    };
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/login');
          return;
        }

        setDriverId(user.id);

        // Fetch actual rides where the current driver was assigned
        const { data: dbRides, error: ridesError } = await supabase
          .from('rides')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (!ridesError && dbRides) {
          const parsed = (dbRides as RideDbRow[]).map(mapDbRowToTransaction);
          setTransactions(parsed);
          if (parsed.length > 0) {
            setSelectedTx(parsed[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching driver history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [router]);

  // Real-time synchronization for new and updated rides
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel('driver_history_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTx = mapDbRowToTransaction(payload.new as RideDbRow);
            setTransactions((prev) => [newTx, ...prev]);
            setSelectedTx(newTx);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbRowToTransaction(payload.new as RideDbRow);
            setTransactions((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t))
            );
            setSelectedTx((prev) => (prev?.id === updated.id ? updated : prev));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
            setSelectedTx((prev) => (prev?.id === deletedId ? null : prev));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [driverId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const inProgressTrips = transactions.filter((t) => t.status === 'in_progress');
  const loggedTrips = transactions.filter((t) => t.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Minimal Bar */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Trip Manifest & Earnings Log
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Golf Estate Fleet #04
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => router.push('/driver')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Dispatch Cockpit
            </button>
            <button
              onClick={() => router.push('/driver')}
              className="hover:text-[#004B4F] transition cursor-pointer text-[#004B4F] font-bold"
            >
              Withdraw Earnings
            </button>
            <button
              title="Security Dispatch Hotline"
              onClick={() =>
                alert('Golf Estate Driver Support & Security Desk: +234 800 000 0000')
              }
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body: Left Ledger + Right Details Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ── Left Column: Ledger Lists ──────────────────────────── */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
            {transactions.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                  <Inbox className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    No Trip Records Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have not completed any passenger runs yet. Accepted and settled trips will appear here automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/driver')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Go to Dispatch Cockpit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {/* 1. Active In-Progress Trip */}
                {inProgressTrips.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Active Dispatch Transit
                    </h2>

                    <div className="space-y-2">
                      {inProgressTrips.map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            selectedTx?.id === tx.id
                              ? 'bg-teal-50/70 border-teal-200'
                              : 'bg-teal-50/30 border-teal-100 hover:bg-teal-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#004B4F] text-white flex items-center justify-center shrink-0">
                              <Car className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {tx.title}
                              </p>
                              <p className="text-[11px] text-teal-800 font-medium">
                                Passenger: {tx.passengerName} (in transit...)
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-[#004B4F]">
                              {tx.amount}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {tx.subAmount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Completed Historic Trips & Payouts */}
                {loggedTrips.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Completed Runs & Settlements
                      </h2>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {loggedTrips.length} Entries
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {loggedTrips.map((tx) => {
                        const isSelected = selectedTx?.id === tx.id;

                        return (
                          <div
                            key={tx.id}
                            onClick={() => setSelectedTx(tx)}
                            className={`py-4 px-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-4 ${
                              isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                {tx.type === 'settlement_payout' ? (
                                  <ArrowDownLeft className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {tx.title}
                                </p>

                                {tx.status === 'flagged' && (
                                  <p className="text-[11px] font-semibold text-rose-600">
                                    Disputed / No-Show
                                  </p>
                                )}
                                {tx.status === 'canceled' && (
                                  <p className="text-[11px] font-semibold text-slate-400">
                                    Canceled by Passenger
                                  </p>
                                )}
                                {tx.status === 'settled' && (
                                  <p className="text-[11px] text-slate-500">
                                    Passenger: {tx.passengerName} • {tx.date}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-xs font-black ${
                                  tx.type === 'settlement_payout'
                                    ? 'text-slate-800'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {tx.amount}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {tx.subAmount}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Column: Manifest Receipt & Details Drawer ─────── */}
          {selectedTx && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedTx.type === 'settlement_payout'
                      ? 'Bank Settlement Receipt'
                      : 'Trip Manifest Voucher'}
                  </h3>
                  <button
                    onClick={() => setSelectedTx(null)}
                    aria-label="Close details"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Verification Hash */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    Manifest Hash ID:
                  </span>
                  <p className="text-xs font-mono font-medium text-[#004B4F] break-all mt-1">
                    {selectedTx.txHash}
                  </p>
                </div>

                {/* Receipt Status */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Settlement Status:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {selectedTx.status === 'in_progress' && (
                      <span className="text-xs font-semibold text-teal-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                        In-Transit with Passenger
                      </span>
                    )}
                    {selectedTx.status === 'settled' && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fare Credited to Driver Balance
                      </span>
                    )}
                    {selectedTx.status === 'flagged' && (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Under Gate Audit
                      </span>
                    )}
                    {selectedTx.status === 'canceled' && (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Trip Canceled
                      </span>
                    )}
                  </div>
                </div>

                {/* Net Earnings Calculation */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                    Net Driver Earnings
                  </span>
                  <p className="text-xl font-black text-[#004B4F] mt-0.5">
                    {selectedTx.amount}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    0% Commission • Subsidized by Golf Estate Transit Levy
                  </p>
                </div>

                {/* Route Information */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Estate Route Coordinates:
                  </span>
                  <div className="mt-1 text-xs text-slate-700 space-y-1">
                    <p>
                      <strong className="text-slate-400 font-normal">From:</strong>{' '}
                      {selectedTx.pickup}
                    </p>
                    <p>
                      <strong className="text-slate-400 font-normal">To:</strong>{' '}
                      {selectedTx.dropoff}
                    </p>
                  </div>
                </div>

                {/* Passenger Credentials */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Passenger Information:
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedTx.passengerName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Rating: {selectedTx.driverRating || '5.0 ★'}
                  </p>
                </div>

                {/* Security Barrier Authorization */}
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{selectedTx.barrierPassUsed}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => router.push('/driver')}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-full bg-[#004B4F] text-white hover:bg-[#00383b] transition cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Dispatch Cockpit</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert('Support ticket logged with Estate Security Desk.')
                  }
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Report Route or Barrier Dispute</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}