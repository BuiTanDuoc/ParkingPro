import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { slotsApi } from '../../api/slotsApi';
import { MonthlyContractDto, SlotStatusDto } from '../../types/api';
import {
  colors,
  slotStatusColor,
  slotStatusLabel,
  slotTypeColor,
  slotTypeLabel,
} from '../../theme/colors';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { useUi } from '../../contexts/UiContext';
import { useParkingHub } from '../../hooks/useParkingHub';
import SlotChip from '../../components/SlotChip';
import SlotActionSheet from '../../components/SlotActionSheet';
import EditSlotModal from '../../components/EditSlotModal';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';

const STATUS_LEGEND: SlotStatusDto['status'][] = ['Trong', 'DangDauXe', 'DaDatTruoc', 'BaoTri'];
const TYPE_LEGEND: SlotStatusDto['type'][] = ['Thuong', 'Vip', 'DanhChoVeThang'];

export default function ParkingMapScreen() {
  const { parkingLotId, parkingLotName } = useParkingLot();
  const { setPreferredCheckInSlot } = useUi();
  // CheckOut/CreateContract/EditContract nằm ở root stack; tab "CheckIn" nằm trong MainTabNavigator.
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList> & BottomTabNavigationProp<MainTabParamList>
    >();

  const [slots, setSlots] = useState<SlotStatusDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotStatusDto | null>(null);
  const [editingSlot, setEditingSlot] = useState<SlotStatusDto | null>(null);

  const loadSlots = useCallback(async () => {
    if (!parkingLotId) return;
    const data = await slotsApi.getStatus(parkingLotId);
    setSlots(data);
  }, [parkingLotId]);

  useEffect(() => {
    setIsLoading(true);
    loadSlots().finally(() => setIsLoading(false));
  }, [loadSlots]);

  const { connectionState } = useParkingHub({
    parkingLotId,
    onSlotStatusChanged: evt => {
      setSlots(prev =>
        prev.map(s => (s.slotId === evt.slotId ? { ...s, status: evt.newStatus } : s)),
      );
    },
    onSessionCheckedIn: () => loadSlots(),
    onSessionCheckedOut: () => loadSlots(),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSlots();
    setIsRefreshing(false);
  };

  const grouped = useMemo(() => {
    const map = new Map<string, SlotStatusDto[]>();
    for (const slot of slots) {
      const key = slot.zoneName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot);
    }
    return Array.from(map.entries());
  }, [slots]);

  const summary = useMemo(() => {
    const total = slots.length;
    const free = slots.filter(s => s.status === 'Trong').length;
    return { total, free };
  }, [slots]);

  const handleCheckIn = (slotId: string, slotCode: string) => {
    setPreferredCheckInSlot({ slotId, slotCode });
    navigation.navigate('CheckIn');
  };

  const handleCreateContract = (slotId: string, slotCode: string) => {
    navigation.navigate('CreateContract', { preferredSlotId: slotId, preferredSlotCode: slotCode });
  };

  const handleViewContract = (contract: MonthlyContractDto) => {
    navigation.navigate('EditContract', { contract });
  };

  if (!parkingLotId) return null;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.lotName}>{parkingLotName}</Text>
          <Text style={styles.summary}>
            {summary.free}/{summary.total} chỗ trống
          </Text>
        </View>
        <View style={styles.connectionRow}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: connectionState === 'connected' ? colors.accent : colors.warning },
            ]}
          />
          <Text style={styles.connectionText}>
            {connectionState === 'connected'
              ? 'Realtime'
              : connectionState === 'connecting'
              ? 'Đang kết nối...'
              : connectionState === 'reconnecting'
              ? 'Đang kết nối lại...'
              : 'Mất kết nối'}
          </Text>
        </View>
      </View>

      <View style={styles.legendBlock}>
        <View style={styles.legendRow}>
          <Text style={styles.legendGroupLabel}>Loại:</Text>
          {TYPE_LEGEND.map(type => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendSquare, { backgroundColor: slotTypeColor[type] }]} />
              <Text style={styles.legendText}>{slotTypeLabel[type]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <Text style={styles.legendGroupLabel}>T.thái:</Text>
          {STATUS_LEGEND.map(status => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: slotStatusColor[status] }]} />
              <Text style={styles.legendText}>{slotStatusLabel[status]}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        {grouped.map(([zoneName, zoneSlots]) => (
          <View key={zoneName} style={styles.zoneSection}>
            <Text style={styles.zoneTitle}>{zoneName}</Text>
            <View style={styles.slotGrid}>
              {zoneSlots.map(slot => (
                <SlotChip key={slot.slotId} slot={slot} onPress={setSelectedSlot} />
              ))}
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>

      <SlotActionSheet
        slot={selectedSlot}
        visible={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSlotUpdated={loadSlots}
        onEditSlot={setEditingSlot}
        onCheckIn={handleCheckIn}
        onCheckOut={(sessionId, licensePlate, slotCode) =>
          navigation.navigate('CheckOut', { sessionId, licensePlate, slotCode })
        }
        onCreateContract={handleCreateContract}
        onViewContract={handleViewContract}
      />

      <EditSlotModal
        slot={editingSlot}
        visible={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        onSaved={loadSlots}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  lotName: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  summary: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { color: colors.textSecondary, fontSize: 12 },
  legendBlock: { paddingHorizontal: 20, paddingBottom: 10, gap: 6 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  legendGroupLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSquare: { width: 9, height: 9, borderRadius: 2 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textMuted, fontSize: 11 },
  zoneSection: { paddingHorizontal: 16, marginTop: 12 },
  zoneTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap' },
});
