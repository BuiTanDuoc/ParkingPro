import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import dayjs from 'dayjs';
import { launchCamera, Asset } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { authApi } from '../../api/authApi';
import { contractsApi } from '../../api/contractsApi';
import { slotsApi } from '../../api/slotsApi';
import { SlotStatusDto } from '../../types/api';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateContract'>;

function randomPassword() {
  return Math.random().toString(36).slice(-8) + 'A1';
}

export default function CreateContractScreen({ route, navigation }: Props) {
  const { parkingLotId } = useParkingLot();
  const preferredSlotId = route.params?.preferredSlotId;
  const preferredSlotCode = route.params?.preferredSlotCode;

  const [licensePlate, setLicensePlate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(randomPassword());
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [numberOfMonths, setNumberOfMonths] = useState('1');
  const [autoRenew, setAutoRenew] = useState(true);
  const [photo, setPhoto] = useState<Asset | null>(null);

  const [freeSlots, setFreeSlots] = useState<SlotStatusDto[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(preferredSlotId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preferredSlotId || !parkingLotId) return;
    slotsApi.getStatus(parkingLotId).then(all => {
      setFreeSlots(all.filter(s => s.status === 'Trong'));
    });
  }, [parkingLotId, preferredSlotId]);

  const takePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: false });
    if (result.assets?.[0]) setPhoto(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!parkingLotId) return;
    if (!licensePlate.trim() || !customerName.trim() || !email.trim() || password.length < 6) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập biển số, tên khách hàng, email hợp lệ và mật khẩu tối thiểu 6 ký tự.',
      );
      return;
    }
    const months = parseInt(numberOfMonths, 10);
    if (!months || months <= 0) {
      Alert.alert('Số tháng không hợp lệ', 'Vui lòng nhập số tháng đăng ký lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      let customerUserId: string;
      try {
        const registered = await authApi.registerCustomer({
          fullName: customerName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
        });
        customerUserId = registered.id;
      } catch (e: any) {
        if (e?.response?.status === 409) {
          Alert.alert(
            'Email đã tồn tại',
            'Khách hàng này đã có tài khoản — hãy dùng email khác, hoặc nhờ Admin tra cứu Id tài khoản để tạo hợp đồng thủ công.',
          );
          return;
        }
        throw e;
      }

      await contractsApi.create({
        parkingLotId,
        customerUserId,
        licensePlate: licensePlate.trim().toUpperCase(),
        fixedSlotId: selectedSlotId,
        startDate,
        numberOfMonths: months,
        autoRenew,
        vehiclePhoto: photo,
      });

      Alert.alert('Thành công', 'Đã tạo hợp đồng vé tháng.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const message = e?.response?.data?.detail ?? e?.response?.data?.title;
      Alert.alert('Không thể tạo hợp đồng', message ?? 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Xe & Slot</Text>
      <Text style={styles.label}>Biển số xe</Text>
      <TextInput
        style={styles.input}
        placeholder="59A-123.45"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        value={licensePlate}
        onChangeText={setLicensePlate}
      />

      <Text style={styles.label}>Slot cố định</Text>
      {preferredSlotId ? (
        <View style={styles.lockedSlot}>
          <Text style={styles.lockedSlotText}>{preferredSlotCode}</Text>
        </View>
      ) : (
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedSlotId && styles.chipActive]}
            onPress={() => setSelectedSlotId(undefined)}>
            <Text style={[styles.chipText, !selectedSlotId && styles.chipTextActive]}>
              Không gán slot cố định
            </Text>
          </TouchableOpacity>
          {freeSlots.map(s => (
            <TouchableOpacity
              key={s.slotId}
              style={[styles.chip, selectedSlotId === s.slotId && styles.chipActive]}
              onPress={() => setSelectedSlotId(s.slotId)}>
              <Text
                style={[styles.chipText, selectedSlotId === s.slotId && styles.chipTextActive]}>
                {s.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Khách hàng</Text>
      <Text style={styles.hint}>
        Hệ thống sẽ tự tạo tài khoản khách hàng mới với email/mật khẩu bên dưới.
      </Text>

      <Text style={styles.label}>Họ tên khách hàng</Text>
      <TextInput
        style={styles.input}
        placeholder="Nguyễn Văn A"
        placeholderTextColor={colors.textMuted}
        value={customerName}
        onChangeText={setCustomerName}
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        placeholder="09xxxxxxxx"
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="khachhang@email.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Mật khẩu tạm</Text>
      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.genButton} onPress={() => setPassword(randomPassword())}>
          <Text style={styles.genButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Thời hạn hợp đồng</Text>
      <Text style={styles.label}>Ngày bắt đầu (yyyy-MM-dd)</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-07-21"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Số tháng đăng ký</Text>
      <TextInput
        style={styles.input}
        value={numberOfMonths}
        onChangeText={setNumberOfMonths}
        keyboardType="number-pad"
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Tự động gia hạn</Text>
        <Switch
          value={autoRenew}
          onValueChange={setAutoRenew}
          trackColor={{ true: colors.accent, false: colors.disabled }}
        />
      </View>

      <Text style={styles.label}>Ảnh xe (không bắt buộc)</Text>
      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📷 Chụp ảnh xe</Text>
        </TouchableOpacity>
      )}
      {photo && (
        <TouchableOpacity onPress={takePhoto}>
          <Text style={styles.retakeLink}>Chụp lại</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabled]}
        disabled={isSubmitting}
        onPress={handleSubmit}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>Tạo hợp đồng</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 4,
  },
  hint: { color: colors.textSecondary, fontSize: 12, marginBottom: 12, lineHeight: 17 },
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
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  genButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  genButtonText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13 },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  lockedSlot: {
    backgroundColor: `${colors.primary}22`,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  lockedSlotText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  photoButtonText: { color: colors.textSecondary, fontSize: 14 },
  preview: { width: '100%', height: 180, borderRadius: 12, backgroundColor: colors.surface },
  retakeLink: { color: colors.primary, textAlign: 'center', marginTop: 8, fontSize: 13 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  disabled: { opacity: 0.7 },
  submitText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
