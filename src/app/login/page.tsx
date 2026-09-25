'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push('/dashboard');
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

      <div className="relative z-10 w-full max-w-[390px]">
        
        {/* Main Phone-style White Card */}
        <div className="bg-white rounded-[2.5rem] px-8 py-10 shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center">
          
          {/* Logo / Brand Mark */}
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
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Login</h1>

          {errorMsg && (
            <div className="w-full mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-4">
            
            {/* Email Input */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-5 py-3.5 focus-within:border-teal-800 transition shadow-xs">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="Email"
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
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right pt-1">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-slate-500 hover:text-teal-900 transition"
              >
                Forgot Password?
              </Link>
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
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center justify-center my-6">
            <span className="text-xs text-slate-400 font-medium">or</span>
          </div>

          {/* Social / Alternative Placeholders */}
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => alert('Social authentication coming soon')}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-full border border-slate-200/80 bg-slate-50/70 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
            >
              <span className="font-bold text-slate-900">G</span>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center py-3 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              Continue As Guest
            </button>
          </div>

          {/* Bottom Signup Navigation */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Need an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-slate-900 hover:text-teal-900 transition"
            >
              Sign up
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