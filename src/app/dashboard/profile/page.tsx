'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
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

  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    email: '',
    full_name: 'Resident Member',
    phone: 'Not provided',
    estate_zone: 'Golf Estate, Phase 1',
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

        const formattedRegDate = user.created_at
          ? new Date(user.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'Active Member';

        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, estate_zone, house_number, wallet_balance')
          .eq('id', user.id)
          .maybeSingle();

        const resolvedName =
          dbProfile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'greatjeff90');

        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: resolvedName,
          phone: dbProfile?.phone || user.user_metadata?.phone || '+234 810 000 0000',
          estate_zone: dbProfile?.estate_zone || user.user_metadata?.estate_zone || 'Golf Estate, Phase 1',
          house_number: dbProfile?.house_number || user.user_metadata?.house_number || 'Plot 14, Road 3B',
          reg_date: formattedRegDate,
          wallet_balance: Number(dbProfile?.wallet_balance ?? 0),
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

  const initials = (profile.full_name || 'Resident')
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#EDF0F8] text-slate-800 flex font-sans selection:bg-teal-100 selection:text-teal-900">
      <main className="flex-1 p-6 md:p-8 pb-28 md:pb-8 max-w-5xl mx-auto space-y-6 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Resident Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal resident credentials and verified estate transit preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full text-emerald-700 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Golf Resident
            </span>
          </div>
        </div>

        {/* ── Profile Details Card ──────────────────────── */}
        <div className="bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 relative">
          <button
            type="button"
            onClick={() => alert('Profile editing is synced with estate administration')}
            aria-label="Edit Profile"
            className="absolute top-7 right-7 w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#004B4F] to-[#008A70] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-teal-950/15">
                {initials}
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {profile.full_name}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Golf Estate Registered Fast-Pass Transit ID
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 pt-2 text-xs text-slate-600">
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

        {/* ── Frequent Routes with Timeline ──────────── */}
        <div className="bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Frequent Intra-Estate Routes
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick booking shortcuts for your daily estate travel</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">3 active presets</span>
          </div>

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
                    type="button"
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
                  <h4 className="text-xs font-bold text-slate-900">Residence → Golf Estate Clubhouse</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Gym, swimming pool & tennis court access</p>
                  <span className="text-[10px] font-bold text-slate-700 mt-1 inline-block">₦500 Flat Shuttle</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Recreation
                  </span>
                  <button
                    type="button"
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
                    type="button"
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

      </main>
    </div>
  );
}