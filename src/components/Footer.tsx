'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Zap, ShieldCheck, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-16 pb-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-slate-100">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-dark.png"
                alt="Wheelnabl"
                width={130}
                height={35}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Quiet, zero-emission intra-estate transit engineered exclusively for Gulf Estate, Port Harcourt. Moving residents with safety and ease.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                100% Electric Fleet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-[#004B4F] border border-teal-100">
                <ShieldCheck className="w-3.5 h-3.5 text-[#004B4F]" />
                Vetted Drivers
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-teal-950 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-teal-950 transition">
                  Why Wheelnabl
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-teal-950 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-teal-950 transition inline-flex items-center gap-1">
                  Resident Portal <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-teal-950 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-teal-950 transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-teal-950 transition">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>

          {/* Estate Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Estate Desk
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Gulf Estate, Peter Odili Rd, Port Harcourt</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Security Dispatch Line</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>support@wheelnabl.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Wheelnabl. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 transition cursor-pointer">Estate Transit Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}