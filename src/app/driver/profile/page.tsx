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
  BatteryCharging,
  Car,
  Award,
  Radio,
  X,
  Check,
} from 'lucide-react';

interface DriverProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  cab_id: string;
  estate_sector: string;
  badge_number: string;
  battery_level: number;
  reg_date: string;
  total_completed_trips: number;
  driver_rating: string;
}

export default function DriverProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<DriverProfileData>({
    id: '',
    email: '',
    full_name: 'Fleet Patrol Driver',
    phone: '+234 810 000 0000',
    cab_id: 'EV Cab #04',
    estate_sector: 'Phase 1 & Golf Clubhouse Sector',
    badge_number: 'WNB-DRV-084',
    battery_level: 82,
    reg_date: 'Active Fleet Member',
    total_completed_trips: 148,
    driver_rating: '4.95 ★',
  });

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCabId, setEditCabId] = useState('');
  const [editSector, setEditSector] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDriverProfile() {
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
          : 'Certified Fleet Member';

        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone, badge_number, estate_zone')
          .eq('id', user.id)
          .maybeSingle();

        const resolvedName =
          dbProfile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'Fleet Patrol Driver');

        const resolvedPhone = dbProfile?.phone || user.user_metadata?.phone || '+234 810 000 0000';
        const resolvedBadge = dbProfile?.badge_number || user.user_metadata?.badge_number || 'WNB-DRV-084';
        const resolvedSector = dbProfile?.estate_zone || 'Golf Estate Phase 1 & Clubhouse';
        const resolvedCabId = user.user_metadata?.cab_id || 'EV Cab #04';

        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: resolvedName,
          phone: resolvedPhone,
          cab_id: resolvedCabId,
          estate_sector: resolvedSector,
          badge_number: resolvedBadge,
          battery_level: 82,
          reg_date: formattedRegDate,
          total_completed_trips: 148,
          driver_rating: '4.95 ★',
        });

        setEditFullName(resolvedName);
        setEditPhone(resolvedPhone);
        setEditCabId(resolvedCabId);
        setEditSector(resolvedSector);
      } catch (err) {
        console.error('Error fetching driver profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDriverProfile();
  }, [router]);

  const handleOpenEdit = () => {
    setEditFullName(profile.full_name);
    setEditPhone(profile.phone);
    setEditCabId(profile.cab_id);
    setEditSector(profile.estate_sector);
    setSaveError(null);
    setIsEditOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.id) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          estate_zone: editSector.trim(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        full_name: editFullName.trim(),
        phone: editPhone.trim(),
        cab_id: editCabId.trim(),
        estate_sector: editSector.trim(),
      }));

      setIsEditOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update driver details';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#004B4F]" />
      </div>
    );
  }

  const initials = (profile.full_name || 'Driver')
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Driver Profile
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3.5 py-1.5 bg-white border border-slate-200/80 rounded-full text-emerald-700 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Gatehouse Cleared • Operator #{profile.badge_number.replace(/\D/g, '') || '084'}
            </span>
          </div>
        </div>

        {/* ── Driver Profile Card ──────────────────────── */}
        <div className="bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 relative">
          <button
            type="button"
            onClick={handleOpenEdit}
            aria-label="Edit Driver Profile"
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
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {profile.full_name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#004B4F] border border-teal-100">
                    {profile.cab_id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Certified since: <strong className="text-slate-800 font-semibold">{profile.reg_date}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Assigned Sector: <strong className="text-slate-800 font-semibold">{profile.estate_sector}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Email: <strong className="text-slate-800 font-semibold">{profile.email}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Dispatch Line: <strong className="text-slate-800 font-semibold">{profile.phone}</strong></span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-3">
                {[
                  { icon: MessageCircle, label: 'Control Room Chat' },
                  { icon: Globe, label: 'Driver Portal' },
                  { icon: Share2, label: 'Share Transit Badge' },
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

        {/* ── Vehicle Specs & Fleet Metrics Matrix ───── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#004B4F] shrink-0">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">EV Battery Status</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{profile.battery_level}% Charged</h3>
              <p className="text-[11px] text-teal-700 font-medium">Solar Bay 1 Fast-Linked</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF7A00] shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Runs Completed</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{profile.total_completed_trips} Trips</h3>
              <p className="text-[11px] text-slate-500">Zero Estate Violations</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resident Safety Rating</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{profile.driver_rating}</h3>
              <p className="text-[11px] text-emerald-700 font-medium">Top Tier Estate Driver</p>
            </div>
          </div>
        </div>

        {/* ── Patrol Routes & Sector Turnaround ──────── */}
        <div className="bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-200/60 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Assigned Intra-Estate Patrol Sectors
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Pre-cleared routes authorized for your EV patrol badge</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#004B4F] animate-pulse" />
              Active Shift Assigned
            </span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {/* Sector Route 1 */}
            <div className="relative">
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-[#004B4F] shadow-xs" />
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Phase 1 Gatehouse ⇄ Clubhouse & Sports Pavilion</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Primary transit artery • Speed limit 25 km/h strictly enforced</p>
                  <span className="text-[10px] font-bold text-[#004B4F] mt-1 inline-block">₦500 Flat Shuttle Payout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Priority Loop
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push('/driver')}
                    className="w-7 h-7 rounded-full bg-white text-slate-700 hover:bg-[#004B4F] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sector Route 2 */}
            <div className="relative">
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-slate-400 shadow-xs" />
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Road 4 Residential Zone ⇄ Main Gate Solar Bay</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Door-to-door resident pickups & visitor parking transfer</p>
                  <span className="text-[10px] font-bold text-slate-700 mt-1 inline-block">₦500 Flat Shuttle Payout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    Standard Route
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push('/driver')}
                    className="w-7 h-7 rounded-full bg-white text-slate-700 hover:bg-[#004B4F] hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sector Route 3 */}
            <div className="relative">
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-3 border-white bg-slate-300 shadow-xs" />
              <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Gate-to-Gate Phase 2 Direct Express EV</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Direct express transit with VIP priority barrier pass</p>
                  <span className="text-[10px] font-bold text-[#FF7A00] mt-1 inline-block">₦2,500 Private EV Payout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    Express EV
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push('/driver')}
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

      {/* ── Edit Driver Details Modal ────────────────── */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Driver Details</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Dispatch Line / Phone
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Assigned EV Cab Unit
                </label>
                <input
                  type="text"
                  required
                  value={editCabId}
                  onChange={(e) => setEditCabId(e.target.value)}
                  placeholder="e.g. EV Cab #04"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Patrol Sector / Zone
                </label>
                <input
                  type="text"
                  required
                  value={editSector}
                  onChange={(e) => setEditSector(e.target.value)}
                  placeholder="e.g. Phase 1 & Clubhouse Sector"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#004B4F] focus:bg-white transition"
                />
              </div>

              {saveError && (
                <p className="text-xs text-rose-600 font-medium">{saveError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#004B4F] hover:bg-[#00383b] text-white text-xs font-bold py-3.5 rounded-full transition shadow-md shadow-teal-950/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Driver Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}