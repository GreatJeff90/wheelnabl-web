'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface UseRealtimeRowsOptions<T> {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  initialRows?: T[];
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
  enabled?: boolean;
}

export function useRealtimeRows<T extends { id: string }>(
  options: UseRealtimeRowsOptions<T>
) {
  const {
    table,
    filter,
    event = '*',
    initialRows = [],
    onInsert,
    onUpdate,
    onDelete,
    enabled = true,
  } = options;

  const [rows, setRows] = useState<T[]>(initialRows);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const optsRef = useRef({ onInsert, onUpdate, onDelete });
  optsRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const channel = supabase.channel(
      `rt_${table}_${Math.random().toString(36).slice(2, 10)}`
    );
    channelRef.current = channel;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apply = (payload: any) => {
      if (!active) return;
      const { eventType, new: newRow, old: oldRow } = payload;
      const opts = optsRef.current;

      if (eventType === 'INSERT' && newRow) {
        opts.onInsert?.(newRow);
        setRows((prev) => {
          if (prev.some((r) => r.id === newRow.id)) return prev;
          return [newRow, ...prev];
        });
      } else if (eventType === 'UPDATE' && newRow) {
        opts.onUpdate?.(newRow);
        setRows((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
      } else if (eventType === 'DELETE' && oldRow) {
        opts.onDelete?.(oldRow);
        setRows((prev) => prev.filter((r) => r.id !== oldRow.id));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = { schema: 'public', table };
    if (event !== '*') config.event = event;
    if (filter) config.filter = filter;

    channel.on('postgres_changes', config, apply).subscribe();

    return () => {
      active = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, table, filter, event]);

  return { rows, setRows, channelRef };
}