'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Briefcase, 
  Baby, 
  ShieldCheck, 
  ArrowUpRight, 
  Zap, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface AudienceItem {
  id: string;
  pillLabel: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  keyFeature: string;
  highlightColor: string; // tailwind bg color for card
  textColor: string;
}

const AUDIENCE: AudienceItem[] = [
  {
    id: 'residents',
    pillLabel: 'Estate Residents',
    title: 'Homeowners & Tenants',
    subtitle: 'Daily Intra-Estate Commute',
    badge: 'Doorstep Pickup',
    description:
      'Eliminate long walks in the heat or rain. Move effortlessly between your residence, the estate clubhouse, sports courts, and primary gatehouses in silent, air-conditioned comfort.',
    keyFeature: '100% Zero-Emission Electric Fleet',
    highlightColor: 'bg-[#004B4F]',
    textColor: 'text-white',
  },
  {
    id: 'school-runs',
    pillLabel: 'Parents & Kids',
    title: 'School Runs & Safe Transit',
    subtitle: 'Verified Drivers & Speed Caps',
    badge: 'Estate-Safe Speed',
    description:
      'Safe, reliable transport for school pickups at the front gate or trips to children’s play parks inside Gulf Estate without relying on unpredictable external operators.',
    keyFeature: 'Internal Pre-Cleared Security Protocol',
    highlightColor: 'bg-[#183B32]',
    textColor: 'text-white',
  },
  {
    id: 'professionals',
    pillLabel: 'Daily Commuters',
    title: 'Corporate Professionals',
    subtitle: 'Gate Connections & Peak Hours',
    badge: 'Zero Waiting Time',
    description:
      'Get straight to the main estate entrance to link up with your off-estate driver or highway transit every morning without breaking a sweat or dirtying your shoes.',
    keyFeature: 'Instant One-Tap Wallet Fare',
    highlightColor: 'bg-[#22332B]',
    textColor: 'text-white',
  },
  {
    id: 'visitors',
    pillLabel: 'Guests & Vendors',
    title: 'Authorized Visitors',
    subtitle: 'Gate-to-Doorstep Escort',
    badge: 'Pre-Cleared Pass',
    description:
      'Visiting friends or family? Hop into an electric cab directly from the visitor parking bay right to your host’s doorstep without wandering through numbered phases.',
    keyFeature: 'Visitor Clearance Synchronization',
    highlightColor: 'bg-[#0C2422]',
    textColor: 'text-white',
  },
];

export default function WhosItFor() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = AUDIENCE[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % AUDIENCE.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + AUDIENCE.length) % AUDIENCE.length);
  };

  return (
    <section id="who-its-for" className="py-24 px-4 sm:px-6 md:px-8 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Category Filter Pills (Similar to navigation bar in inspiration) */}
        <div className="flex items-center justify-center mb-16">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60 max-w-full">
            {AUDIENCE.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {item.pillLabel}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Centralized Stack Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Title & Hook */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">
              Built for Gulf Estate
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-2 leading-[1.1]">
              Who Is <br className="hidden lg:block" />
              Wheelnabl For?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed max-w-sm mx-auto lg:mx-0">
              A specialized intra-estate network tailored to the exact transit routines of everyone living, working, and visiting within the gates.
            </p>

            {/* Manual Stack Carousel Arrows */}
            <div className="hidden lg:flex items-center gap-3 mt-8">
              <button
                onClick={handlePrev}
                aria-label="Previous audience"
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next audience"
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-400 ml-2">
                0{activeIndex + 1} / 0{AUDIENCE.length}
              </span>
            </div>
          </div>

          {/* Center Column: The Central Layered Stack Deck */}
          <div className="lg:col-span-4 flex justify-center py-6">
            <div className="relative w-full max-w-[320px] h-[450px]">
              
              {/* Stack effect tabs preview at the top */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[82%] h-4 bg-teal-900/30 rounded-t-2xl pointer-events-none" />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-teal-800/40 rounded-t-2xl pointer-events-none" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[96%] h-3 bg-teal-700/60 rounded-t-2xl pointer-events-none" />

              {/* Main Active Stack Card */}
              <div
                className={`w-full h-full rounded-[2.5rem] p-7 flex flex-col justify-between shadow-2xl transition-all duration-300 relative z-10 ${activeItem.highlightColor} ${activeItem.textColor}`}
              >
                <div>
                  {/* Top Card Monogram */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-2xl font-black tracking-tighter opacity-90">
                      W.
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
                      {activeItem.badge}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-wider text-teal-200 font-semibold">
                    {activeItem.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight mt-1 leading-snug">
                    {activeItem.title}
                  </h3>

                  <p className="mt-4 text-xs text-white/80 leading-relaxed font-normal">
                    {activeItem.description}
                  </p>
                </div>

                {/* Card Footer Detail */}
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>{activeItem.keyFeature}</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest font-mono">
                    Gulf Estate Fleet Protocol
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Context + Call to Action */}
          <div className="lg:col-span-4 text-center lg:text-left pl-0 lg:pl-6 space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Tailored Experience</span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {activeItem.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Optimized for Gulf Estate gates, residences, and internal avenues.
              </p>
            </div>

            {/* Pill CTA button matching the visual inspiration */}
            <div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition shadow-sm active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}