import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SlotStatusDto, SlotType } from '../types/api';
import { colors, slotTypeColor, slotTypeLabel } from '../theme/colors';
import { slotsApi } from '../api/slotsApi';

const SLOT_TYPES: SlotType[] = ['Thuong', 'Vip', 'DanhChoVeThang'];

interface Props {
  slot: SlotStatusDto | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditSlotModal({ slot, visible, onClose, onSaved }: Props) {
  const [code, setCode] = useState(slot?.code ?? '');
  const [type, setType] = useState<SlotType>(slot?.type ?? 'Thuong');
  const [description, setDescription] = useState(slot?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);

  // Đồng bộ lại state mỗi khi mở modal cho 1 slot khác
  React.useEffect(() => {
    if (visible && slot) {
      setCode(slot.code);
      setType(slot.type);
      setDescription(slot.description ?? '');
    }
  }, [visible, slot]);

  if (!slot) return null;

  const handleSave = async () => {
    if (!code.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã slot.');
      return;
    }
    setIsSaving(true);
    try {
      await slotsApi.updateSlot(slot.slotId, {
        code: code.trim(),
        type,
        description: description.trim() || undefined,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      const message = e?.response?.data?.detail ?? e?.response?.data?.title;
      Alert.alert('Không thể lưu', message ?? 'Mã slot có thể đã tồn tại trong khu vực này.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          <Text style={styles.title}>Sửa slot {slot.code}</Text>

          <Text style={styles.label}>Mã slot</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="A-01"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Loại slot</Text>
          <View style={styles.chipsRow}>
            {SLOT_TYPES.map(t => {
              const active = type === t;
              const tColor = slotTypeColor[t];
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    { borderColor: tColor },
                    active && { backgroundColor: tColor },
                  ]}
                  onPress={() => setType(t)}>
                  <Text style={[styles.typeChipText, { color: active ? colors.white : tColor }]}>
                    {slotTypeLabel[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Mô tả (không bắt buộc)</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Gần lối ra, sát cột B..."
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabled]}
            disabled={isSaving}
            onPress={handleSave}>
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeLink} onPress={onClose}>
            <Text style={styles.closeLinkText}>Huỷ</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipText: { fontSize: 13, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  closeLink: { alignItems: 'center', marginTop: 14 },
  closeLinkText: { color: colors.textMuted, fontSize: 13 },
});
