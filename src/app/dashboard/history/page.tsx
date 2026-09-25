'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar, { DashboardTab } from '@/components/dashboard/Sidebar';
import {
  Car,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';

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

const SAMPLE_TRANSACTIONS: TripTransaction[] = [
  {
    id: 'tx-0',
    txHash: '0x84f9...gulf01b3',
    title: 'Estate Electric Shuttle',
    pickup: 'Phase 1 Gatehouse',
    dropoff: 'Clubhouse & Sports Courts',
    date: 'In transit right now...',
    amount: '₦500.00',
    subAmount: '- 500 NGN',
    type: 'shuttle',
    status: 'in_progress',
    cardUsed: '•• 8492 (Transit Wallet)',
    driverName: 'Emeka K.',
    cabNumber: 'Cab #01',
  },
  {
    id: 'tx-1',
    txHash: '0x68b7...438aefd35',
    title: 'Private EV Direct',
    pickup: 'Road 4 Residential Zone',
    dropoff: 'Gulf Estate Main Gate',
    date: 'Yesterday at 6:40 PM',
    amount: '₦2,500.00',
    subAmount: '- 2,500 NGN',
    type: 'private',
    status: 'completed',
    cardUsed: '•• 8492 (Transit Wallet)',
    driverName: 'David O.',
    cabNumber: 'Cab #02',
  },
  {
    id: 'tx-2',
    txHash: '0x12a9...99a0134bc',
    title: 'Wallet Auto-Topup',
    pickup: 'Paystack Gateway',
    dropoff: 'Transit Wallet Balance',
    date: '24 Sept at 10:15 AM',
    amount: '+ ₦10,000.00',
    subAmount: 'Top-up Success',
    type: 'wallet_fund',
    status: 'completed',
    cardUsed: 'Mastercard •• 3232',
  },
  {
    id: 'tx-3',
    txHash: '0x99c4...ff82914ba',
    title: 'Estate Electric Shuttle',
    pickup: 'Peter Odili Exit Link',
    dropoff: 'House 14, Phase 2',
    date: '23 Sept at 2:05 PM',
    amount: '₦500.00',
    subAmount: 'Dispatch Timeout',
    type: 'shuttle',
    status: 'failed',
    cardUsed: '•• 8492 (Transit Wallet)',
  },
  {
    id: 'tx-4',
    txHash: '0x55d1...7761019ca',
    title: 'Private EV Direct',
    pickup: 'Main Gate Visitors Bay',
    dropoff: 'Clubhouse Pavilion',
    date: '21 Sept at 8:12 PM',
    amount: '₦2,500.00',
    subAmount: 'Canceled by Resident',
    type: 'private',
    status: 'canceled',
    cardUsed: '•• 8492 (Transit Wallet)',
  },
  {
    id: 'tx-5',
    txHash: '0x33b8...1102948bb',
    title: 'Estate Electric Shuttle',
    pickup: 'Phase 2 Gatehouse',
    dropoff: 'Tennis Courts',
    date: '19 Sept at 4:30 PM',
    amount: '₦500.00',
    subAmount: '- 500 NGN',
    type: 'shuttle',
    status: 'completed',
    cardUsed: '•• 8492 (Transit Wallet)',
    driverName: 'Chinedu A.',
    cabNumber: 'Cab #03',
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('history');
  const [selectedTx, setSelectedTx] = useState<TripTransaction | null>(SAMPLE_TRANSACTIONS[0]);

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

  const pendingTransactions = SAMPLE_TRANSACTIONS.filter((t) => t.status === 'in_progress');
  const completedTransactions = SAMPLE_TRANSACTIONS.filter((t) => t.status !== 'in_progress');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
              onClick={() => alert('Top-up wallet')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Fund Wallet
            </button>
            <button
              title="Help & Support"
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
                          
                          {/* Subtitle / Status Label */}
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