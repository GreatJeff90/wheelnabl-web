'use client';

/**
 * Driver Cockpit notification layer.
 *
 * Two concerns:
 * 1. A synthesized dispatch chime using the Web Audio API (no external sound
 *    files). Two-tone sine oscillator: 880 Hz -> 1174 Hz.
 * 2. Browser push notifications via the Notification API, used to surface an
 *    incoming ride to the driver even when the tab is backgrounded.
 *
 * Both layers are safe to call from a server-rendered route: every function
 * short-circuits when `window`/`document` is unavailable (SSR / test env).
 */

// ── Dispatch chime (Web Audio API) ────────────────────────────────────────

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;
  const AudioContextCtor =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  audioContext = new AudioContextCtor();
  return audioContext;
}

/**
 * Play the two-tone dispatch chime.
 *
 * Renders two sine oscillators chained together: a 880 Hz tone for 0.18s
 * followed immediately by a 1174 Hz tone for 0.18s. Each tone ramps its gain
 * from 0 -> 0.3 -> 0 so the sound swells and fades cleanly without a click.
 *
 * The AudioContext is created lazily and resumed on demand — browsers block
 * AudioContext until a user gesture, and the driver toggling "On-Duty" is a
 * user gesture, so the first chime after going online plays correctly.
 */
export function playDispatchChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume a suspended context (common after the first user gesture).
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {
      /* best-effort: ignore resume failures */
    });
  }

  const now = ctx.currentTime;
  const tones: { freq: number; start: number; duration: number }[] = [
    { freq: 880, start: now, duration: 0.18 },
    { freq: 1174, start: now + 0.18, duration: 0.18 },
  ];

  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(tone.freq, tone.start);

    // Gain envelope: 0 -> 0.3 at 20% of the tone, then 0 -> 0 by the end.
    const peak = 0.3;
    gain.gain.setValueAtTime(0, tone.start);
    gain.gain.linearRampToValueAtTime(peak, tone.start + tone.duration * 0.2);
    gain.gain.linearRampToValueAtTime(0, tone.start + tone.duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(tone.start);
    osc.stop(tone.start + tone.duration + 0.02);
  }
}

// ── Browser push notifications ────────────────────────────────────────────

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

/**
 * Return the current Notification permission state.
 * Returns 'denied' in environments without the Notification API.
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return window.Notification.permission as NotificationPermissionState;
}

/**
 * Request permission to show browser notifications.
 *
 * Calling `Notification.requestPermission()` from a non-user gesture can
 * trigger a browser prompt that the driver dismisses. This is intentionally a
 * separate, explicit call so the driver cockpit only asks when the driver
 * toggles "On-Duty".
 *
 * Returns the resulting permission state.
 */
export function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }
  return window.Notification.requestPermission() as Promise<NotificationPermissionState>;
}

/**
 * Show a browser push notification, if permission has been granted.
 *
 * No-op when:
 *  - the environment lacks the Notification API (SSR / test),
 *  - permission is not 'granted',
 *  - the document is visible and the tab is focused (we don't nag an active
 *    driver — the cockpit already renders the incoming ride inline).
 *
 * The returned promise resolves once the notification is shown (or skipped).
 */
export function sendPushNotification(title: string, body: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve();
  }
  if (window.Notification.permission !== 'granted') return Promise.resolve();
  if (document.visibilityState === 'visible' && !document.hidden) return Promise.resolve();

  const notification = new window.Notification(title, {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'wheelnabl-dispatch',
  });

  // Auto-dismiss after 8 seconds so the driver isn't left with a stale chip.
  setTimeout(() => notification.close(), 8000);

  return Promise.resolve();
}