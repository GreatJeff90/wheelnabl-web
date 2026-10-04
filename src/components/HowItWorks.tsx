'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
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
      'Choose your pickup street, phase, or gatehouse inside Golf Estate directly from your phone.',
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 25, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stepCardVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 22,
      stiffness: 110,
    },
  },
};

const bannerVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 100,
      delay: 0.1,
    },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 md:px-8 bg-white overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        
        {/* Header Block */}
        <motion.div
          variants={headerVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-14 border-b border-slate-100"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">
              Simple Three-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mt-2">
              How Wheelnabl Works
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            Designed exclusively for Golf Estate. Getting from your doorstep to the gate or clubhouse takes less than a minute.
          </p>
        </motion.div>

        {/* 3 Steps Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {STEPS.map((item) => (
            <motion.div
              key={item.step}
              variants={stepCardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
              className="flex flex-col justify-between p-8 rounded-[2rem] bg-slate-50/70 border border-slate-100 hover:border-slate-200/80 hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {item.step}
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs border border-slate-100 group-hover:shadow-md transition-shadow"
                  >
                    {item.icon}
                  </motion.div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#004B4F] transition-colors">
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
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <motion.div
          variants={bannerVariants}
          className="mt-14 p-8 sm:p-10 rounded-[2.5rem] bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/10 relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center sm:text-left">
            <h4 className="text-xl sm:text-2xl font-bold">
              Ready to ride clean and quiet?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Create an account or book your electric cab in seconds.
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="relative z-10 shrink-0"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full transition-colors shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <span>Book a Ride</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

      </motion.div>
    </section>
  );
}