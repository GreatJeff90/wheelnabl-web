'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
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
      'Eliminating noisy exhaust fumes and fuel pollution. Our custom zero-emission electric cabs ensure Golf Estate remains serene, clean, and quiet day and night.',
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 120,
    },
  },
};

export default function ProblemsSolving() {
  return (
    <section id="services" className="py-16 px-4 sm:px-6 md:px-8 bg-white overflow-hidden">
      {/* ── Main Container ────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto rounded-[2.5rem] p-8 sm:p-12 md:p-16"
      >
        {/* Top Header Row: Title & Subtitle Left, CTA Right */}
        <motion.div
          variants={headerVariants}
          className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 sm:mb-16"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Why Wheelnabl?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Internal mobility reimagined for Golf Estate residents. Experience reliable, zero-emission intra-estate transit engineered around resident comfort, cleanliness, and peace of mind.
            </p>
          </div>

          <div className="shrink-0">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#1B382B] hover:bg-[#12261D] text-white text-xs sm:text-sm font-semibold px-7 py-3 rounded-full transition-colors shadow-sm cursor-pointer"
              >
                Join Now
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CARDS.map((card) => {
            if (card.isFeatured) {
              return (
                /* Primary Active / Dark Highlight Card */
                <motion.div
                  key={card.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                  className="rounded-[2rem] bg-[#1B382B] text-white p-7 sm:p-8 flex flex-col justify-between shadow-xl shadow-emerald-950/20 min-h-[360px] relative overflow-hidden group"
                >
                  {/* Subtle Background Radial Glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="mb-6 inline-block text-emerald-300"
                    >
                      {card.icon}
                    </motion.div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-normal">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-6 relative z-10">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/signup"
                        className="inline-block w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors backdrop-blur-xs cursor-pointer border border-white/10"
                      >
                        Join Now
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            }

            return (
              /* Light Companion Cards */
              <motion.div
                key={card.id}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="rounded-[2rem] bg-[#DDE9E2] text-slate-900 p-7 sm:p-8 flex flex-col justify-between min-h-[360px] border border-emerald-950/5 hover:border-emerald-900/20 hover:shadow-lg hover:shadow-emerald-950/5 transition-colors duration-200 group"
              >
                <div>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className="mb-6 inline-block"
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/signup"
                      className="inline-block w-full sm:w-auto text-center bg-[#1B382B] hover:bg-[#12261D] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors shadow-xs cursor-pointer"
                    >
                      Join Now
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}