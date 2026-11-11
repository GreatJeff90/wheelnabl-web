'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDriverPresence } from '@/hooks/useDriverPresence';
import { 
  Car, 
  Users, 
  Coins, 
  Activity, 
  Radio, 
  RefreshCw
} from 'lucide-react';

interface Ride {
  id: string;
  passenger_name: string;
  driver_name: string | null;
  pickup: string;
  dropoff: string;
  fare: number;
  status: 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  wallet_balance: number;
}

const HP_TO_NGN_RATE = 537.5;

export default function AdminOverviewPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { onlineCount } = useDriverPresence('resident');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [ridesRes, profilesRes] = await Promise.all([
        supabase.from('rides').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('profiles').select('*')
      ]);

      if (ridesRes.data) setRides(ridesRes.data as Ride[]);
      if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    } catch (err) {
      console.error('Failed fetching admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const channel = supabase
      .channel('admin_live_telemetry')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rides' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRides((prev) => [payload.new as Ride, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRides((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Ride) : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalRides = rides.length;
  const completedRides = rides.filter((r) => r.status === 'completed');
  const grossHp = completedRides.reduce((acc, curr) => acc + (Number(curr.fare) || 0), 0);
  const grossNgn = grossHp * HP_TO_NGN_RATE;
  const totalResidents = profiles.filter((p) => p.role !== 'driver' && p.role !== 'admin').length;
  const driversList = profiles.filter((p) => p.role === 'driver');

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Estate Telemetry & Fleet Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time intra-estate dispatch activity and credit settlement
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Trips</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{totalRides}</p>
          <p className="text-xs text-slate-500 mt-1">{completedRides.length} delivered</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gross Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{grossHp.toFixed(2)} <span className="text-sm font-bold text-emerald-600">hp</span></p>
          <p className="text-xs text-slate-500 mt-1">≈ ₦{grossNgn.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Drivers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <p className="text-2xl font-black text-slate-900">{onlineCount}</p>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-1">{driversList.length} total registered fleet</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Residents</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{totalResidents}</p>
          <p className="text-xs text-slate-500 mt-1">Verified estate households</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Live Dispatch Feed
            </h2>
            <span className="text-xs font-semibold text-slate-400">Subscribed to Realtime</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {rides.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No recorded trips yet.</div>
            ) : (
              rides.slice(0, 10).map((ride) => (
                <div key={ride.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">{ride.passenger_name || 'Resident'}</span>
                      <span className="text-xs text-slate-400">→</span>
                      <span className="text-xs font-medium text-slate-600">{ride.driver_name || 'Unassigned'}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <span>{ride.pickup}</span>
                      <span className="mx-1.5 text-slate-300">•</span>
                      <span>{ride.dropoff}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-800">{Number(ride.fare || 0).toFixed(2)} hp</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ride.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ride.status === 'in_progress'
                          ? 'bg-sky-50 text-sky-700'
                          : ride.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ride.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-teal-600" />
            Fleet Roster ({driversList.length})
          </h2>

          <div className="space-y-3.5">
            {driversList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No drivers enrolled yet.</p>
            ) : (
              driversList.map((driver) => (
                <div key={driver.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{driver.full_name || 'Fleet Operator'}</p>
                    <p className="text-[11px] text-slate-400">{driver.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-700">{Number(driver.wallet_balance || 0).toFixed(1)} hp</span>
                    <p className="text-[10px] text-slate-400">Balance</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}