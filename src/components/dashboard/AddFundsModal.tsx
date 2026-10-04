'use client';

import { useState } from 'react';
import { X, Zap, Loader2, ArrowRight } from 'lucide-react';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function AddFundsModal({
  isOpen,
  onClose,
  userEmail,
  userId,
}: AddFundsModalProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleBachsPayment = async () => {
    if (!finalAmount || finalAmount < 100) {
      setErrorMsg('Minimum top-up amount is ₦100');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/funds/bachs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          email: userEmail,
          userId: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Redirect resident to Bachs secure hosted checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from Bachs.');
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Payment failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[11px] font-bold text-[#004B4F] mb-2">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Instant Balance Top-Up</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">Fund Transit Wallet</h2>
          <p className="text-xs text-slate-500">
            Powered by Bachs. Supports Cards, Bank Transfer, & Mobile Money.
          </p>
        </div>

        {/* Preset Amounts */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Preset Amount
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    finalAmount === preset && !customAmount
                      ? 'bg-[#004B4F] text-white shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Or Custom Amount (₦)
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-[#004B4F] focus-within:bg-white transition">
              <span className="text-slate-400 font-bold text-sm mr-2">₦</span>
              <input
                type="number"
                min="100"
                step="50"
                placeholder="e.g. 3500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-900 font-bold text-sm"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              {errorMsg}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleBachsPayment}
            className="w-full mt-2 bg-[#FF7A00] hover:bg-[#e66e00] text-white py-3.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Bachs...</span>
              </>
            ) : (
              <>
                <span>Pay ₦{finalAmount.toLocaleString()} with Bachs</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}