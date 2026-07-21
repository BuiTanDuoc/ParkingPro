import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { HUB_URL } from '../config/env';
import { getAccessToken } from '../utils/storage';
import {
  SessionCheckedInEvent,
  SessionCheckedOutEvent,
  SlotStatusChangedEvent,
} from '../types/api';

export type HubConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

interface UseParkingHubOptions {
  parkingLotId: string | null;
  onSlotStatusChanged?: (evt: SlotStatusChangedEvent) => void;
  onSessionCheckedIn?: (evt: SessionCheckedInEvent) => void;
  onSessionCheckedOut?: (evt: SessionCheckedOutEvent) => void;
}

/**
 * Kết nối tới ParkingHub ("/hubs/parking"), join group "lot-{id}" và lắng nghe
 * 3 sự kiện realtime: SlotStatusChanged, SessionCheckedIn, SessionCheckedOut.
 * Tự động reconnect khi mất mạng (withAutomaticReconnect).
 */
export function useParkingHub({
  parkingLotId,
  onSlotStatusChanged,
  onSessionCheckedIn,
  onSessionCheckedOut,
}: UseParkingHubOptions) {
  const [connectionState, setConnectionState] = useState<HubConnectionState>('disconnected');
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  // Giữ callback mới nhất trong ref để không phải re-subscribe mỗi lần cha re-render
  const callbacksRef = useRef({ onSlotStatusChanged, onSessionCheckedIn, onSessionCheckedOut });
  callbacksRef.current = { onSlotStatusChanged, onSessionCheckedIn, onSessionCheckedOut };

  useEffect(() => {
    if (!parkingLotId) return;
    let isCancelled = false;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: async () => (await getAccessToken()) ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 15000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('SlotStatusChanged', (evt: SlotStatusChangedEvent) =>
      callbacksRef.current.onSlotStatusChanged?.(evt),
    );
    connection.on('SessionCheckedIn', (evt: SessionCheckedInEvent) =>
      callbacksRef.current.onSessionCheckedIn?.(evt),
    );
    connection.on('SessionCheckedOut', (evt: SessionCheckedOutEvent) =>
      callbacksRef.current.onSessionCheckedOut?.(evt),
    );

    connection.onreconnecting(() => !isCancelled && setConnectionState('reconnecting'));
    connection.onreconnected(async () => {
      if (isCancelled) return;
      await connection.invoke('JoinLotGroup', parkingLotId).catch(() => {});
      setConnectionState('connected');
    });
    connection.onclose(() => !isCancelled && setConnectionState('disconnected'));

    (async () => {
      try {
        setConnectionState('connecting');
        await connection.start();
        await connection.invoke('JoinLotGroup', parkingLotId);
        if (!isCancelled) setConnectionState('connected');
      } catch {
        if (!isCancelled) setConnectionState('disconnected');
      }
    })();

    return () => {
      isCancelled = true;
      connection.invoke('LeaveLotGroup', parkingLotId).catch(() => {});
      connection.stop();
      connectionRef.current = null;
    };
  }, [parkingLotId]);

  return { connectionState };
}
