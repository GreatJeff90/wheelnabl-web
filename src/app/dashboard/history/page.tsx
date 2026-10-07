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
  XCircle,
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

interface TripTransaction {
  id: string;
  txHash: string;
  title: string;
  pickup: string;
  dropoff: string;
  date: string;
  amount: string;
  subAmount: string;
  type: 'shuttle' | 'private' | 'wallet_fund';
  status: 'in_progress' | 'completed' | 'failed' | 'canceled';
  cardUsed: string;
  driverName?: string;
  cabNumber?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TripTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<TripTransaction | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const mapDbRowToTransaction = (row: RideDbRow): TripTransaction => {
    const isPrivate = row.service_type === 'private';
    let mappedStatus: 'in_progress' | 'completed' | 'failed' | 'canceled' = 'in_progress';

    if (row.status === 'completed') {
      mappedStatus = 'completed';
    } else if (row.status === 'canceled') {
      mappedStatus = 'canceled';
    } else if (row.status === 'failed') {
      mappedStatus = 'failed';
    } else {
      mappedStatus = 'in_progress';
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
      title: isPrivate ? 'Private EV Direct' : 'Estate Electric Shuttle',
      pickup: row.pickup,
      dropoff: row.dropoff,
      date: mappedStatus === 'in_progress' ? 'In transit right now...' : formattedDate,
      amount: `₦${Number(row.fare).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      subAmount: `- ${Number(row.fare).toLocaleString()} NGN`,
      type: isPrivate ? 'private' : 'shuttle',
      status: mappedStatus,
      cardUsed: '•• Transit Wallet Balance',
      driverName: row.driver_name || (row.status === 'pending' ? 'Dispatching...' : 'Patrol Fleet'),
      cabNumber: row.cab_number || 'EV Unit',
    };
  };

  useEffect(() => {
    async function checkAuthAndLoadRides() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/login');
          return;
        }

        setUserId(user.id);

        const { data: dbRides, error: ridesError } = await supabase
          .from('rides')
          .select('*')
          .eq('passenger_id', user.id)
          .order('created_at', { ascending: false });

        if (!ridesError && dbRides) {
          const parsed = (dbRides as RideDbRow[]).map(mapDbRowToTransaction);
          setTransactions(parsed);
          if (parsed.length > 0) {
            setSelectedTx(parsed[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load user ride history:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadRides();
  }, [router]);

  // Real-time synchronization for new and updated rides
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('resident_history_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rides',
          filter: `passenger_id=eq.${userId}`,
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
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const pendingTransactions = transactions.filter((t) => t.status === 'in_progress');
  const completedTransactions = transactions.filter((t) => t.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Minimal Bar */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">History</h1>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Book Ride
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Fund Wallet
            </button>
            <button
              title="Help & Support"
              onClick={() => alert('Golf Estate Transit Support Desk: +234 800 000 0000')}
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
                    No Trip History Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have not taken any intra-estate trips yet. Book your first intra-estate shuttle or private EV on the dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Book Ride Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                {/* 1. Pending Execution / Active Transit */}
                {pendingTransactions.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Pending execution
                    </h2>

                    <div className="space-y-2">
                      {pendingTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            selectedTx?.id === tx.id
                              ? 'bg-purple-50/60 border-purple-200'
                              : 'bg-purple-50/30 border-purple-100 hover:bg-purple-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                              <Car className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{tx.title}</p>
                              <p className="text-[11px] text-purple-700 font-medium">in process...</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black text-purple-900">{tx.amount}</p>
                            <p className="text-[10px] text-slate-400">{tx.subAmount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Completed / Historic Entries */}
                {completedTransactions.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Completed
                    </h2>

                    <div className="divide-y divide-slate-100">
                      {completedTransactions.map((tx) => {
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
                                {tx.type === 'wallet_fund' ? (
                                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-slate-500" />
                                )}
                              </div>

                              <div>
                                <p className="text-xs font-bold text-slate-900">{tx.title}</p>

                                {tx.status === 'failed' && (
                                  <p className="text-[11px] font-semibold text-rose-600">Failed</p>
                                )}
                                {tx.status === 'canceled' && (
                                  <p className="text-[11px] font-semibold text-slate-400">Canceled</p>
                                )}
                                {tx.status === 'completed' && (
                                  <p className="text-[11px] text-slate-400">{tx.date}</p>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-xs font-black ${
                                  tx.type === 'wallet_fund' ? 'text-emerald-600' : 'text-slate-900'
                                }`}
                              >
                                {tx.amount}
                              </p>
                              <p className="text-[10px] text-slate-400">{tx.subAmount}</p>
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

          {/* ── Right Column: Receipt & Transaction Details Drawer ─── */}
          {selectedTx && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedTx.type === 'wallet_fund' ? 'Top-up Details' : 'Ride Details'}
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
                    TxHash:
                  </span>
                  <p className="text-xs font-mono font-medium text-purple-600 break-all mt-1">
                    {selectedTx.txHash}
                  </p>
                </div>

                {/* Receipt Status */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    TxReceipt Status:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {selectedTx.status === 'in_progress' && (
                      <span className="text-xs font-semibold text-purple-700">
                        Pending execution
                      </span>
                    )}
                    {selectedTx.status === 'completed' && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled & Cleared
                      </span>
                    )}
                    {selectedTx.status === 'failed' && (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Dispatch Timeout
                      </span>
                    )}
                    {selectedTx.status === 'canceled' && (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Voided by User
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment Source */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Debited Account:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {selectedTx.cardUsed}
                  </p>
                </div>

                {/* Route Information */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Estate Route:
                  </span>
                  <div className="mt-1 text-xs text-slate-700 space-y-1">
                    <p><strong className="text-slate-400 font-normal">From:</strong> {selectedTx.pickup}</p>
                    <p><strong className="text-slate-400 font-normal">To:</strong> {selectedTx.dropoff}</p>
                  </div>
                </div>

                {/* Driver / Cab Allocation */}
                {selectedTx.driverName && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Assigned Fleet:
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {selectedTx.driverName} ({selectedTx.cabNumber})
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions: Repeat & Dispute */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Book This Route Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert('Support ticket raised for this transaction reference.')}
                  className="w-full flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Report Dispute / Issue</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}