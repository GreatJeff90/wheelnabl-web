'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  highlightColor: string;
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
      'Safe, reliable transport for school pickups at the front gate or trips to children’s play parks inside Golf Estate without relying on unpredictable external operators.',
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const topPillsVariants: Variants = {
  hidden: { opacity: 0, y: -20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const leftColumnVariants: Variants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 100,
    },
  },
};

const rightColumnVariants: Variants = {
  hidden: { opacity: 0, x: 30, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 100,
    },
  },
};

const cardSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    y: 20,
    scale: 0.94,
    opacity: 0,
    rotate: direction > 0 ? 3 : -3,
  }),
  center: {
    zIndex: 1,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 26,
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 60 : -60,
    y: -20,
    scale: 0.94,
    opacity: 0,
    rotate: direction < 0 ? 3 : -3,
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  }),
};

export default function WhosItFor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const activeItem = AUDIENCE[activeIndex];

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % AUDIENCE.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + AUDIENCE.length) % AUDIENCE.length);
  };

  const handleSelectPill = (idx: number) => {
    setDirection(idx > activeIndex ? 1 : -1);
    setActiveIndex(idx);
  };

  return (
    <section id="who-its-for" className="py-24 px-4 sm:px-6 md:px-8 bg-white border-t border-slate-100 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        
        {/* Top Category Filter Pills with Floating Selection Bubble */}
        <motion.div variants={topPillsVariants} className="flex items-center justify-center mb-16">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100/80 rounded-full border border-slate-200/60 max-w-full">
            {AUDIENCE.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleSelectPill(idx)}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                  activeIndex === idx ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {activeIndex === idx && (
                  <motion.span
                    layoutId="activeAudiencePill"
                    className="absolute inset-0 bg-slate-900 rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.pillLabel}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3-Column Centralized Stack Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Title & Hook */}
          <motion.div variants={leftColumnVariants} className="lg:col-span-4 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">
              Built for Golf Estate
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                aria-label="Previous audience"
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                aria-label="Next audience"
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              <span className="text-xs font-semibold text-slate-400 ml-2">
                0{activeIndex + 1} / 0{AUDIENCE.length}
              </span>
            </div>
          </motion.div>

          {/* Center Column: The Central Layered Stack Deck */}
          <div className="lg:col-span-4 flex justify-center py-6">
            <div className="relative w-full max-w-[320px] h-[450px]">
              
              {/* Stack effect tabs preview at the top */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[82%] h-4 bg-teal-900/30 rounded-t-2xl pointer-events-none" />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-teal-800/40 rounded-t-2xl pointer-events-none" />
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[96%] h-3 bg-teal-700/60 rounded-t-2xl pointer-events-none" />

              {/* Main Active Stack Card with Framer Motion AnimatePresence */}
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeItem.id}
                  custom={direction}
                  variants={cardSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={`w-full h-full rounded-[2.5rem] p-7 flex flex-col justify-between shadow-2xl relative z-10 ${activeItem.highlightColor} ${activeItem.textColor}`}
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
                      Golf Estate Fleet Protocol
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Dynamic Context + Call to Action */}
          <motion.div variants={rightColumnVariants} className="lg:col-span-4 text-center lg:text-left pl-0 lg:pl-6 space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Tailored Experience</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-lg font-bold text-slate-900">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Optimized for Golf Estate gates, residences, and internal avenues.
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Pill CTA button matching the visual inspiration */}
            <div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="inline-block"
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-3 rounded-full transition-colors shadow-sm cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </section>
  );
}