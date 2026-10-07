'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
  Navigation,
  ArrowRight,
  Inbox,
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

interface DriverProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  badge_number: string | null;
  role: string | null;
}

interface ActiveResidentTrip {
  id: string;
  ticketId: string;
  serviceType: 'Estate Shuttle' | 'Private EV';
  cabNumber: string;
  driverName: string;
  driverPhone: string;
  pickup: string;
  dropoff: string;
  fare: string;
  status: 'searching' | 'assigned' | 'in_progress';
  securityPin: string;
  eta: string;
  hashId: string;
}

interface EstateFleetUnit {
  id: string;
  cabNumber: string;
  driverName: string;
  phone: string;
  serviceType: 'Estate Shuttle' | 'Private EV';
  currentZone: string;
  battery: number;
  status: 'available' | 'busy' | 'charging';
  rate: string;
  hashId: string;
}

export default function RidesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [activeTrips, setActiveTrips] = useState<ActiveResidentTrip[]>([]);
  const [fleetUnits, setFleetUnits] = useState<EstateFleetUnit[]>([]);
  const [selectedCab, setSelectedCab] = useState<EstateFleetUnit | ActiveResidentTrip | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const mapDbRideToActiveTrip = (row: RideDbRow): ActiveResidentTrip => {
    let mappedStatus: 'searching' | 'assigned' | 'in_progress' = 'searching';
    if (row.status === 'accepted' || row.status === 'arrived') {
      mappedStatus = 'assigned';
    } else if (row.status === 'in_progress') {
      mappedStatus = 'in_progress';
    }

    return {
      id: row.id,
      ticketId: `WNB-${row.id.slice(0, 4).toUpperCase()}`,
      serviceType: row.service_type === 'private' ? 'Private EV' : 'Estate Shuttle',
      cabNumber: row.cab_number || 'EV Patrol #04',
      driverName: row.driver_name || (row.status === 'pending' ? 'Dispatching...' : 'Fleet Operator'),
      driverPhone: '+234 800 000 0000',
      pickup: row.pickup,
      dropoff: row.dropoff,
      fare: `₦${Number(row.fare).toLocaleString()}`,
      status: mappedStatus,
      securityPin: row.security_pin || '4821',
      eta: row.status === 'pending' ? 'Finding EV' : '3 mins away',
      hashId: `0x${row.id.replace(/-/g, '').slice(0, 4)}...${row.id.slice(-6)}`,
    };
  };

  useEffect(() => {
    async function loadRidesAndFleet() {
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

        // 1. Fetch any ongoing intra-estate rides ordered by this resident
        const { data: dbRides } = await supabase
          .from('rides')
          .select('*')
          .eq('passenger_id', user.id)
          .in('status', ['pending', 'accepted', 'arrived', 'in_progress'])
          .order('created_at', { ascending: false });

        if (dbRides && dbRides.length > 0) {
          const parsedRides = (dbRides as RideDbRow[]).map(mapDbRideToActiveTrip);
          setActiveTrips(parsedRides);
          setSelectedCab(parsedRides[0]);
        }

        // 2. Query verified driver profiles from Supabase to construct real fleet radar
        const { data: dbDrivers } = await supabase
          .from('profiles')
          .select('id, full_name, phone, badge_number, role')
          .eq('role', 'driver')
          .limit(6);

        if (dbDrivers && dbDrivers.length > 0) {
          const mappedDrivers: EstateFleetUnit[] = (dbDrivers as DriverProfileRow[]).map((driver, index) => ({
            id: driver.id,
            cabNumber: driver.badge_number || `EV Cab #${String(index + 1).padStart(2, '0')}`,
            driverName: driver.full_name || `Driver ${index + 1}`,
            phone: driver.phone || '+2348000000000',
            serviceType: index % 2 === 0 ? 'Estate Shuttle' : 'Private EV',
            currentZone: index % 2 === 0 ? 'Phase 1 Gatehouse' : 'Clubhouse & Recreation',
            battery: 75 + (index * 5) % 25,
            status: 'available',
            rate: index % 2 === 0 ? '₦500.00' : '₦2,500.00',
            hashId: `0x${driver.id.replace(/-/g, '').slice(0, 4)}...${driver.id.slice(-6)}`,
          }));

          setFleetUnits(mappedDrivers);
          if (!dbRides || dbRides.length === 0) {
            setSelectedCab(mappedDrivers[0]);
          }
        } else {
          // Fallback baseline fleet units if no driver records exist yet
          const fallbackFleet: EstateFleetUnit[] = [
            {
              id: 'ev-01',
              cabNumber: 'Cab #01',
              driverName: 'Emeka K.',
              phone: '+2348012345671',
              serviceType: 'Estate Shuttle',
              currentZone: 'Phase 1 Gatehouse',
              battery: 88,
              status: 'available',
              rate: '₦500.00',
              hashId: '0x84f9...Golf01b3',
            },
            {
              id: 'ev-02',
              cabNumber: 'Cab #02',
              driverName: 'David O.',
              phone: '+2348012345672',
              serviceType: 'Private EV',
              currentZone: 'Clubhouse & Recreation',
              battery: 74,
              status: 'available',
              rate: '₦2,500.00',
              hashId: '0x68b7...438aefd35',
            },
          ];
          setFleetUnits(fallbackFleet);
          if (!dbRides || dbRides.length === 0) {
            setSelectedCab(fallbackFleet[0]);
          }
        }
      } catch (err) {
        console.error('Error loading rides and fleet data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRidesAndFleet();
  }, [router]);

  // Real-time listener for the resident's active booking updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('resident_rides_channel')
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
            const newRide = mapDbRideToActiveTrip(payload.new as RideDbRow);
            setActiveTrips((prev) => [newRide, ...prev]);
            setSelectedCab(newRide);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as RideDbRow;
            if (updated.status === 'completed' || updated.status === 'canceled') {
              setActiveTrips((prev) => prev.filter((r) => r.id !== updated.id));
              setSelectedCab((prev) => (prev?.id === updated.id ? fleetUnits[0] || null : prev));
            } else {
              const mapped = mapDbRideToActiveTrip(updated);
              setActiveTrips((prev) => prev.map((r) => (r.id === mapped.id ? mapped : r)));
              setSelectedCab((prev) => (prev?.id === mapped.id ? mapped : prev));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setActiveTrips((prev) => prev.filter((r) => r.id !== deletedId));
            setSelectedCab((prev) => (prev?.id === deletedId ? fleetUnits[0] || null : prev));
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
  }, [userId, fleetUnits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const isSelectedActiveTrip = selectedCab && 'ticketId' in selectedCab;
  const currentActiveTrip = isSelectedActiveTrip ? (selectedCab as ActiveResidentTrip) : null;
  const currentFleetUnit = !isSelectedActiveTrip && selectedCab ? (selectedCab as EstateFleetUnit) : null;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rides & Fleet Radar</h1>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-[#004B4F] transition cursor-pointer font-bold text-[#004B4F]"
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
              onClick={() => alert('Golf Estate Transit Support Desk: +234 800 000 0000')}
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Active Orders & Patrolling Units */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
            {/* 1. Active In-Progress / Dispatched Trips */}
            {activeTrips.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                    Your Active Ride in Transit
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Pre-cleared at Gate
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTrips.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCab(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedCab?.id === item.id
                          ? 'bg-teal-50/80 border-teal-200 shadow-xs'
                          : 'bg-teal-50/40 border-teal-100 hover:bg-teal-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#004B4F] text-white flex items-center justify-center shrink-0">
                          <Car className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {item.serviceType} • {item.cabNumber}
                          </p>
                          <p className="text-[11px] text-teal-800 font-medium flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-[#FF7A00]" />
                            {item.pickup} → {item.dropoff}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-[#004B4F]">{item.fare}</p>
                        <p className="text-[10px] font-mono text-slate-500">PIN: {item.securityPin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Inbox className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">No Active Ride in Transit</h3>
                    <p className="text-[11px] text-slate-500">You do not currently have any vehicle en route.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#004B4F] hover:bg-[#00383b] px-4 py-2 rounded-full transition shadow-xs cursor-pointer"
                >
                  <span>Book Cab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 2. Available & Patrolling Estate Fleet Units */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estate Fleet Status & Coverage
              </h2>

              <div className="divide-y divide-slate-100">
                {fleetUnits.map((cab) => {
                  const isSelected = selectedCab?.id === cab.id;

                  return (
                    <div
                      key={cab.id}
                      onClick={() => setSelectedCab(cab)}
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
                          <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                            Available • {cab.currentZone}
                          </p>
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

          {/* Right Column: Selected Ride / Fleet Drawer */}
          {selectedCab && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentActiveTrip ? 'Active Trip Verification' : 'Patrol Cab Specifications'}
                  </h3>
                  <button
                    onClick={() => setSelectedCab(null)}
                    aria-label="Close details"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Hash Ref */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    TxRef Hash:
                  </span>
                  <p className="text-xs font-mono font-medium text-teal-800 break-all mt-1">
                    {selectedCab.hashId}
                  </p>
                </div>

                {/* Status Indicator */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Dispatch Status:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {currentActiveTrip ? (
                      <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        {currentActiveTrip.status === 'searching'
                          ? 'Locating Patrol Unit...'
                          : 'En Route to Coordinates'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Available for Intra-Estate Call
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned Driver or Operator */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {currentActiveTrip ? 'Driver Assigned:' : 'Assigned Operator:'}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {currentActiveTrip ? currentActiveTrip.driverName : currentFleetUnit?.driverName} (
                    {currentActiveTrip ? currentActiveTrip.cabNumber : currentFleetUnit?.cabNumber})
                  </p>
                </div>

                {/* Coordinates or Security Pass */}
                {currentActiveTrip ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <p><strong className="text-slate-400 font-normal">Pickup:</strong> {currentActiveTrip.pickup}</p>
                      <p><strong className="text-slate-400 font-normal">Drop-off:</strong> {currentActiveTrip.dropoff}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block">
                          Security Gate PIN
                        </span>
                        <span className="text-lg font-black text-slate-900 font-mono tracking-widest">
                          {currentActiveTrip.securityPin}
                        </span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-[#FF7A00]" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Current Patrol Zone:
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#004B4F] shrink-0" />
                      <span>{currentFleetUnit?.currentZone}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Golf Estate Barrier FastPass Authorized</span>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <a
                  href={`tel:${currentActiveTrip ? currentActiveTrip.driverPhone : currentFleetUnit?.phone}`}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#004B4F]" />
                  <span>Call Patrol Desk</span>
                </a>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-full bg-[#FF7A00] hover:bg-[#e66e00] text-white transition shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Book Ride on Dashboard</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}