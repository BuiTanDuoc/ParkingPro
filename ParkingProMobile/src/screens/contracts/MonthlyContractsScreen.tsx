import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { contractsApi } from '../../api/contractsApi';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { ContractStatus, MonthlyContractDto } from '../../types/api';
import { colors, contractStatusColor, contractStatusLabel } from '../../theme/colors';
import { formatDate } from '../../utils/format';
import { RootStackParamList } from '../../navigation/types';

const STATUS_FILTERS: { label: string; value: ContractStatus | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Đang hoạt động', value: 'DangHoatDong' },
  { label: 'Sắp hết hạn', value: 'SapHetHan' },
  { label: 'Đã hết hạn', value: 'HetHan' },
];

export default function MonthlyContractsScreen() {
  const { parkingLotId } = useParkingLot();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [contracts, setContracts] = useState<MonthlyContractDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!parkingLotId) return;
    const res = await contractsApi.getAll(parkingLotId, {
      status: statusFilter,
      search: search.trim() || undefined,
      pageSize: 100,
    });
    setContracts(res.items);
  }, [parkingLotId, statusFilter, search]);

  // Refetch mỗi khi quay lại tab này (sau khi tạo/sửa/xoá hợp đồng ở màn khác)
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      load().finally(() => setIsLoading(false));
    }, [load]),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Hợp đồng vé tháng</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateContract')}>
          <Text style={styles.createButtonText}>+ Tạo HĐ</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo biển số hoặc tên khách hàng..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => {
          setIsLoading(true);
          load().finally(() => setIsLoading(false));
        }}
      />

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => {
          const active = statusFilter === f.value;
          return (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setStatusFilter(f.value)}>
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          data={contracts}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>Không có hợp đồng nào.</Text>}
          renderItem={({ item }) => {
            const statusColor = contractStatusColor[item.status] ?? colors.disabled;
            const isHighlighted = item.status === 'SapHetHan' || item.status === 'HetHan';
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  isHighlighted && { borderColor: statusColor, borderWidth: 1.5 },
                ]}
                onPress={() => navigation.navigate('EditContract', { contract: item })}>
                <View style={styles.cardHeader}>
                  <Text style={styles.plate}>{item.licensePlate}</Text>
                  <View style={[styles.pill, { backgroundColor: `${statusColor}22` }]}>
                    <Text style={[styles.pillText, { color: statusColor }]}>
                      {contractStatusLabel[item.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customer}>{item.customerName}</Text>
                <Text style={styles.meta}>
                  {item.fixedSlotCode ? `Slot ${item.fixedSlotCode} · ` : ''}
                  {formatDate(item.startDate)} → {formatDate(item.endDate)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createButtonText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textSecondary, fontSize: 12 },
  filterChipTextActive: { color: colors.white, fontWeight: '600' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plate: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: '600' },
  customer: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
