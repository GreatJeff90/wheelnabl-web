'use client';

import Link from 'next/link';
import { Zap, Footprints, ShieldCheck, Wallet } from 'lucide-react';

interface ProblemCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isFeatured?: boolean;
}

const CARDS: ProblemCard[] = [
  {
    id: '01',
    icon: <Zap className="w-6 h-6" />,
    title: '100% Electric Fleet',
    description:
      'Eliminating noisy exhaust fumes and fuel pollution. Our custom zero-emission electric cabs ensure Gulf Estate remains serene, clean, and quiet day and night.',
    isFeatured: true,
  },
  {
    id: '02',
    icon: <Footprints className="w-6 h-6 text-[#004B4F]" />,
    title: 'End Long Estate Walks',
    description:
      'Internal commuting made simple. Get picked up directly from your doorstep and dropped off at any zone, club house, or estate gate in minutes.',
  },
  {
    id: '03',
    icon: <ShieldCheck className="w-6 h-6 text-[#004B4F]" />,
    title: 'Strict Internal Transit',
    description:
      'No unregistered commercial operators wandering residential streets. Our drivers are vetted, security-verified, and operate strictly within the estate perimeter.',
  },
  {
    id: '04',
    icon: <Wallet className="w-6 h-6 text-[#004B4F]" />,
    title: 'Fixed Cashless Fares',
    description:
      'No cash arguments, no change disputes, and no random price hikes. Pay instantly from your pre-loaded in-app wallet at standard, transparent flat rates.',
  },
];

export default function ProblemsSolving() {
  return (
    <section id="services" className="py-16 px-4 sm:px-6 md:px-8 bg-white">
      {/* ── Main Rounded Container Canvas ─────────────────────────── */}
      <div className="max-w-7xl mx-auto rounded-[2.5rem] p-8 sm:p-12 md:p-16 ">
        
        {/* Top Header Row: Title & Subtitle Left, CTA Right */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Why Wheelnabl?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Internal mobility reimagined for Gulf Estate residents. Experience reliable, zero-emission intra-estate transit engineered around resident comfort, cleanliness, and peace of mind.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#1B382B] hover:bg-[#12261D] text-white text-xs sm:text-sm font-semibold px-7 py-3 rounded-full transition shadow-sm active:scale-95"
            >
              Join Now
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CARDS.map((card) => {
            if (card.isFeatured) {
              return (
                /* Primary Active / Dark Highlight Card */
                <div
                  key={card.id}
                  className="rounded-[2rem] bg-[#1B382B] text-white p-7 sm:p-8 flex flex-col justify-between shadow-lg shadow-emerald-950/15 min-h-[360px]"
                >
                  <div>
                    <div className="mb-6 inline-block text-emerald-300">
                      {card.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/signup"
                      className="inline-block w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition backdrop-blur-xs"
                    >
                      Join Now
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              /* Light Companion Cards */
              <div
                key={card.id}
                className="rounded-[2rem] bg-[#DDE9E2] text-slate-900 p-7 sm:p-8 flex flex-col justify-between min-h-[360px] border border-emerald-950/5 hover:border-emerald-900/20 transition-all duration-200"
              >
                <div>
                  <div className="mb-6 inline-block">
                    {card.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href="/signup"
                    className="inline-block w-full sm:w-auto text-center bg-[#1B382B] hover:bg-[#12261D] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition shadow-xs"
                  >
                    Join Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}