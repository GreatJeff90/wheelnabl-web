'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar, { DashboardTab } from '@/components/dashboard/Sidebar';
import {
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Lock,
  Loader2,
  ExternalLink,
  MessageCircle,
  Globe,
  Share2,
} from 'lucide-react';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  estate_zone: string;
  house_number: string;
  reg_date: string;
  wallet_balance: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    email: '',
    full_name: 'Resident Member',
    phone: 'Not provided',
    estate_zone: 'Gulf Estate, Phase 1',
    house_number: 'Unassigned Plot',
    reg_date: 'Recently Registered',
    wallet_balance: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/login');
          return;
        }

        // Format user account creation date dynamically from Supabase
        const formattedRegDate = user.created_at
          ? new Date(user.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'Active Member';

        // Query the profiles table for this specific authenticated user
        const { data: dbProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, estate_zone, house_number, wallet_balance')
          .eq('id', user.id)
          .single();

        // Resolve name: DB profile -> auth user metadata -> email prefix fallback
        const resolvedName =
          dbProfile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'Resident Member');

        const resolvedPhone =
          dbProfile?.phone ||
          user.phone ||
          user.user_metadata?.phone ||
          '+234 810 000 0000';

        const resolvedZone =
          dbProfile?.estate_zone ||
          user.user_metadata?.estate_zone ||
          'Gulf Estate, Phase 1';

        const resolvedHouse =
          dbProfile?.house_number ||
          user.user_metadata?.house_number ||
          'Plot 14, Road 3B';

        const resolvedBalance =
          dbProfile?.wallet_balance ??
          user.user_metadata?.wallet_balance ??
          0;

        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: resolvedName,
          phone: resolvedPhone,
          estate_zone: resolvedZone,
          house_number: resolvedHouse,
          reg_date: formattedRegDate,
          wallet_balance: resolvedBalance,
        });
      } catch (err) {
        console.error('Error fetching resident profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  // Derive initials from the dynamically loaded name
  const initials = (profile.full_name || 'Resident')
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Short 4-digit card identifier based on user ID
  const shortId = profile.id ? profile.id.slice(-4).toUpperCase() : '8492';

  return (
    <div className="min-h-screen bg-[#EDF0F8] text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 pb-28 md:pb-8 max-w-7xl mx-auto space-y-6 overflow-y-auto">
        
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Resident Profile
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 bg-white border border-slate-200/80 rounded-full text-emerald-700 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Gulf Resident
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── TOP LEFT: Profile Details Card (Col Span 8) ────────────── */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 relative">
            <button
              onClick={() => alert('Profile editing is synced with estate administration')}
              aria-label="Edit Profile"
              className="absolute top-7 right-7 w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Circular Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#004B4F] to-[#008A70] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-teal-950/15">
                  {initials}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              {/* Bio & Details Matrix */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {profile.full_name}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Gulf Estate Registered Fast-Pass Transit ID
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Member since: <strong className="text-slate-800 font-semibold">{profile.reg_date}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Zone: <strong className="text-slate-800 font-semibold">{profile.estate_zone}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Email: <strong className="text-slate-800 font-semibold">{profile.email}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Phone: <strong className="text-slate-800 font-semibold">{profile.phone}</strong></span>
                  </div>
                </div>

                {/* Social / Contact Badges */}
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-3">
                  {[
                    { icon: MessageCircle, label: 'Estate Chat' },
                    { icon: Globe, label: 'Resident Portal' },
                    { icon: Share2, label: 'Share Pass' },
                  ].map((btn, i) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        title={btn.label}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#004B4F] hover:text-white text-slate-600 transition flex items-center justify-center cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── TOP RIGHT: Payment & Transit Wallet (Col Span 4) ──────── */}
          <div className="lg:col-span-4 bg-white rounded-[2rem] p-7 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Payment Details</h3>
            
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Transit Card ID
              </p>
              <div className="mt-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 font-mono text-xs font-bold text-slate-700 tracking-wider">
                WNB •••• •••• {shortId}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Balance
              </p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">
                ₦{profile.wallet_balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Provider Brands Pill Row */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Supported Gateways
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">PAYSTACK</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700">VISA</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-orange-50 text-orange-700">MASTERCARD</span>
              </div>
            </div>
          </div>

          {/* ── BOTTOM LEFT: Frequent Routes with Timeline (Col Span 8) ─ */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Frequent Intra-Estate Routes
              </h3>
              <span className="text-xs text-slate-400 font-semibold">3 active presets</span>
            </div>

            {/* Timeline List */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
              
              {/* Route 1 */}
              <div className="relative">
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-[#004B4F] shadow-xs" />
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100/80 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Residence → Phase 1 Gatehouse</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Morning commute link to express highway</p>
                    <span className="text-[10px] font-bold text-[#004B4F] mt-1 inline-block">₦500 Flat Shuttle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Standard
                    </span>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-7 h-7 rounded-full bg-white text-slate-700 hover:bg-[#004B4F] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Route 2 */}
              <div className="relative">
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-slate-400 shadow-xs" />
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Residence → Gulf Estate Clubhouse</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Gym, swimming pool & tennis court access</p>
                    <span className="text-[10px] font-bold text-slate-700 mt-1 inline-block">₦500 Flat Shuttle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Recreation
                    </span>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-7 h-7 rounded-full bg-white text-slate-700 hover:bg-[#004B4F] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Route 3 */}
              <div className="relative">
                <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-slate-300 shadow-xs" />
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Direct Gate-to-Gate Phase 2 Transfer</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fast private EV direct transit</p>
                    <span className="text-[10px] font-bold text-[#FF7A00] mt-1 inline-block">₦2,500 Private EV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                      Express
                    </span>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-7 h-7 rounded-full bg-white text-slate-700 hover:bg-[#004B4F] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── BOTTOM RIGHT: Fast-Pass Subscription Card (Col Span 4) ─ */}
          <div className="lg:col-span-4 bg-[#004B4F] text-white rounded-[2rem] p-7 shadow-xl shadow-teal-950/20 flex flex-col justify-between min-h-[360px]">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200">
                  Estate Tier
                </span>
                <h3 className="text-xl font-black mt-1 leading-snug">
                  Wheelnabl Resident Pass
                </h3>
              </div>

              <ul className="space-y-2 text-xs text-teal-100/90">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Unlimited pre-cleared barrier pass</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Zero-emission priority cab dispatch</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Guest & visitor temporary passes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Monthly consolidated invoice billing</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => alert('Fast-pass is active for this account')}
                className="w-full bg-white text-slate-900 hover:bg-teal-50 font-bold text-xs py-3.5 rounded-full transition shadow-md active:scale-95 cursor-pointer"
              >
                Manage Membership
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}