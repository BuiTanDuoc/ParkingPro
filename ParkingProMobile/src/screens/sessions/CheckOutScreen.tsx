import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, Asset } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { sessionsApi } from '../../api/sessionsApi';
import { colors } from '../../theme/colors';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { CheckOutResponse } from '../../types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckOut'>;

export default function CheckOutScreen({ route, navigation }: Props) {
  const { sessionId, licensePlate, slotCode } = route.params;
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckOutResponse | null>(null);

  const takePhoto = async () => {
    const res = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: false });
    if (res.assets?.[0]) setPhoto(res.assets[0]);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await sessionsApi.checkOut(sessionId, photo);
      setResult(res);
    } catch {
      Alert.alert('Check-out thất bại', 'Không thể hoàn tất check-out. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Check-out thành công</Text>
          <Row label="Biển số" value={result.licensePlate} />
          <Row label="Slot" value={result.slotCode} />
          <Row label="Giờ vào" value={formatDateTime(result.checkInAtUtc)} />
          <Row label="Giờ ra" value={formatDateTime(result.checkOutAtUtc)} />
          <View style={styles.divider} />
          <Text style={styles.amountLabel}>Số tiền cần thu</Text>
          <Text style={styles.amount}>{formatCurrency(result.totalAmount)}</Text>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Xong</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.plate}>{licensePlate}</Text>
        <Text style={styles.slot}>Slot {slotCode}</Text>
      </View>

      <Text style={styles.label}>Ảnh check-out (không bắt buộc)</Text>
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
        onPress={handleConfirm}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitText}>Xác nhận check-out</Text>
        )}
      </TouchableOpacity>
    </View>
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
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  plate: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' },
  slot: { color: colors.textSecondary, marginTop: 4 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 28,
  },
  disabled: { opacity: 0.7 },
  submitText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  resultCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 20, marginTop: 20 },
  resultTitle: { color: colors.accent, fontSize: 17, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  amountLabel: { color: colors.textSecondary, fontSize: 13 },
  amount: { color: colors.accent, fontSize: 28, fontWeight: '700', marginTop: 4 },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  doneButtonText: { color: colors.white, fontWeight: '600', fontSize: 16 },
});
