'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ActiveDriverState {
  driverId: string;
  fullName: string;
  phone?: string;
  badgeNumber?: string;
  sector?: string;
  cabNumber?: string;
  isOnline: boolean;
  battery?: number;
  updatedAt: string;
}

/**
 * Realtime driver presence & online status management using Supabase Realtime Presence.
 *
 * Driver mode (`mode = 'driver'`):
 *  - Broadcasts the local driver's presence state (online/offline, sector, cab info)
 *    to the `estate_driver_presence` Realtime presence channel.
 *
 * Resident mode (`mode = 'resident'`):
 *  - Subscribes to `estate_driver_presence` channel presence state.
 *  - Tracks joining/leaving drivers in real time.
 *  - Provides `onlineDrivers` array and `onlineCount`.
 */
export function useDriverPresence(
  mode: 'resident' | 'driver',
  localDriverData?: Partial<ActiveDriverState>
) {
  const [onlineDrivers, setOnlineDrivers] = useState<ActiveDriverState[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let active = true;

    if (mode === 'driver') {
      if (!localDriverData?.driverId) return;

      const driverId = localDriverData.driverId;
      const isOnline = localDriverData.isOnline ?? true;

      // Create Presence channel for sub-second presence broadcast across clients
      const channel = supabase.channel('estate_driver_presence', {
        config: {
          presence: {
            key: driverId,
          },
        },
      });

      channelRef.current = channel;

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && active) {
          const payload: ActiveDriverState = {
            driverId,
            fullName: localDriverData.fullName || 'Fleet Driver',
            phone: localDriverData.phone || '+234 800 000 0000',
            badgeNumber: localDriverData.badgeNumber || 'WNB-DRV-084',
            sector: localDriverData.sector || 'Golf Estate Patrol Sector',
            cabNumber: localDriverData.cabNumber || 'EV Cab #04',
            isOnline,
            battery: localDriverData.battery ?? 85,
            updatedAt: new Date().toISOString(),
          };

          if (isOnline) {
            await channel.track(payload);
          } else {
            await channel.untrack();
          }
        }
      });

      return () => {
        active = false;
        if (channelRef.current) {
          channelRef.current.untrack();
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } else {
      // mode === 'resident'
      // Load initial drivers from profiles (selecting safely available columns)
      async function loadInitialDrivers() {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, badge_number');

          if (!error && data && active) {
            const mapped: ActiveDriverState[] = data.map((d, index) => ({
              driverId: d.id,
              fullName: d.full_name || `Driver #${index + 1}`,
              badgeNumber: d.badge_number || `WNB-DRV-08${index + 1}`,
              sector: 'Phase 1 & Clubhouse Sector',
              cabNumber: `EV Cab #${String(index + 1).padStart(2, '0')}`,
              isOnline: true,
              battery: 80 + ((index * 5) % 20),
              updatedAt: new Date().toISOString(),
            }));

            // If presence state hasn't populated yet, provide baseline initial drivers
            setOnlineDrivers((prev) => (prev.length === 0 ? mapped : prev));
          }
        } catch (e) {
          console.error('Failed to load initial profiles for driver presence:', e);
        }
      }

      loadInitialDrivers();

      // Subscribe to Presence channel state
      const channel = supabase.channel('estate_driver_presence');
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          if (!active) return;
          const state = channel.presenceState<ActiveDriverState>();
          const presentList: ActiveDriverState[] = [];

          Object.keys(state).forEach((key) => {
            const presences = state[key];
            if (presences && presences.length > 0) {
              const latest = presences[presences.length - 1];
              if (latest.isOnline) {
                presentList.push(latest);
              }
            }
          });

          if (presentList.length > 0) {
            setOnlineDrivers(presentList);
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          if (!active) return;
          const joining = (newPresences as unknown as ActiveDriverState[]).filter(
            (p) => p.isOnline
          );
          if (joining.length > 0) {
            setOnlineDrivers((prev) => {
              const ids = new Set(joining.map((j) => j.driverId));
              const filtered = prev.filter((p) => !ids.has(p.driverId));
              return [...joining, ...filtered];
            });
          }
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          if (!active) return;
          const leftIds = new Set(
            (leftPresences as unknown as ActiveDriverState[]).map(
              (p) => p.driverId
            )
          );
          setOnlineDrivers((prev) =>
            prev.filter((p) => !leftIds.has(p.driverId))
          );
        })
        .subscribe();

      return () => {
        active = false;
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }
  }, [
    mode,
    localDriverData?.driverId,
    localDriverData?.isOnline,
    localDriverData?.fullName,
    localDriverData?.phone,
    localDriverData?.badgeNumber,
    localDriverData?.sector,
    localDriverData?.cabNumber,
    localDriverData?.battery,
  ]);

  return { onlineDrivers, onlineCount: onlineDrivers.length };
}
