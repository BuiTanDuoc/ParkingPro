import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { contractsApi } from '../../api/contractsApi';
import { colors, contractStatusColor, contractStatusLabel } from '../../theme/colors';
import { formatCurrency, formatDate } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'EditContract'>;

export default function EditContractScreen({ route, navigation }: Props) {
  const [contract, setContract] = useState(route.params.contract);
  const [licensePlate, setLicensePlate] = useState(contract.licensePlate);
  const [autoRenew, setAutoRenew] = useState(contract.autoRenew);
  const [renewMonths, setRenewMonths] = useState('1');
  const [isSaving, setIsSaving] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCancelled = contract.status === 'DaHuy';
  const statusColor = contractStatusColor[contract.status] ?? colors.disabled;

  const handleSave = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập biển số xe.');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await contractsApi.update(contract.id, {
        licensePlate: licensePlate.trim().toUpperCase(),
        autoRenew,
      });
      setContract(updated);
      Alert.alert('Đã lưu', 'Cập nhật hợp đồng thành công.');
    } catch (e: any) {
      const message = e?.response?.data?.detail ?? e?.response?.data?.title;
      Alert.alert('Không thể lưu', message ?? 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenew = async () => {
    const months = parseInt(renewMonths, 10);
    if (!months || months <= 0) {
      Alert.alert('Số tháng không hợp lệ', 'Vui lòng nhập số tháng gia hạn lớn hơn 0.');
      return;
    }
    setIsRenewing(true);
    try {
      const updated = await contractsApi.renew(contract.id, months);
      setContract(updated);
      Alert.alert('Đã gia hạn', `Hợp đồng gia hạn tới ${formatDate(updated.endDate)}.`);
    } catch {
      Alert.alert('Lỗi', 'Không thể gia hạn hợp đồng.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Xoá hợp đồng',
      'Hợp đồng sẽ được huỷ và slot cố định (nếu có) sẽ được giải phóng về trạng thái Trống. Bạn chắc chắn?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xoá hợp đồng',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await contractsApi.cancel(contract.id);
              Alert.alert('Đã xoá', 'Hợp đồng đã được huỷ.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert('Lỗi', 'Không thể xoá hợp đồng.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{contract.customerName}</Text>
        <View style={[styles.pill, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.pillText, { color: statusColor }]}>
            {contractStatusLabel[contract.status]}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Row label="Slot cố định" value={contract.fixedSlotCode ?? 'Không có'} />
        <Row label="Ngày bắt đầu" value={formatDate(contract.startDate)} />
        <Row label="Ngày hết hạn" value={formatDate(contract.endDate)} />
        <Row label="Đơn giá/tháng" value={formatCurrency(contract.monthlyFee)} />
      </View>

      <Text style={styles.sectionTitle}>Sửa thông tin</Text>
      <Text style={styles.label}>Biển số xe</Text>
      <TextInput
        style={[styles.input, isCancelled && styles.inputDisabled]}
        value={licensePlate}
        onChangeText={setLicensePlate}
        autoCapitalize="characters"
        editable={!isCancelled}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Tự động gia hạn</Text>
        <Switch
          value={autoRenew}
          onValueChange={setAutoRenew}
          disabled={isCancelled}
          trackColor={{ true: colors.accent, false: colors.disabled }}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, (isSaving || isCancelled) && styles.disabled]}
        disabled={isSaving || isCancelled}
        onPress={handleSave}>
        {isSaving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>

      {!isCancelled && (
        <>
          <Text style={styles.sectionTitle}>Gia hạn</Text>
          <View style={styles.renewRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={renewMonths}
              onChangeText={setRenewMonths}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.renewButton, isRenewing && styles.disabled]}
              disabled={isRenewing}
              onPress={handleRenew}>
              {isRenewing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.renewButtonText}>Gia hạn (tháng)</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.disabled]}
            disabled={isCancelling}
            onPress={handleCancel}>
            {isCancelling ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <Text style={styles.cancelButtonText}>Xoá hợp đồng</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.textPrimary, fontSize: 19, fontWeight: '700', flexShrink: 1 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '600' },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 4,
  },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputDisabled: { opacity: 0.5 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  renewRow: { flexDirection: 'row', gap: 8 },
  renewButton: {
    backgroundColor: `${colors.primary}22`,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renewButtonText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  cancelButton: {
    backgroundColor: `${colors.danger}18`,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: { color: colors.danger, fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.6 },
});
