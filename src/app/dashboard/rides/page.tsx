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
      fare: `${Number(row.fare).toFixed(1)} hp`,
      status: mappedStatus,
      securityPin: row.security_pin || '4821',
      eta: row.status === 'pending' ? 'Finding EV' : '3 mins away',
      hashId: `0x${row.id.replace(/-/g, '').slice(0, 4)}...${row.id.slice(-6)}`,
    };
  };

  useEffect(() => {
    async function loadRidesAndFleet() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { router.replace('/login'); return; }
        setUserId(user.id);

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
            rate: index % 2 === 0 ? '0.9 hp' : '4.6 hp',
            hashId: `0x${driver.id.replace(/-/g, '').slice(0, 4)}...${driver.id.slice(-6)}`,
          }));
          setFleetUnits(mappedDrivers);
          if (!dbRides || dbRides.length === 0) setSelectedCab(mappedDrivers[0]);
        } else {
          const fallbackFleet: EstateFleetUnit[] = [
            { id: 'ev-01', cabNumber: 'Cab #01', driverName: 'Emeka K.', phone: '+2348012345671', serviceType: 'Estate Shuttle', currentZone: 'Phase 1 Gatehouse', battery: 88, status: 'available', rate: '0.9 hp', hashId: '0x84f9...Golf01b3' },
            { id: 'ev-02', cabNumber: 'Cab #02', driverName: 'David O.', phone: '+2348012345672', serviceType: 'Private EV', currentZone: 'Clubhouse & Recreation', battery: 74, status: 'available', rate: '4.6 hp', hashId: '0x68b7...438aefd35' },
          ];
          setFleetUnits(fallbackFleet);
          if (!dbRides || dbRides.length === 0) setSelectedCab(fallbackFleet[0]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadRidesAndFleet();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('resident_rides_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'rides', filter: `passenger_id=eq.${userId}` }, (payload) => {
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
    }).subscribe();
    channelRef.current = channel;
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [userId, fleetUnits]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Rides & Fleet Radar</h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Real-time transit network overview</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600"><Car className="w-5 h-5" /></div>
              <h3 className="text-sm font-black uppercase tracking-widest">Active Dispatches</h3>
            </div>

            {activeTrips.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-xs font-bold text-slate-400">No active trips</p>
              </div>
            ) : (
              activeTrips.map((trip) => (
                <div key={trip.id} onClick={() => setSelectedCab(trip)} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-teal-200 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center"><Car className="w-6 h-6 animate-pulse" /></div>
                    <div>
                      <p className="font-black text-slate-900">{trip.serviceType}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{trip.pickup} → {trip.dropoff}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-teal-700">{trip.fare}</p>
                    <p className="text-[10px] font-mono text-slate-400">{trip.securityPin}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/40 space-y-6">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Fleet Availability</h3>
           {fleetUnits.map(unit => (
              <div key={unit.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"><Zap className="w-4 h-4 text-teal-600" /></div>
                    <div>
                       <p className="text-xs font-bold">{unit.serviceType}</p>
                       <p className="text-[10px] text-slate-400 font-medium">{unit.currentZone}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{unit.rate}</p>
                    <p className="text-[10px] font-medium text-emerald-600">{unit.battery}% EV</p>
                 </div>
              </div>
           ))}
        </aside>
      </div>
    </div>
  );
}
