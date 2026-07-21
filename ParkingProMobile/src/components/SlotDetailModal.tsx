import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SlotStatusDto } from '../types/api';
import { colors, slotStatusColor, slotStatusLabel } from '../theme/colors';
import { sessionsApi } from '../api/sessionsApi';
import { slotsApi } from '../api/slotsApi';
import { formatDuration } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  slot: SlotStatusDto | null;
  visible: boolean;
  onClose: () => void;
  onCheckOut: (sessionId: string, licensePlate: string, slotCode: string) => void;
  onSlotUpdated: () => void;
}

export default function SlotDetailModal({
  slot,
  visible,
  onClose,
  onCheckOut,
  onSlotUpdated,
}: Props) {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';
  const [checkInAt, setCheckInAt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  useEffect(() => {
    if (!visible || !slot || slot.status !== 'DangDauXe') {
      setCheckInAt(null);
      setSessionId(null);
      return;
    }
    setIsLoadingSession(true);
    sessionsApi
      .getActiveBySlot(slot.slotId)
      .then(session => {
        if (session) {
          setSessionId(session.id);
          setCheckInAt(session.checkInAtUtc);
        }
      })
      .finally(() => setIsLoadingSession(false));
  }, [visible, slot]);

  if (!slot) return null;
  const color = slotStatusColor[slot.status] ?? colors.disabled;

  const handleToggleMaintenance = async () => {
    setIsTogglingMaintenance(true);
    try {
      await slotsApi.setMaintenance(slot.slotId, slot.status !== 'BaoTri');
      onSlotUpdated();
      onClose();
    } finally {
      setIsTogglingMaintenance(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1}>
          <View style={styles.headerRow}>
            <Text style={styles.slotCode}>{slot.code}</Text>
            <View style={[styles.statusPill, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.statusText, { color }]}>{slotStatusLabel[slot.status]}</Text>
            </View>
          </View>
          <Text style={styles.zone}>{slot.zoneName}</Text>

          {slot.status === 'DangDauXe' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Biển số xe</Text>
              <Text style={styles.infoValue}>{slot.currentLicensePlate ?? '—'}</Text>
              {isLoadingSession ? (
                <ActivityIndicator color={colors.textSecondary} style={{ marginTop: 8 }} />
              ) : checkInAt ? (
                <>
                  <Text style={[styles.infoLabel, { marginTop: 10 }]}>Thời gian đậu</Text>
                  <Text style={styles.infoValue}>{formatDuration(checkInAt)}</Text>
                </>
              ) : null}
            </View>
          )}

          {slot.status === 'DangDauXe' && sessionId && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                onClose();
                onCheckOut(sessionId, slot.currentLicensePlate ?? '', slot.code);
              }}>
              <Text style={styles.actionButtonText}>Check-out xe này</Text>
            </TouchableOpacity>
          )}

          {slot.status === 'Trong' && (
            <Text style={styles.freeHint}>
              Slot trống — chuyển sang tab "Check-in" để gửi xe vào đây.
            </Text>
          )}

          {canManage && slot.status !== 'DangDauXe' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              disabled={isTogglingMaintenance}
              onPress={handleToggleMaintenance}>
              {isTogglingMaintenance ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  {slot.status === 'BaoTri' ? 'Gỡ trạng thái bảo trì' : 'Đánh dấu bảo trì'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeLink} onPress={onClose}>
            <Text style={styles.closeLinkText}>Đóng</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotCode: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '600' },
  zone: { color: colors.textSecondary, marginTop: 4, fontSize: 13 },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  infoLabel: { color: colors.textMuted, fontSize: 12 },
  infoValue: { color: colors.textPrimary, fontSize: 17, fontWeight: '600', marginTop: 2 },
  freeHint: { color: colors.textSecondary, marginTop: 20, fontSize: 13, lineHeight: 19 },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  secondaryButtonText: { color: colors.textPrimary, fontWeight: '600', fontSize: 15 },
  closeLink: { alignItems: 'center', marginTop: 16 },
  closeLinkText: { color: colors.textMuted, fontSize: 13 },
});
