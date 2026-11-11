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
  History,
  Search, MapPin, Navigation,
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

  const mapDbRowToTransaction = (row: RideDbRow): TripTransaction => {
    const isPrivate = row.service_type === 'private';
    let mappedStatus: TripTransaction['status'] = 'in_progress';
    if (row.status === 'completed') mappedStatus = 'completed';
    else if (row.status === 'canceled') mappedStatus = 'canceled';
    else if (row.status === 'failed') mappedStatus = 'failed';

    const formattedDate = row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent';

    return {
      id: row.id,
      txHash: `0x${row.id.replace(/-/g, '').slice(0, 4)}...${row.id.slice(-6)}`,
      title: isPrivate ? 'Private EV Direct' : 'Electric Shuttle',
      pickup: row.pickup,
      dropoff: row.dropoff,
      date: mappedStatus === 'in_progress' ? 'In transit...' : formattedDate,
      amount: `${Number(row.fare).toFixed(1)} hp`,
      subAmount: `- ${Number(row.fare).toFixed(1)} hp`,
      type: isPrivate ? 'private' : 'shuttle',
      status: mappedStatus,
      cardUsed: 'Transit Credits',
      driverName: row.driver_name || 'Fleet Operator',
      cabNumber: row.cab_number || 'EV Unit',
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }
        setUserId(user.id);
        const { data } = await supabase.from('rides').select('*').eq('passenger_id', user.id).order('created_at', { ascending: false });
        if (data) {
          const parsed = data.map(mapDbRowToTransaction);
          setTransactions(parsed);
          if (parsed.length > 0) setSelectedTx(parsed[0]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trip History</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Ledger & Manifest Logs</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ledger Column */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Activity Log</h3>
             </div>
             <Search className="w-4 h-4 text-slate-300" />
          </div>

          <div className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><Inbox className="w-8 h-8 text-slate-200" /></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Empty Ledger</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} onClick={() => setSelectedTx(tx)} className={`p-6 flex items-center justify-between cursor-pointer transition ${selectedTx?.id === tx.id ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.status === 'in_progress' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                       <Car className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-900 leading-none">{tx.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-black text-slate-900 leading-none">{tx.amount}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : tx.status === 'in_progress' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>{tx.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Receipt Detail */}
        {selectedTx && (
          <aside className="lg:col-span-5 space-y-6">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center justify-between border-b border-white/10 pb-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Manifest Receipt</p>
                         <h4 className="text-lg font-black tracking-tight">{selectedTx.title}</h4>
                      </div>
                      <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400"><CheckCircle2 className="w-6 h-6" /></div>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction Hash</p>
                            <p className="text-xs font-mono text-teal-400 truncate">{selectedTx.txHash}</p>
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Settled via</p>
                            <p className="text-xs font-black text-slate-200">{selectedTx.cardUsed}</p>
                         </div>
                      </div>

                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                         <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Fare Total</p>
                               <p className="text-3xl font-black text-teal-400 leading-none">{selectedTx.amount}</p>
                            </div>
                            <div className="text-right space-y-1">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Status</p>
                               <p className="text-xs font-black text-slate-200 uppercase tracking-widest">{selectedTx.status}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4 pt-2">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-teal-500" />
                            <p className="text-xs font-bold text-slate-300">{selectedTx.pickup}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <Navigation className="w-4 h-4 text-orange-500" />
                            <p className="text-xs font-bold text-slate-300">{selectedTx.dropoff}</p>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-400 font-black text-xs">{selectedTx.driverName?.charAt(0)}</div>
                            <div className="space-y-0.5">
                               <p className="text-xs font-black text-slate-200">{selectedTx.driverName}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedTx.cabNumber}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl" />
             </div>

             <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col gap-3 shadow-sm">
                <button onClick={() => router.push('/dashboard')} className="w-full h-14 bg-slate-50 text-slate-900 rounded-2xl font-black text-xs hover:bg-slate-100 transition flex items-center justify-center gap-2 tracking-tight"><RotateCcw className="w-4 h-4" /> Book Route Again</button>
                <button onClick={() => alert('Support ticket raised.')} className="w-full h-14 text-slate-400 hover:text-rose-600 transition font-bold text-[10px] uppercase tracking-widest">Report Issue</button>
             </div>
          </aside>
        )}
      </div>
    </div>
  );
}
