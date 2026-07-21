import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { reportsApi } from '../../api/reportsApi';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { OccupancyReportDto, RevenueReportDto } from '../../types/api';
import { colors } from '../../theme/colors';
import { formatCurrency } from '../../utils/format';

export default function ReportsScreen() {
  const { parkingLotId } = useParkingLot();
  const [occupancy, setOccupancy] = useState<OccupancyReportDto | null>(null);
  const [revenue, setRevenue] = useState<RevenueReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!parkingLotId) return;
    const toDate = dayjs().format('YYYY-MM-DD');
    const fromDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

    Promise.all([
      reportsApi.getOccupancy(parkingLotId),
      reportsApi.getRevenue(fromDate, toDate),
    ])
      .then(([occ, rev]) => {
        setOccupancy(occ);
        setRevenue(rev);
      })
      .finally(() => setIsLoading(false));
  }, [parkingLotId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalRevenue = revenue.reduce((sum, r) => sum + r.totalAmount, 0);
  const maxAmount = Math.max(...revenue.map(r => r.totalAmount), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Báo cáo</Text>

      {occupancy && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tỷ lệ lấp đầy hiện tại</Text>
          <Text style={styles.occupancyValue}>
            {(occupancy.occupancyRate * 100).toFixed(0)}%
          </Text>
          <Text style={styles.cardSub}>
            {occupancy.occupiedSlots}/{occupancy.totalSlots} slot đang sử dụng
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Doanh thu 7 ngày gần nhất</Text>
        <Text style={styles.revenueTotal}>{formatCurrency(totalRevenue)}</Text>

        <View style={styles.chart}>
          {revenue.map(r => (
            <View key={r.date} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(4, (r.totalAmount / maxAmount) * 100) },
                ]}
              />
              <Text style={styles.barLabel}>{dayjs(r.date).format('DD/MM')}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { color: colors.textSecondary, fontSize: 13 },
  cardSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  occupancyValue: { color: colors.primary, fontSize: 34, fontWeight: '700', marginTop: 4 },
  revenueTotal: { color: colors.accent, fontSize: 24, fontWeight: '700', marginTop: 4 },
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
