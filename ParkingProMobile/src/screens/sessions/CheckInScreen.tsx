import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, Asset } from 'react-native-image-picker';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { useUi } from '../../contexts/UiContext';
import { sessionsApi } from '../../api/sessionsApi';
import { SessionType, VehicleType } from '../../types/api';
import { colors, sessionTypeLabel, vehicleTypeLabel } from '../../theme/colors';

const VEHICLE_TYPES: VehicleType[] = ['XeMay', 'OToDuoi7Cho', 'OToTren7Cho', 'XeTai'];
const SESSION_TYPES: SessionType[] = ['TheoGio', 'TheoNgay'];

export default function CheckInScreen() {
  const { parkingLotId } = useParkingLot();
  const { preferredCheckInSlot, setPreferredCheckInSlot } = useUi();
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('OToDuoi7Cho');
  const [sessionType, setSessionType] = useState<SessionType>('TheoGio');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const takePhoto = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: false });
    if (result.assets?.[0]) setPhoto(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!parkingLotId) return;
    if (!licensePlate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập biển số xe.');
      return;
    }
    setIsSubmitting(true);
    setLastResult(null);
    try {
      const res = await sessionsApi.checkIn({
        parkingLotId,
        licensePlate: licensePlate.trim().toUpperCase(),
        vehicleType,
        sessionType,
        preferredSlotId: preferredCheckInSlot?.slotId,
        photo,
      });
      setLastResult(`Check-in thành công — xe ${res.licensePlate} vào slot ${res.slotCode}.`);
      setLicensePlate('');
      setPhoto(null);
      setPreferredCheckInSlot(null);
    } catch (e: any) {
      const message = e?.response?.data?.detail ?? e?.response?.data?.title;
      Alert.alert('Check-in thất bại', message ?? 'Không có slot trống phù hợp hoặc lỗi máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Check-in xe</Text>

      {preferredCheckInSlot && (
        <View style={styles.preferredBanner}>
          <Text style={styles.preferredText}>
            Sẽ ưu tiên gửi vào slot <Text style={styles.preferredCode}>{preferredCheckInSlot.slotCode}</Text>
          </Text>
          <TouchableOpacity onPress={() => setPreferredCheckInSlot(null)}>
            <Text style={styles.preferredClear}>Bỏ chọn</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Biển số xe</Text>
      <TextInput
        style={styles.input}
        placeholder="59A-123.45"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        value={licensePlate}
        onChangeText={setLicensePlate}
      />

      <Text style={styles.label}>Loại xe</Text>
      <View style={styles.chipsRow}>
        {VEHICLE_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, vehicleType === type && styles.chipActive]}
            onPress={() => setVehicleType(type)}>
            <Text style={[styles.chipText, vehicleType === type && styles.chipTextActive]}>
              {vehicleTypeLabel[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Hình thức gửi</Text>
      <View style={styles.chipsRow}>
        {SESSION_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, sessionType === type && styles.chipActive]}
            onPress={() => setSessionType(type)}>
            <Text style={[styles.chipText, sessionType === type && styles.chipTextActive]}>
              {sessionTypeLabel[type]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ảnh check-in (không bắt buộc)</Text>
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

      {lastResult && <Text style={styles.success}>{lastResult}</Text>}

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.disabled]}
        disabled={isSubmitting}
        onPress={handleSubmit}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>Xác nhận check-in</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 20 },
  preferredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.primary}22`,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  preferredText: { color: colors.textPrimary, fontSize: 13, flex: 1 },
  preferredCode: { fontWeight: '700', color: colors.primary },
  preferredClear: { color: colors.textMuted, fontSize: 12, marginLeft: 10 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
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
  preview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: colors.surface },
  retakeLink: { color: colors.primary, textAlign: 'center', marginTop: 8, fontSize: 13 },
  success: { color: colors.accent, marginTop: 20, fontSize: 13, lineHeight: 19 },
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
