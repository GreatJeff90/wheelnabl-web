'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PWA Install Prompt component.
 *
 * Handles:
 * 1. Standard browser 'beforeinstallprompt' (Android, Chrome/Edge Desktop)
 * 2. Manual instructions for iOS Safari (Add to Home Screen)
 * 3. Hiding when the app is already running in 'standalone' mode.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);

  useEffect(() => {
    // 1. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (isStandalone) return; // Already installed/standalone

    if (isIos) {
      setPlatform('ios');
      // Show iOS prompt after a slight delay to avoid jarring the user
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 10000);
        return () => clearTimeout(timer);
      }
    }

    // 2. Listen for native browser prompt (Android/Desktop Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform(ua.includes('android') ? 'android' : 'desktop');

      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger the native prompt
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days so we don't nag
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-96 z-[999]"
      >
        <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-900/40 border border-slate-800 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20">
                  <Download className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-teal-400">Install Wheelnabl</h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-tight mt-0.5">Download to your home screen for the best experience.</p>
                </div>
              </div>
              <button
                onClick={dismissPrompt}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {platform === 'ios' ? (
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">iOS Instructions</p>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-teal-400" />
                    <span>Tap Share</span>
                  </div>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="flex items-center gap-1.5">
                    <PlusSquare className="w-4 h-4 text-teal-400" />
                    <span>Add to Home Screen</span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-colors flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                Download App
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}