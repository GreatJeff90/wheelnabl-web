'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MapPin, Navigation, Car, CreditCard, History, User } from 'lucide-react';

const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500">
      Loading Estate Map...
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const [pickup, setPickup] = useState('House 14, Zone C, Gulf Estate');
  const [destination, setDestination] = useState('');

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row">
      
      {/* Desktop Sidebar / Mobile Floating Header */}
      <aside className="w-full md:w-96 bg-white shadow-xl z-10 flex flex-col justify-between p-6 border-r border-slate-100">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black text-teal-900 tracking-tight">Wheelnabl</h1>
            <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-bold">Gulf Estate</span>
          </div>

          {/* Ride Booking Form */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <MapPin className="text-teal-700 w-5 h-5 shrink-0" />
              <input 
                type="text" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)} 
                placeholder="Pickup address"
                className="bg-transparent text-sm w-full outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <Navigation className="text-rose-500 w-5 h-5 shrink-0" />
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                placeholder="Where to in Port Harcourt?" 
                className="bg-transparent text-sm w-full outline-none text-slate-800"
              />
            </div>

            <button className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-3 rounded-xl text-sm transition">
              Find Wheelnabl Ride
            </button>
          </div>
        </div>

        {/* Floating Capsule Bar (Web Alternative) */}
        <div className="flex items-center justify-around bg-slate-100 p-2 rounded-2xl mt-6">
          <button onClick={() => setActiveTab('history')} className={`p-2.5 rounded-xl ${activeTab === 'history' ? 'bg-teal-800 text-white' : 'text-slate-500'}`}>
            <History className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('home')} className={`p-2.5 rounded-xl ${activeTab === 'home' ? 'bg-teal-800 text-white' : 'text-slate-500'}`}>
            <Car className="w-5 h-5" />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl ${activeTab === 'profile' ? 'bg-teal-800 text-white' : 'text-slate-500'}`}>
            <User className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Map Canvas Area */}
      <section className="flex-1 h-full w-full relative">
        <DynamicMap center={[4.8290, 7.0325]} />
      </section>

    </main>
  );
}