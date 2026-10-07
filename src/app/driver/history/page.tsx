'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  DollarSign,
  Download,
  Building2,
  User,
} from 'lucide-react';

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

const SAMPLE_DRIVER_TRANSACTIONS: DriverTripTransaction[] = [
  {
    id: 'drv-tx-0',
    txHash: '0x84f9...Golf01b3',
    title: 'Estate Electric Shuttle',
    passengerName: 'Olamide Praise',
    pickup: 'Phase 1 Gatehouse',
    dropoff: 'Clubhouse & Sports Courts',
    date: 'In progress right now...',
    amount: '+ ₦500.00',
    subAmount: 'Trip In Progress',
    type: 'shuttle_fare',
    status: 'in_progress',
    barrierPassUsed: 'BARRIER-PASS-04 (Gate 1)',
    passengerPhone: '+234 810 555 0192',
    driverRating: 'Pending completion',
  },
  {
    id: 'drv-tx-1',
    txHash: '0x68b7...438aefd35',
    title: 'Private EV Direct Trip',
    passengerName: 'Dr. Alabo Briggs',
    pickup: 'Road 4 Residential Zone',
    dropoff: 'Golf Estate Main Gate',
    date: 'Today at 1:40 PM',
    amount: '+ ₦2,500.00',
    subAmount: 'Fare Credited',
    type: 'private_fare',
    status: 'settled',
    barrierPassUsed: 'BARRIER-PASS-04 (Main Gate)',
    passengerPhone: '+234 803 111 2233',
    driverRating: '5.0 ★ (Fast pickup)',
  },
  {
    id: 'drv-tx-2',
    txHash: '0xfa39...bb20184aa',
    title: 'Bank Settlement Payout',
    passengerName: 'Settlement Transfer',
    pickup: 'Driver Wallet',
    dropoff: 'Access Bank •• 4912',
    date: 'Yesterday at 5:30 PM',
    amount: '- ₦15,000.00',
    subAmount: 'Paid to Bank',
    type: 'settlement_payout',
    status: 'settled',
    barrierPassUsed: 'NUBAN Settlement',
  },
  {
    id: 'drv-tx-3',
    txHash: '0x12a9...99a0134bc',
    title: 'Estate Electric Shuttle',
    passengerName: 'Grace Nwosu',
    pickup: 'Peter Odili Exit Link',
    dropoff: 'Sports Pavilion & Tennis Court',
    date: 'Yesterday at 11:20 AM',
    amount: '+ ₦500.00',
    subAmount: 'Fare Credited',
    type: 'shuttle_fare',
    status: 'settled',
    barrierPassUsed: 'BARRIER-PASS-04 (Exit Link)',
    passengerPhone: '+234 802 999 4455',
    driverRating: '5.0 ★ (Smooth drive)',
  },
  {
    id: 'drv-tx-4',
    txHash: '0x99c4...ff82914ba',
    title: 'Estate Electric Shuttle',
    passengerName: 'Unassigned Passenger',
    pickup: 'Phase 2 Gatehouse',
    dropoff: 'Plot 14, Phase 2',
    date: '02 Oct at 3:15 PM',
    amount: '₦500.00',
    subAmount: 'Passenger No-Show',
    type: 'shuttle_fare',
    status: 'flagged',
    barrierPassUsed: 'Canceled at Gate',
  },
  {
    id: 'drv-tx-5',
    txHash: '0x33b8...1102948bb',
    title: 'Private EV Direct Trip',
    passengerName: 'Pastor Tari',
    pickup: 'Clubhouse Pavilion',
    dropoff: 'Phase 1 Gatehouse',
    date: '01 Oct at 6:45 PM',
    amount: '+ ₦2,500.00',
    subAmount: 'Fare Credited',
    type: 'private_fare',
    status: 'settled',
    barrierPassUsed: 'BARRIER-PASS-04 (Clubhouse)',
    passengerPhone: '+234 818 000 7711',
    driverRating: '5.0 ★',
  },
];

export default function DriverHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<DriverTripTransaction | null>(
    SAMPLE_DRIVER_TRANSACTIONS[0]
  );

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const inProgressTrips = SAMPLE_DRIVER_TRANSACTIONS.filter((t) => t.status === 'in_progress');
  const loggedTrips = SAMPLE_DRIVER_TRANSACTIONS.filter((t) => t.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Minimal Bar */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trip Manifest & Earnings Log</h1>
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
              onClick={() => alert('Golf Estate Driver Support & Security Desk: +234 800 000 0000')}
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
                          <p className="text-xs font-bold text-slate-900">{tx.title}</p>
                          <p className="text-[11px] text-teal-800 font-medium">
                            Passenger: {tx.passengerName} (in transit...)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-[#004B4F]">{tx.amount}</p>
                        <p className="text-[10px] text-slate-400">{tx.subAmount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Completed Historic Trips & Payouts */}
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
                          <p className="text-xs font-bold text-slate-900">{tx.title}</p>
                          
                          {/* Subtitle / Status Label */}
                          {tx.status === 'flagged' && (
                            <p className="text-[11px] font-semibold text-rose-600">Disputed / No-Show</p>
                          )}
                          {tx.status === 'canceled' && (
                            <p className="text-[11px] font-semibold text-slate-400">Canceled by Passenger</p>
                          )}
                          {tx.status === 'settled' && (
                            <p className="text-[11px] text-slate-500">
                              {tx.type === 'settlement_payout' ? 'Bank Settlement' : `Passenger: ${tx.passengerName}`} • {tx.date}
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
                        <p className="text-[10px] text-slate-400">{tx.subAmount}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Right Column: Manifest Receipt & Details Drawer ─────── */}
          {selectedTx && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedTx.type === 'settlement_payout' ? 'Bank Settlement Receipt' : 'Trip Manifest Voucher'}
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
                    <p><strong className="text-slate-400 font-normal">Pickup:</strong> {selectedTx.pickup}</p>
                    <p><strong className="text-slate-400 font-normal">Drop-off:</strong> {selectedTx.dropoff}</p>
                  </div>
                </div>

                {/* Passenger Credentials / Settlement Bank */}
                {selectedTx.type !== 'settlement_payout' ? (
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
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Settlement Bank Account:
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      {selectedTx.dropoff}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Direct NUBAN Electronic Transfer Completed
                    </p>
                  </div>
                )}

                {/* Security Barrier Authorization */}
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="truncate">{selectedTx.barrierPassUsed}</span>
                </div>

              </div>

              {/* Bottom Actions: View Cockpit & Report Audit */}
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
                  onClick={() => alert('Support ticket logged with Estate Security Desk.')}
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