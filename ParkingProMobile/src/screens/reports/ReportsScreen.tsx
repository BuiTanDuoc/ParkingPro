import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { reportsApi } from '../../api/reportsApi';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { RevenueReportDto } from '../../types/api';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/format';

const DATE_PRESETS = [
  { label: '7 ngày', days: 6 },
  { label: '14 ngày', days: 13 },
  { label: '30 ngày', days: 29 },
];

export default function ReportsScreen() {
  const { parkingLotId } = useParkingLot();
  const [fromDate, setFromDate] = useState(dayjs().subtract(6, 'day').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [revenue, setRevenue] = useState<RevenueReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!parkingLotId) return;
    setError(null);
    try {
      const data = await reportsApi.getRevenue(parkingLotId, fromDate, toDate);
      setRevenue(data);
    } catch {
      setError('Không thể tải báo cáo. Kiểm tra lại khoảng ngày hoặc kết nối mạng.');
    }
  }, [parkingLotId, fromDate, toDate]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tải lần đầu khi mở màn, sau đó bấm nút "Xem báo cáo"
  }, [parkingLotId]);

  const applyPreset = (days: number) => {
    setFromDate(dayjs().subtract(days, 'day').format('YYYY-MM-DD'));
    setToDate(dayjs().format('YYYY-MM-DD'));
  };

  const handleQuery = async () => {
    setIsLoading(true);
    await load();
    setIsLoading(false);
  };

  const totals = revenue.reduce(
    (acc, r) => ({
      hourly: acc.hourly + r.hourlyRevenue,
      daily: acc.daily + r.dailyRevenue,
      monthly: acc.monthly + r.monthlyRevenue,
      total: acc.total + r.totalRevenue,
    }),
    { hourly: 0, daily: 0, monthly: 0, total: 0 },
  );
  const maxAmount = Math.max(...revenue.map(r => r.totalRevenue), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Báo cáo doanh thu</Text>

      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Từ ngày</Text>
          <TextInput
            style={styles.input}
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="2026-07-15"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Đến ngày</Text>
          <TextInput
            style={styles.input}
            value={toDate}
            onChangeText={setToDate}
            placeholder="2026-07-21"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={styles.presetRow}>
        {DATE_PRESETS.map(p => (
          <TouchableOpacity key={p.label} style={styles.presetChip} onPress={() => applyPreset(p.days)}>
            <Text style={styles.presetChipText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.queryButton} onPress={handleQuery} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.queryButtonText}>Xem báo cáo</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {!isLoading && !error && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Tổng doanh thu ({revenue.length} ngày)</Text>
            <Text style={styles.revenueTotal}>{formatCurrency(totals.total)}</Text>

            <View style={styles.breakdownRow}>
              <Breakdown label="Theo giờ" value={totals.hourly} />
              <Breakdown label="Theo ngày" value={totals.daily} />
              <Breakdown label="Vé tháng" value={totals.monthly} />
            </View>

            {revenue.length > 0 && (
              <View style={styles.chart}>
                {revenue.map(r => (
                  <View key={r.date} style={styles.barColumn}>
                    <View
                      style={[
                        styles.bar,
                        { height: Math.max(4, (r.totalRevenue / maxAmount) * 100) },
                      ]}
                    />
                    <Text style={styles.barLabel}>{dayjs(r.date).format('DD/MM')}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Chi tiết theo ngày</Text>
            {revenue.length === 0 ? (
              <Text style={styles.empty}>Không có dữ liệu trong khoảng ngày này.</Text>
            ) : (
              revenue.map(r => (
                <View key={r.date} style={styles.detailRow}>
                  <Text style={styles.detailDate}>{formatDate(r.date)}</Text>
                  <Text style={styles.detailAmount}>{formatCurrency(r.totalRevenue)}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownLabel}>{label}</Text>
      <Text style={styles.breakdownValue}>{formatCurrency(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  dateRow: { flexDirection: 'row', gap: 10 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 14,
  },
  presetRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  presetChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },
  presetChipText: { color: colors.textSecondary, fontSize: 12 },
  queryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  queryButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  error: { color: colors.danger, fontSize: 13, marginTop: 16, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: { color: colors.textSecondary, fontSize: 13 },
  revenueTotal: { color: colors.accent, fontSize: 24, fontWeight: '700', marginTop: 4 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  breakdownItem: { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: 10, padding: 10 },
  breakdownLabel: { color: colors.textMuted, fontSize: 11 },
  breakdownValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    marginTop: 20,
  },
  barColumn: { alignItems: 'center', flex: 1 },
  bar: { width: 14, backgroundColor: colors.primary, borderRadius: 4 },
  barLabel: { color: colors.textMuted, fontSize: 9, marginTop: 6 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailDate: { color: colors.textSecondary, fontSize: 13 },
  detailAmount: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  empty: { color: colors.textMuted, fontSize: 13, marginTop: 8 },
});
