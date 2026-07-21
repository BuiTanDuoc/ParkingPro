import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { reportsApi } from '../../api/reportsApi';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { OccupancyReportDto, RevenueReportDto } from '../../types/api';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/format';

export default function DashboardScreen() {
  const { parkingLotId, parkingLotName } = useParkingLot();
  const [occupancy, setOccupancy] = useState<OccupancyReportDto | null>(null);
  const [revenue, setRevenue] = useState<RevenueReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!parkingLotId) return;
    // Tự lấy khoảng ngày: 7 ngày gần nhất tính đến hôm nay
    const toDate = dayjs().format('YYYY-MM-DD');
    const fromDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

    const [occ, rev] = await Promise.all([
      reportsApi.getOccupancy(parkingLotId),
      reportsApi.getRevenue(parkingLotId, fromDate, toDate),
    ]);
    setOccupancy(occ);
    setRevenue(rev);
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

  const totalRevenue7d = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
  const maxAmount = Math.max(...revenue.map(r => r.totalRevenue), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.lotName}>{parkingLotName}</Text>

      {/* Tình trạng bãi xe hiện tại */}
      {occupancy && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tình trạng bãi xe hiện tại</Text>
          <Text style={styles.occupancyValue}>{occupancy.occupancyRatePercent.toFixed(0)}%</Text>
          <Text style={styles.cardSub}>Tỷ lệ lấp đầy</Text>

          <View style={styles.slotStatsRow}>
            <SlotStat label="Tổng slot" value={occupancy.totalSlots} color={colors.textPrimary} />
            <SlotStat label="Đang dùng" value={occupancy.occupiedSlots} color={colors.danger} />
            <SlotStat label="Trống" value={occupancy.availableSlots} color={colors.accent} />
            <SlotStat label="Bảo trì" value={occupancy.maintenanceSlots} color={colors.disabled} />
          </View>
        </View>
      )}

      {/* Doanh thu 7 ngày gần nhất */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Doanh thu 7 ngày gần nhất</Text>
        <Text style={styles.revenueTotal}>{formatCurrency(totalRevenue7d)}</Text>

        {revenue.length > 0 && (
          <View style={styles.chart}>
            {revenue.map(r => (
              <View key={r.date} style={styles.barColumn}>
                <View
                  style={[styles.bar, { height: Math.max(4, (r.totalRevenue / maxAmount) * 100) }]}
                />
                <Text style={styles.barLabel}>{dayjs(r.date).format('DD/MM')}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function SlotStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.slotStat}>
      <Text style={[styles.slotStatValue, { color }]}>{value}</Text>
      <Text style={styles.slotStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  lotName: { color: colors.textSecondary, fontSize: 13, marginTop: 2, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { color: colors.textSecondary, fontSize: 13 },
  cardSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  occupancyValue: { color: colors.primary, fontSize: 34, fontWeight: '700', marginTop: 4 },
  revenueTotal: { color: colors.accent, fontSize: 24, fontWeight: '700', marginTop: 4 },
  slotStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  slotStat: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 10, paddingVertical: 10 },
  slotStatValue: { fontSize: 17, fontWeight: '700' },
  slotStatLabel: { color: colors.textMuted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    marginTop: 20,
  },
  barColumn: { alignItems: 'center', flex: 1 },
  bar: { width: 16, backgroundColor: colors.primary, borderRadius: 4 },
  barLabel: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
});
