'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar, { DashboardTab } from '@/components/dashboard/Sidebar';
import {
  Car,
  Zap,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  RotateCcw,
  HelpCircle,
  Loader2,
  MapPin,
  BatteryCharging,
} from 'lucide-react';

interface FleetDriver {
  id: string;
  cabNumber: string;
  driverName: string;
  phone: string;
  serviceType: 'Estate Shuttle' | 'Private EV' | 'Parcel Courier';
  currentZone: string;
  battery: number;
  status: 'active_transit' | 'available' | 'charging' | 'busy';
  rate: string;
  estimatedArrival: string;
  hashId: string;
}

const FLEET_DATA: FleetDriver[] = [
  {
    id: 'ev-0',
    cabNumber: 'Cab #01',
    driverName: 'Emeka K.',
    phone: '+2348012345671',
    serviceType: 'Estate Shuttle',
    currentZone: 'Phase 1 Gatehouse',
    battery: 88,
    status: 'active_transit',
    rate: '₦500.00',
    estimatedArrival: '2 mins away',
    hashId: '0x84f9...gulf01b3',
  },
  {
    id: 'ev-1',
    cabNumber: 'Cab #02',
    driverName: 'David O.',
    phone: '+2348012345672',
    serviceType: 'Private EV',
    currentZone: 'Clubhouse & Recreation',
    battery: 74,
    status: 'available',
    rate: '₦2,500.00',
    estimatedArrival: 'Ready for dispatch',
    hashId: '0x68b7...438aefd35',
  },
  {
    id: 'ev-2',
    cabNumber: 'Cab #03',
    driverName: 'Chinedu A.',
    phone: '+2348012345673',
    serviceType: 'Estate Shuttle',
    currentZone: 'Road 4 Residential Zone',
    battery: 92,
    status: 'available',
    rate: '₦500.00',
    estimatedArrival: 'Ready for dispatch',
    hashId: '0x12a9...99a0134bc',
  },
  {
    id: 'ev-3',
    cabNumber: 'Cab #04',
    driverName: 'Tari B.',
    phone: '+2348012345674',
    serviceType: 'Estate Shuttle',
    currentZone: 'Main Gate EV Solar Bay',
    battery: 32,
    status: 'charging',
    rate: '₦500.00',
    estimatedArrival: 'Charging at Solar Hub',
    hashId: '0x99c4...ff82914ba',
  },
  {
    id: 'ev-4',
    cabNumber: 'Cab #05',
    driverName: 'Osas I.',
    phone: '+2348012345675',
    serviceType: 'Private EV',
    currentZone: 'Phase 2 Gatehouse',
    battery: 65,
    status: 'busy',
    rate: '₦2,500.00',
    estimatedArrival: 'On trip in Phase 2',
    hashId: '0x55d1...7761019ca',
  },
];

export default function RidesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('rides');
  const [selectedDriver, setSelectedDriver] = useState<FleetDriver | null>(FLEET_DATA[0]);

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

  const activeTransits = FLEET_DATA.filter((c) => c.status === 'active_transit');
  const availableFleet = FLEET_DATA.filter((c) => c.status !== 'active_transit');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Reusable Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Minimal Bar */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rides & Fleet</h1>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Book Cab
            </button>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Trip History
            </button>
            <button
              title="Estate Support"
              onClick={() => alert('Gulf Estate Security Desk: +234 800 000 0000')}
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body: Left Ledger + Right Details Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Active Patrols & Available Fleet */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
            {/* 1. Pending Execution / Active Transit */}
            {activeTransits.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pending execution
                </h2>

                <div className="space-y-2">
                  {activeTransits.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDriver(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedDriver?.id === item.id
                          ? 'bg-purple-50/70 border-purple-200'
                          : 'bg-purple-50/30 border-purple-100 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <Car className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {item.serviceType} • {item.cabNumber}
                          </p>
                          <p className="text-[11px] text-purple-700 font-medium">
                            in process... ({item.estimatedArrival})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-purple-900">{item.rate}</p>
                        <p className="text-[10px] text-slate-400">Driver: {item.driverName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Available & Patrolling Fleet */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estate Fleet Status
              </h2>

              <div className="divide-y divide-slate-100">
                {availableFleet.map((cab) => {
                  const isSelected = selectedDriver?.id === cab.id;

                  return (
                    <div
                      key={cab.id}
                      onClick={() => setSelectedDriver(cab)}
                      className={`py-4 px-3 rounded-xl transition cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-[#004B4F]" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{cab.serviceType}</p>
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">
                              {cab.cabNumber}
                            </span>
                          </div>

                          {/* Subtitle / Status */}
                          {cab.status === 'available' && (
                            <p className="text-[11px] font-semibold text-emerald-600">
                              Available • {cab.currentZone}
                            </p>
                          )}
                          {cab.status === 'charging' && (
                            <p className="text-[11px] font-semibold text-sky-600">
                              Recharging (Solar Bay)
                            </p>
                          )}
                          {cab.status === 'busy' && (
                            <p className="text-[11px] font-semibold text-slate-400">
                              On Trip • {cab.currentZone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{cab.rate}</p>
                        <p className="text-[10px] text-slate-400">EV Battery: {cab.battery}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Ride & Driver Details Drawer */}
          {selectedDriver && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Ride Details</h3>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    aria-label="Close details"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Fleet Hash Ref */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    TxHash:
                  </span>
                  <p className="text-xs font-mono font-medium text-purple-600 break-all mt-1">
                    {selectedDriver.hashId}
                  </p>
                </div>

                {/* Status Indicator */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    TxReceipt Status:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {selectedDriver.status === 'active_transit' && (
                      <span className="text-xs font-semibold text-purple-700">
                        Pending execution
                      </span>
                    )}
                    {selectedDriver.status === 'available' && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Available for Dispatch
                      </span>
                    )}
                    {selectedDriver.status === 'charging' && (
                      <span className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-sky-600" />
                        Solar Hub Recharging ({selectedDriver.battery}%)
                      </span>
                    )}
                    {selectedDriver.status === 'busy' && (
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Currently In Service
                      </span>
                    )}
                  </div>
                </div>

                {/* Driver Identity */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Assigned Driver:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {selectedDriver.driverName} ({selectedDriver.cabNumber})
                  </p>
                </div>

                {/* Current Coordinates */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Patrol Location:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-[#004B4F] shrink-0" />
                    <span>{selectedDriver.currentZone}</span>
                  </div>
                </div>

                {/* Pre-Cleared Barrier Clearance */}
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Gulf Estate Security Pass Verified</span>
                </div>
              </div>

              {/* Bottom Actions: Call Driver & Direct Dispatch */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <a
                  href={`tel:${selectedDriver.phone}`}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#004B4F]" />
                  <span>Call Driver ({selectedDriver.phone})</span>
                </a>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  disabled={selectedDriver.status === 'charging' || selectedDriver.status === 'busy'}
                  className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-full transition shadow-xs cursor-pointer ${
                    selectedDriver.status === 'available' || selectedDriver.status === 'active_transit'
                      ? 'bg-[#FF7A00] hover:bg-[#e66e00] text-white shadow-orange-500/20 active:scale-95'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {selectedDriver.status === 'available' ? 'Dispatch This Cab' : 'Cab In Use'}
                  </span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}