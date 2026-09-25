'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('Reset link sent! Please check your email inbox.');
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

      <div className="relative z-10 w-full max-w-[390px]">
        
        {/* Main Phone-style White Card */}
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

          {/* Heading */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h1>
          <p className="text-xs text-slate-500 text-center mb-8 px-2 leading-relaxed">
            Enter your email address and we will send you a link to reset your account password.
          </p>

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

          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            
            {/* Email Input */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#0c3127] hover:bg-[#07241c] text-white text-sm font-semibold py-3.5 rounded-full transition shadow-md active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login Navigation */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Remember your password?{' '}
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
            className="text-xs font-medium text-slate-500 hover:text-teal-950 transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to homepage</span>
          </Link>
        </div>

      </div>
    </div>
  );
}