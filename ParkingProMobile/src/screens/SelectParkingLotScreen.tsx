import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useParkingLot } from '../contexts/ParkingLotContext';
import { parkingLotsApi } from '../api/parkingLotsApi';
import { ParkingLotDto } from '../types/api';
import { colors } from '../theme/colors';

export default function SelectParkingLotScreen() {
  const { setParkingLot } = useParkingLot();
  const { logout } = useAuth();
  const [lots, setLots] = useState<ParkingLotDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    parkingLotsApi
      .getAll()
      .then(async data => {
        setLots(data);
        // Chỉ có 1 bãi xe → tự chọn luôn, khỏi bắt người dùng bấm thêm một bước thừa
        if (data.length === 1) {
          await setParkingLot(data[0].id, data[0].name);
        }
      })
      .catch(() => setError('Không thể tải danh sách bãi xe. Kiểm tra kết nối mạng.'))
      .finally(() => setIsLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy 1 lần khi mount
  useEffect(load, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout} style={{ marginTop: 20 }}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn bãi xe</Text>
      <Text style={styles.hint}>Chọn bãi xe bạn phụ trách để tiếp tục.</Text>

      <FlatList
        data={lots}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.hint}>Chưa có bãi xe nào được thiết lập trong hệ thống.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setParkingLot(item.id, item.name)}>
            <Text style={styles.lotName}>{item.name}</Text>
            <Text style={styles.lotAddress}>{item.address}</Text>
            <Text style={styles.lotMeta}>{item.totalSlots} slot</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.logoutLink} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  hint: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 20 },
  error: { color: colors.danger, fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { color: colors.white, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  lotName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  lotAddress: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  lotMeta: { color: colors.primary, fontSize: 12, marginTop: 6, fontWeight: '600' },
  logoutLink: { alignItems: 'center', marginTop: 12 },
  logoutText: { color: colors.textMuted, fontSize: 13 },
});
