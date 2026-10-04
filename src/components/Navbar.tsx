'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { ArrowUpRight, Menu, X, LogIn, LayoutDashboard, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userInitial, setUserInitial] = useState<string>('R');
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    // 1. Initial auth session fetch
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const name =
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split('@')[0] ||
            'Resident';
          setUserInitial(name.trim().charAt(0).toUpperCase());
        }
      } catch (err) {
        console.error('Error verifying auth status:', err);
      } finally {
        setLoadingUser(false);
      }
    }

    checkAuth();

    // 2. Real-time auth listener for instant UI updates on sign in/out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const name =
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split('@')[0] ||
          'Resident';
        setUserInitial(name.trim().charAt(0).toUpperCase());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { label: 'Why Wheelnabl', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Portal', href: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-dark.png"
            alt="Wheelnabl Logo"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-teal-950 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons: Dynamic Auth Switch */}
        <div className="hidden md:flex items-center gap-3">
          {!loadingUser && (
            user ? (
              <div className="flex items-center gap-3">
                {/* Dashboard Button */}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold px-4 py-2.5 rounded-full transition shadow-sm active:scale-95 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>Dashboard</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-teal-200" />
                </Link>

                {/* Profile Avatar / Link */}
                <Link
                  href="/dashboard/profile"
                  title="Resident Profile"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#004B4F] to-[#008A70] text-white flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-[#004B4F]/30 hover:ring-offset-2 transition cursor-pointer"
                >
                  {userInitial}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white text-sm font-semibold pl-5 pr-2 py-2 rounded-full transition shadow-md shadow-orange-500/10 active:scale-95 cursor-pointer"
              >
                <span>Login</span>
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            )
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-teal-950 rounded-lg focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 pt-4 pb-8 space-y-5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-800 hover:text-teal-900 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-2.5">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#004B4F] text-white text-sm font-bold py-3.5 rounded-full shadow-md transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                  <span>Go to Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold py-3 rounded-full transition"
                >
                  <UserIcon className="w-4 h-4 text-slate-600" />
                  <span>View Profile</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#FF7A00] text-white text-sm font-bold py-3.5 rounded-full shadow-md transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}