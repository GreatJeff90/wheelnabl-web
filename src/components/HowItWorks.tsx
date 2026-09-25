'use client';

import Link from 'next/link';
import { Smartphone, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface Step {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    step: 'Step 01',
    icon: <Smartphone className="w-5 h-5 text-[#004B4F]" />,
    title: 'Pin Your Location',
    description:
      'Choose your pickup street, phase, or gatehouse inside Gulf Estate directly from your phone.',
  },
  {
    step: 'Step 02',
    icon: <Zap className="w-5 h-5 text-[#FF7A00]" />,
    title: 'Instant Electric Dispatch',
    description:
      'A quiet, vetted electric cab is dispatched immediately to your exact estate coordinates.',
  },
  {
    step: 'Step 03',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    title: 'Cashless Drop-off',
    description:
      'Reach your destination or gate clearance smoothly with automatic wallet fare deduction.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-14 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">
              Simple Three-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
              How Wheelnabl Works
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            Designed exclusively for Gulf Estate. Getting from your doorstep to the gate or clubhouse takes less than a minute.
          </p>
        </div>

        {/* 3 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col justify-between p-8 rounded-[2rem] bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-900">
                  Estate Perimeter Only
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-14 p-8 sm:p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl sm:text-2xl font-bold">
              Ready to ride clean and quiet?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create an account or book your electric cab in seconds.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full transition shadow-md shadow-orange-500/20 active:scale-95 shrink-0"
          >
            <span>Book a Ride</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}