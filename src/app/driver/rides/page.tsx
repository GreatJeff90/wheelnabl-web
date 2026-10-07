'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
  User,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface AssignedTrip {
  id: string;
  ticketId: string;
  passengerName: string;
  passengerPhone: string;
  serviceType: 'Estate Shuttle' | 'Private EV' | 'Parcel Courier';
  pickup: string;
  dropoff: string;
  fare: string;
  status: 'active_transit' | 'queued' | 'completed';
  securityPin: string;
  eta: string;
}

interface PeerFleetDriver {
  id: string;
  cabNumber: string;
  driverName: string;
  currentZone: string;
  battery: number;
  status: 'patrolling' | 'on_trip' | 'charging';
}

const ACTIVE_TRIPS: AssignedTrip[] = [
  {
    id: 'trip-01',
    ticketId: 'WNB-8491',
    passengerName: 'Olamide Praise',
    passengerPhone: '+2348105550192',
    serviceType: 'Private EV',
    pickup: 'Phase 2 Gatehouse',
    dropoff: 'Golf Estate Clubhouse',
    fare: '₦2,500.00',
    status: 'active_transit',
    securityPin: '4821',
    eta: '3 mins away',
  },
  {
    id: 'trip-02',
    ticketId: 'WNB-8492',
    passengerName: 'Engr. Tamuno Briggs',
    passengerPhone: '+2348031112233',
    serviceType: 'Estate Shuttle',
    pickup: 'Road 4 Residential Zone',
    dropoff: 'Phase 1 Gatehouse',
    fare: '₦500.00',
    status: 'queued',
    securityPin: '1904',
    eta: 'Next in queue',
  },
  {
    id: 'trip-03',
    ticketId: 'WNB-8490',
    passengerName: 'Mrs. Stella Alabo',
    passengerPhone: '+2348029994455',
    serviceType: 'Estate Shuttle',
    pickup: 'Sports Pavilion & Tennis Court',
    dropoff: 'Peter Odili Exit Link',
    fare: '₦500.00',
    status: 'completed',
    securityPin: '7732',
    eta: 'Completed 2:15 PM',
  },
];

const PEER_FLEET: PeerFleetDriver[] = [
  {
    id: 'peer-1',
    cabNumber: 'Cab #01',
    driverName: 'Emeka K.',
    currentZone: 'Phase 1 Gatehouse',
    battery: 88,
    status: 'on_trip',
  },
  {
    id: 'peer-2',
    cabNumber: 'Cab #02',
    driverName: 'David O.',
    currentZone: 'Clubhouse & Recreation',
    battery: 74,
    status: 'patrolling',
  },
  {
    id: 'peer-3',
    cabNumber: 'Cab #03',
    driverName: 'Chinedu A.',
    currentZone: 'Road 4 Residential Zone',
    battery: 92,
    status: 'patrolling',
  },
  {
    id: 'peer-4',
    cabNumber: 'Cab #05',
    driverName: 'Osas I.',
    currentZone: 'Main Gate EV Solar Bay',
    battery: 32,
    status: 'charging',
  },
];

export default function DriverRidesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<AssignedTrip | null>(ACTIVE_TRIPS[0]);
  const [trips, setTrips] = useState<AssignedTrip[]>(ACTIVE_TRIPS);

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

  const handleUpdateStatus = (tripId: string, nextStatus: 'active_transit' | 'completed') => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: nextStatus } : t))
    );
    if (selectedTrip?.id === tripId) {
      setSelectedTrip((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const activeTransits = trips.filter((t) => t.status === 'active_transit');
  const queuedTrips = trips.filter((t) => t.status !== 'active_transit');

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Minimal Header */}
        <header className="h-18 px-8 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Trips & Dispatch Queue</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#004B4F] border border-teal-100">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Sector
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => router.push('/driver')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Cockpit
            </button>
            <button
              onClick={() => router.push('/driver/history')}
              className="hover:text-[#004B4F] transition cursor-pointer"
            >
              Trip Manifest
            </button>
            <button
              title="Security Dispatch Hotline"
              onClick={() => alert('Golf Estate Security Control Room: +234 800 000 0000')}
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body: Left Ledger + Right Details Drawer */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Active Trips & Dispatch Queue */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-8">
            
            {/* 1. Active Transit Section */}
            {activeTransits.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current In-Progress Passenger
                </h2>

                <div className="space-y-2">
                  {activeTransits.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTrip(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        selectedTrip?.id === item.id
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
                            {item.serviceType} • {item.passengerName}
                          </p>
                          <p className="text-[11px] text-teal-800 font-medium flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {item.pickup} → {item.dropoff}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-[#004B4F]">{item.fare}</p>
                        <p className="text-[10px] text-slate-400 font-mono">PIN: {item.securityPin}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Queued & Completed Trips */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Queued & Shift Trips
              </h2>

              <div className="divide-y divide-slate-100">
                {queuedTrips.map((trip) => {
                  const isSelected = selectedTrip?.id === trip.id;

                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTrip(trip)}
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
                            <p className="text-xs font-bold text-slate-900">{trip.passengerName}</p>
                            <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">
                              {trip.ticketId}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {trip.pickup} → {trip.dropoff}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{trip.fare}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            trip.status === 'queued'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {trip.status === 'queued' ? 'Queued' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Peer Fleet Sector Radar */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Estate Fleet Sector Coverage
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PEER_FLEET.map((peer) => (
                  <div
                    key={peer.id}
                    className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{peer.cabNumber}</span>
                        <span className="text-[10px] text-slate-500">({peer.driverName})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{peer.currentZone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#004B4F] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {peer.battery}% EV
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Selected Trip Details Drawer */}
          {selectedTrip && (
            <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white">
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Trip Dispatch Dossier</h3>
                  <button
                    onClick={() => setSelectedTrip(null)}
                    aria-label="Close details"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Ticket Reference */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                    Estate Ticket ID:
                  </span>
                  <p className="text-xs font-mono font-bold text-[#004B4F] mt-1">
                    {selectedTrip.ticketId}
                  </p>
                </div>

                {/* Status Indicator */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Transit Status:
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {selectedTrip.status === 'active_transit' && (
                      <span className="text-xs font-bold text-teal-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                        In-Transit with Passenger
                      </span>
                    )}
                    {selectedTrip.status === 'queued' && (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Queued for Next Pickup
                      </span>
                    )}
                    {selectedTrip.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Fare Settled & Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Passenger Identity */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Passenger Credentials:
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedTrip.passengerName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Verified Resident • FastPass Member
                  </p>
                </div>

                {/* Route Waypoints */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Pickup Coordinates:
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#004B4F] shrink-0" />
                      <span>{selectedTrip.pickup}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Drop-off Destination:
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                      <Navigation className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
                      <span>{selectedTrip.dropoff}</span>
                    </div>
                  </div>
                </div>

                {/* Security Gate Clearance PIN */}
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-wider block">
                      Barrier Verification PIN
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono tracking-widest">
                      {selectedTrip.securityPin}
                    </span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-[#FF7A00]" />
                </div>
              </div>

              {/* Bottom Actions: Call Passenger & Update Status */}
              <div className="pt-6 border-t border-slate-100 space-y-2">
                <a
                  href={`tel:${selectedTrip.passengerPhone}`}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#004B4F]" />
                  <span>Call Passenger</span>
                </a>

                {selectedTrip.status === 'active_transit' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTrip.id, 'completed')}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Trip & Settle {selectedTrip.fare}</span>
                  </button>
                )}

                {selectedTrip.status === 'queued' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedTrip.id, 'active_transit')}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3.5 rounded-full bg-[#004B4F] hover:bg-[#00383b] text-white transition shadow-md shadow-teal-950/20 active:scale-95 cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    <span>Start This Trip Now</span>
                  </button>
                )}
              </div>
            </aside>
          )}

        </div>
      </main>
    </div>
  );
}