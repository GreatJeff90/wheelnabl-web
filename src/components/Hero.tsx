'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const topFadeVariants: Variants = {
  hidden: { opacity: 0, y: -30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 100,
    },
  },
};

const leftFadeVariants: Variants = {
  hidden: { opacity: 0, x: -40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 90,
    },
  },
};

const rightFadeVariants: Variants = {
  hidden: { opacity: 0, x: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 90,
    },
  },
};

const centerGraphicVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 80,
    },
  },
};

const bottomFadeVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Hero() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-between items-center overflow-hidden bg-white px-6 pt-10 pb-8"
    >
      {/* ── Background Concentric Rings (Subtle Breathing Motion) ─ */}
      <motion.div
        animate={{
          scale: [1, 1.035, 1],
          opacity: [0.75, 1, 0.75],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <div className="w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full border border-slate-100/90" />
        <div className="absolute w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full border border-slate-100/80" />
        <div className="absolute w-[760px] h-[760px] sm:w-[940px] sm:h-[940px] rounded-full border border-slate-100/60" />
        <div className="absolute w-[1020px] h-[1020px] sm:w-[1240px] sm:h-[1240px] rounded-full border border-slate-50" />
      </motion.div>

      {/* ── Central Main Heading ──────────────────────────────── */}
      <motion.div
        variants={topFadeVariants}
        className="relative z-10 text-center max-w-4xl mx-auto pt-2"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-teal-950">
          Welcome <br />
          <span className="font-extrabold text-[#004B4F] bg-gradient-to-r from-[#004B4F] via-[#00695C] to-[#008A70] bg-clip-text text-transparent">
            To Wheelnabl
          </span>
        </h1>
      </motion.div>

      {/* ── Middle Stage: Left Tagline, Center Phone, Right CTAs ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-4">
        
        {/* Left Side: Tagline & Estate Badge */}
        <motion.div
          variants={leftFadeVariants}
          className="md:col-span-3 text-center md:text-left order-2 md:order-1"
        >
          <p className="text-lg sm:text-xl font-medium text-slate-700 leading-snug">
            Estate transit <br />
            simplified for you.
          </p>
          <motion.span
            whileHover={{ scale: 1.04 }}
            className="inline-flex items-center gap-2 mt-3.5 text-xs font-semibold text-teal-800 bg-teal-50/90 border border-teal-100/80 px-3.5 py-1.5 rounded-full shadow-2xs cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Golf Estate • Port Harcourt
          </motion.span>
        </motion.div>

        {/* Center: Device Graphic with Framer Floating Motion & Skeleton */}
        <motion.div
          variants={centerGraphicVariants}
          className="md:col-span-6 flex justify-center items-center order-1 md:order-2"
        >
          <div className="relative w-[280px] sm:w-[330px] md:w-[360px] h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center">
            
            {/* Shimmer Skeleton Placeholder before Image is ready */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-[240px] sm:w-[270px] h-[360px] sm:h-[420px] rounded-[2.5rem] bg-slate-100 border-[6px] border-slate-200/80 relative overflow-hidden shadow-xl shadow-slate-200/60">
                  {/* Framer Shimmer Ray */}
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  />
                  {/* Mock Skeleton Internal Wireframe */}
                  <div className="p-5 space-y-4 pt-10">
                    <div className="w-12 h-2.5 bg-slate-200 rounded-full mx-auto" />
                    <div className="w-full h-24 bg-white/80 rounded-2xl p-3 space-y-2 border border-slate-100">
                      <div className="w-16 h-2 bg-slate-200 rounded" />
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </div>
                    <div className="w-full h-12 bg-white/80 rounded-xl border border-slate-100" />
                    <div className="w-full h-12 bg-white/80 rounded-xl border border-slate-100" />
                  </div>
                </div>
              </div>
            )}

            {/* Continuous Floating Container */}
            <motion.div
              animate={
                imageLoaded
                  ? {
                      y: [-8, 8, -8],
                      rotate: [-0.5, 0.5, -0.5],
                    }
                  : {}
              }
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`w-full h-full relative transition-opacity duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src="/hero.png"
                alt="Wheelnabl App on Mobile"
                fill
                sizes="(max-width: 768px) 300px, 360px"
                className="object-contain drop-shadow-[0_25px_40px_rgba(0,40,40,0.18)] select-none"
                priority
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side: Action Badges & Launch CTAs */}
        <motion.div
          variants={rightFadeVariants}
          className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left space-y-4 order-3"
        >
          <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
            Move seamlessly within Golf Estate with zero emissions and zero wait times.
          </p>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full max-w-[200px]">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href="/dashboard"
                className="group w-full inline-flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs font-bold py-3.5 px-4 rounded-full transition-colors shadow-md shadow-orange-500/25 cursor-pointer"
              >
                <span>Book Online</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-semibold py-3.5 px-4 rounded-full shadow-xs cursor-default"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gate Verified</span>
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* ── Minimal Bottom Divider Note ────────────────────────── */}
      <motion.div
        variants={bottomFadeVariants}
        className="relative z-10 text-center pt-2"
      >
        <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
          Fast pickups • Pre-cleared security • Fixed estate pricing
        </span>
      </motion.div>

    </motion.section>
  );
}