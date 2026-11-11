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
  CheckCircle2,
  HelpCircle,
  Loader2,
  Inbox,
  ArrowRight,
  History,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface RideDbRow {
  id: string;
  passenger_name: string | null;
  pickup: string;
  dropoff: string;
  fare: number | string;
  status: string;
  cab_number?: string | null;
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
  status: 'in_progress' | 'settled' | 'canceled';
  barrierPassUsed: string;
}

export default function DriverHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<DriverTripTransaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<DriverTripTransaction | null>(null);

  const mapDbRowToTransaction = (row: RideDbRow): DriverTripTransaction => {
    const isCompleted = row.status === 'completed';
    const isCanceled = row.status === 'canceled';

    return {
      id: row.id,
      txHash: `0x${row.id.replace(/-/g, '').slice(0, 4)}...${row.id.slice(-6)}`,
      title: 'Estate Patrol Ride',
      passengerName: row.passenger_name || 'Resident',
      pickup: row.pickup,
      dropoff: row.dropoff,
      date: new Date(row.created_at || '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      amount: `+ ${Number(row.fare).toFixed(1)} hp`,
      status: isCompleted ? 'settled' : isCanceled ? 'canceled' : 'in_progress',
      barrierPassUsed: `BARRIER-PASS-${row.cab_number?.replace(/\D/g, '') || '04'}`,
    };
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }
        setDriverId(user.id);
        const { data } = await supabase.from('rides').select('*').eq('driver_id', user.id).order('created_at', { ascending: false });
        if (data) {
          const parsed = data.map(mapDbRowToTransaction);
          setTransactions(parsed);
          if (parsed.length > 0) setSelectedTx(parsed[0]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadHistory();
  }, [router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shift Manifest</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Earnings Log & Settlement Records</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3"><History className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Earnings Log</h3></div>
               <Search className="w-4 h-4 text-slate-300" />
            </div>

            <div className="divide-y divide-slate-50">
               {transactions.map(tx => (
                  <div key={tx.id} onClick={() => setSelectedTx(tx)} className={`p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition ${selectedTx?.id === tx.id ? 'bg-teal-50/30' : ''}`}>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center"><ArrowUpRight className="w-6 h-6" /></div>
                        <div>
                           <p className="text-sm font-black text-slate-900">{tx.title}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tx.passengerName} • {tx.date}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-emerald-600">{tx.amount}</p>
                        <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{tx.status}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {selectedTx && (
            <aside className="lg:col-span-5 bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start border-b border-white/10 pb-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Shift Settlement</p>
                        <h4 className="text-xl font-black">{selectedTx.amount}</h4>
                     </div>
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400"><CheckCircle2 className="w-6 h-6" /></div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                     <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Pickup</span><span className="text-white">{selectedTx.pickup}</span></div>
                     <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">Destination</span><span className="text-white">{selectedTx.dropoff}</span></div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 text-xs">
                     <ShieldCheck className="w-5 h-5 text-teal-500" />
                     <p className="font-medium text-slate-300">Transit Authorized via {selectedTx.barrierPassUsed}</p>
                  </div>
               </div>
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
            </aside>
         )}
      </div>
    </div>
  );
}
