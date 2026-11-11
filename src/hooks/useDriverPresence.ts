'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ActiveDriverState {
  driverId: string;
  fullName: string;
<<<<<<< HEAD
  phone: string;
  badgeNumber: string;
  sector: string;
  cabNumber: string;
  isOnline: boolean;
  battery: number;
  lat?: number;
  lng?: number;
=======
  phone?: string;
  badgeNumber?: string;
  sector?: string;
  cabNumber?: string;
  isOnline: boolean;
  battery?: number;
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
  updatedAt: string;
}

/**
<<<<<<< HEAD
 * Realtime driver presence & online state management.
 *
 * Driver mode (`mode = 'driver'`):
 *  - Broadcasts the local driver's presence state (online/offline, sector, battery)
 *    to the `estate_driver_presence` Realtime channel.
 *  - Also updates `profiles.is_online` in Postgres for persistence across reloads.
 *
 * Resident mode (`mode = 'resident'`):
 *  - Subscribes to `estate_driver_presence` channel presence states.
 *  - Combines real-time presence with a initial query to `profiles` where `role = 'driver'`.
 *  - Deduplicates and returns an array of currently active online drivers.
=======
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
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
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

<<<<<<< HEAD
      // 1. Update Postgres profile so persistent queries pick up the online status
      supabase
        .from('profiles')
        .update({
          is_online: isOnline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId)
        .then(({ error }) => {
          if (error) {
            // Ignore schema missing column gracefully
            console.debug('profiles.is_online column optional:', error.message);
          }
        });

      // 2. Setup Supabase Realtime Presence Channel for sub-second presence sync
=======
      // Create Presence channel for sub-second presence broadcast across clients
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
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
<<<<<<< HEAD
            phone: localDriverData.phone || '+234 810 000 0000',
=======
            phone: localDriverData.phone || '+234 800 000 0000',
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
            badgeNumber: localDriverData.badgeNumber || 'WNB-DRV-084',
            sector: localDriverData.sector || 'Golf Estate Patrol Sector',
            cabNumber: localDriverData.cabNumber || 'EV Cab #04',
            isOnline,
<<<<<<< HEAD
            battery: localDriverData.battery ?? 82,
=======
            battery: localDriverData.battery ?? 85,
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
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
<<<<<<< HEAD
      // 1. First fetch drivers from database
=======
      // Load initial drivers from profiles (selecting safely available columns)
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
      async function loadInitialDrivers() {
        try {
          const { data, error } = await supabase
            .from('profiles')
<<<<<<< HEAD
            .select('id, full_name, phone, badge_number, estate_zone, is_online')
            .eq('role', 'driver');
=======
            .select('id, full_name, badge_number');
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20

          if (!error && data && active) {
            const mapped: ActiveDriverState[] = data.map((d, index) => ({
              driverId: d.id,
              fullName: d.full_name || `Driver #${index + 1}`,
<<<<<<< HEAD
              phone: d.phone || '+234 810 000 0000',
              badgeNumber: d.badge_number || `WNB-DRV-08${index + 1}`,
              sector: d.estate_zone || 'Phase 1 Gatehouse',
              cabNumber: `EV Cab #${String(index + 1).padStart(2, '0')}`,
              isOnline: d.is_online ?? true, // fallback to active
              battery: 80 + (index * 4) % 20,
              updatedAt: new Date().toISOString(),
            }));

            setOnlineDrivers(mapped.filter((d) => d.isOnline));
          }
        } catch (e) {
          console.error('Failed to load initial online drivers:', e);
=======
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
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
        }
      }

      loadInitialDrivers();

<<<<<<< HEAD
      // 2. Subscribe to Presence state on the channel
=======
      // Subscribe to Presence channel state
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
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

<<<<<<< HEAD
  return { onlineDrivers };
}
=======
  return { onlineDrivers, onlineCount: onlineDrivers.length };
}
>>>>>>> f3e5972a8d5ee6cd148b7c8afb14664e618b3c20
