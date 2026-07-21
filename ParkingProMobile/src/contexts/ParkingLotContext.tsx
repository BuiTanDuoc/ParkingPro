import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * LƯU Ý: Backend hiện chưa có endpoint liệt kê danh sách bãi xe
 * (GET /api/parking-lots) — mọi endpoint slot/session/report đều nhận
 * parkingLotId như query param do FE tự truyền vào.
 *
 * Vì hệ thống hiện tại seed đúng 1 bãi xe ("Bãi xe Trung Tâm Quận 1"),
 * app lưu parkingLotId đã chọn vào local storage. Nhân viên copy Id này
 * từ Admin Web (trang Dashboard/ParkingMap) và dán vào màn "Cài đặt bãi xe"
 * khi đăng nhập lần đầu.
 *
 * TODO backend: thêm GET /api/parking-lots để app tự load danh sách,
 * tránh phải nhập tay.
 */

const KEY_LOT_ID = 'settings.parkingLotId';
const KEY_LOT_NAME = 'settings.parkingLotName';

interface ParkingLotContextValue {
  parkingLotId: string | null;
  parkingLotName: string | null;
  isLoading: boolean;
  setParkingLot: (id: string, name: string) => Promise<void>;
  clearParkingLot: () => Promise<void>;
}

const ParkingLotContext = createContext<ParkingLotContextValue | undefined>(undefined);

export function ParkingLotProvider({ children }: { children: React.ReactNode }) {
  const [parkingLotId, setParkingLotId] = useState<string | null>(null);
  const [parkingLotName, setParkingLotName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [id, name] = await AsyncStorage.multiGet([KEY_LOT_ID, KEY_LOT_NAME]).then(pairs =>
        pairs.map(([, v]) => v),
      );
      setParkingLotId(id);
      setParkingLotName(name);
      setIsLoading(false);
    })();
  }, []);

  const setParkingLot = async (id: string, name: string) => {
    await AsyncStorage.multiSet([
      [KEY_LOT_ID, id],
      [KEY_LOT_NAME, name],
    ]);
    setParkingLotId(id);
    setParkingLotName(name);
  };

  const clearParkingLot = async () => {
    await AsyncStorage.multiRemove([KEY_LOT_ID, KEY_LOT_NAME]);
    setParkingLotId(null);
    setParkingLotName(null);
  };

  const value = useMemo(
    () => ({ parkingLotId, parkingLotName, isLoading, setParkingLot, clearParkingLot }),
    [parkingLotId, parkingLotName, isLoading],
  );

  return <ParkingLotContext.Provider value={value}>{children}</ParkingLotContext.Provider>;
}

export function useParkingLot(): ParkingLotContextValue {
  const ctx = useContext(ParkingLotContext);
  if (!ctx) throw new Error('useParkingLot phải được dùng bên trong ParkingLotProvider');
  return ctx;
}
