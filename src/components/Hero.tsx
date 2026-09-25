'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center overflow-hidden bg-white px-6 pt-10 pb-8">
      
      {/* ── Background Concentric Rings ────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-slate-100/90" />
        <div className="absolute w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full border border-slate-100/80" />
        <div className="absolute w-[760px] h-[760px] sm:w-[940px] sm:h-[940px] rounded-full border border-slate-100/60" />
        <div className="absolute w-[1020px] h-[1020px] sm:w-[1240px] sm:h-[1240px] rounded-full border border-slate-50" />
      </div>

      {/* ── Central Main Heading ──────────────────────────────── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto pt-2">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-teal-950">
          Welcome <br />
          <span className="font-extrabold text-[#004B4F]">To Wheelnabl</span>
        </h1>
      </div>

      {/* ── Middle Stage: Left Tagline, Center Image, Right CTAs ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-4">
        
        {/* Left Side: Short Tagline */}
        <div className="md:col-span-3 text-center md:text-left order-2 md:order-1">
          <p className="text-lg sm:text-xl font-medium text-slate-700 leading-snug">
            Estate transit <br />
            simplified for you.
          </p>
          <span className="inline-block mt-3 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100/60 px-3 py-1 rounded-full">
            Gulf Estate • Port Harcourt
          </span>
        </div>

        {/* Center: Real Handheld Device Graphic */}
        <div className="md:col-span-6 flex justify-center items-center order-1 md:order-2">
          <div className="relative w-[280px] sm:w-[330px] md:w-[360px] h-[380px] sm:h-[440px] md:h-[480px]">
            <Image
              src="/hero.png"
              alt="Wheelnabl App on Mobile"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Right Side: Store Badges & Launch CTAs */}
        <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left space-y-4 order-3">
          <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
            Move seamlessly within Gulf Estate.
          </p>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full max-w-[200px]">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold py-3 px-4 rounded-full transition shadow-sm active:scale-95"
            >
              <span>Book Online</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-4 rounded-full transition shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gate Verified</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Minimal Bottom Divider Note ────────────────────────── */}
      <div className="relative z-10 text-center pt-2">
        <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
          Fast pickups • Pre-cleared security • Fixed estate pricing
        </span>
      </div>

    </section>
  );
}