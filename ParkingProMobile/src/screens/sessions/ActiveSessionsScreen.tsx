import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { sessionsApi } from '../../api/sessionsApi';
import { ParkingSessionDto } from '../../types/api';
import { colors, sessionTypeLabel } from '../../theme/colors';
import { formatDateTime, formatDuration } from '../../utils/format';
import { RootStackParamList } from '../../navigation/types';

export default function ActiveSessionsScreen() {
  const { parkingLotId } = useParkingLot();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sessions, setSessions] = useState<ParkingSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!parkingLotId) return;
    const res = await sessionsApi.getActive(parkingLotId, 1, 100);
    setSessions(res.items);
  }, [parkingLotId]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={sessions}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      ListEmptyComponent={<Text style={styles.empty}>Không có xe nào đang gửi.</Text>}
      renderItem={({ item }) => (
        <View
          style={styles.card}
          onTouchEnd={() =>
            navigation.navigate('CheckOut', {
              sessionId: item.id,
              licensePlate: item.licensePlate,
              slotCode: item.slotCode,
            })
          }>
          <View style={styles.cardHeader}>
            <Text style={styles.plate}>{item.licensePlate}</Text>
            <Text style={styles.slot}>{item.slotCode}</Text>
          </View>
          <Text style={styles.meta}>
            {sessionTypeLabel[item.sessionType]} · Vào lúc {formatDateTime(item.checkInAtUtc)}
          </Text>
          <Text style={styles.duration}>Đã đậu {formatDuration(item.checkInAtUtc)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  plate: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  slot: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  meta: { color: colors.textSecondary, fontSize: 12, marginTop: 6 },
  duration: { color: colors.accent, fontSize: 12, marginTop: 4 },
});
