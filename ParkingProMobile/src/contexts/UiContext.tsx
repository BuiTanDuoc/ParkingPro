import React, { createContext, useContext, useMemo, useState } from 'react';

interface PreferredSlot {
  slotId: string;
  slotCode: string;
}

interface UiContextValue {
  preferredCheckInSlot: PreferredSlot | null;
  setPreferredCheckInSlot: (slot: PreferredSlot | null) => void;
}

const UiContext = createContext<UiContextValue | undefined>(undefined);

/**
 * State thuần trong bộ nhớ (không lưu AsyncStorage) — chỉ dùng để chuyển ý định
 * "check-in vào slot X" từ menu hành động trên sơ đồ bãi xe sang tab Check-in.
 */
export function UiProvider({ children }: { children: React.ReactNode }) {
  const [preferredCheckInSlot, setPreferredCheckInSlot] = useState<PreferredSlot | null>(null);

  const value = useMemo(
    () => ({ preferredCheckInSlot, setPreferredCheckInSlot }),
    [preferredCheckInSlot],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi phải được dùng bên trong UiProvider');
  return ctx;
}
