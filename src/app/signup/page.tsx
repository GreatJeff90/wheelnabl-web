'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Car, Home, BadgeCheck } from 'lucide-react';

type UserRole = 'resident' | 'driver';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('resident');
  const [driverBadgeId, setDriverBadgeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanBadgeId = driverBadgeId.trim().toUpperCase();

    if (role === 'driver' && !cleanBadgeId) {
      setErrorMsg('Please enter your admin-issued Driver ID.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            badge_number: role === 'driver' ? cleanBadgeId : null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Upsert record into profiles table with role and badge ID
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          role: role,
          badge_number: role === 'driver' ? cleanBadgeId : null,
          wallet_balance: role === 'driver' ? 18500 : 3500,
        });
      }

      if (data.session) {
        // Dynamic route depending on role
        if (role === 'driver') {
          router.push('/driver');
        } else {
          router.push('/dashboard');
        }
      } else {
        setSuccessMsg(
          role === 'driver'
            ? 'Driver account registered! Check your email to verify and access the dispatch cockpit.'
            : 'Resident account created! Check your email to confirm your account.'
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="w-[380px] h-[380px] rounded-full border border-slate-200/50" />
        <div className="absolute w-[620px] h-[620px] rounded-full border border-slate-100" />
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        
        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] px-8 py-10 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
          
          {/* Logo */}
          <Link href="/" className="mb-6">
            <Image
              src="/logo.png"
              alt="Wheelnabl"
              width={140}
              height={38}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Role Toggle Selector */}
          <div className="w-full bg-slate-100 p-1 rounded-full flex items-center mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('resident');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                role === 'resident'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#004B4F]" />
              <span>Resident</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('driver');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                role === 'driver'
                  ? 'bg-[#004B4F] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Fleet Driver</span>
            </button>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {role === 'driver' ? 'Driver Registration' : 'Create Account'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {role === 'driver'
                ? 'Register with your estate-issued driver badge code'
                : 'Intra-estate transit made simple for residents'}
            </p>
          </div>

          {errorMsg && (
            <div className="w-full mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="w-full mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="w-full space-y-4">
            
            {/* Driver ID Input (Only shown when Fleet Driver is selected) */}
            {role === 'driver' && (
              <div className="flex items-center gap-3 bg-white border border-teal-800/30 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
                <BadgeCheck className="w-4 h-4 text-[#004B4F] shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Driver ID (e.g. WNB-DRV-084)"
                  value={driverBadgeId}
                  onChange={(e) => setDriverBadgeId(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none uppercase font-semibold"
                />
              </div>
            )}

            {/* Full Name Input */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                placeholder={role === 'driver' ? 'Driver Full Name' : 'Full Name'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Email Input */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder={role === 'driver' ? 'Driver Email' : 'Email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 text-white text-sm font-semibold py-3.5 rounded-full transition shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer ${
                role === 'driver'
                  ? 'bg-[#004B4F] hover:bg-[#00383b]'
                  : 'bg-[#0c3127] hover:bg-[#07241c]'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : role === 'driver' ? (
                'Register as Driver'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center justify-center my-6">
            <span className="text-xs text-slate-400 font-medium">or</span>
          </div>

          {/* Social Alternative */}
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => alert('Social registration coming soon')}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-full border border-slate-200/80 bg-slate-50/70 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              <span className="font-bold text-slate-900">G</span>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Bottom Login Navigation */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-slate-900 hover:text-teal-900 transition"
            >
              Log in
            </Link>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-xs font-medium text-slate-500 hover:text-teal-950 transition"
          >
            ← Return to homepage
          </Link>
        </div>

      </div>
    </div>
  );
}