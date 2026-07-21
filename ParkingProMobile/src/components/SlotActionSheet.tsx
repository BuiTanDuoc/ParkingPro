import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MonthlyContractDto, SlotStatusDto } from '../types/api';
import {
  colors,
  slotStatusColor,
  slotStatusLabel,
  slotTypeColor,
  slotTypeLabel,
} from '../theme/colors';
import { sessionsApi } from '../api/sessionsApi';
import { contractsApi } from '../api/contractsApi';
import { slotsApi } from '../api/slotsApi';
import { formatDuration } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  slot: SlotStatusDto | null;
  visible: boolean;
  onClose: () => void;
  onSlotUpdated: () => void;
  onEditSlot: (slot: SlotStatusDto) => void;
  onCheckIn: (slotId: string, slotCode: string) => void;
  onCheckOut: (sessionId: string, licensePlate: string, slotCode: string) => void;
  onCreateContract: (slotId: string, slotCode: string) => void;
  onViewContract: (contract: MonthlyContractDto) => void;
}

export default function SlotActionSheet({
  slot,
  visible,
  onClose,
  onSlotUpdated,
  onEditSlot,
  onCheckIn,
  onCheckOut,
  onCreateContract,
  onViewContract,
}: Props) {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Manager';

  const [checkInAt, setCheckInAt] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [contract, setContract] = useState<MonthlyContractDto | null>(null);
  const [isLoadingExtra, setIsLoadingExtra] = useState(false);
  const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);

  useEffect(() => {
    if (!visible || !slot) {
      setCheckInAt(null);
      setSessionId(null);
      setContract(null);
      return;
    }

    setIsLoadingExtra(true);
    Promise.all([
      slot.status === 'DangDauXe' ? sessionsApi.getActiveBySlot(slot.slotId) : Promise.resolve(null),
      contractsApi.getBySlot(slot.slotId),
    ])
      .then(([session, activeContract]) => {
        if (session) {
          setSessionId(session.id);
          setCheckInAt(session.checkInAtUtc);
        }
        setContract(activeContract);
      })
      .finally(() => setIsLoadingExtra(false));
  }, [visible, slot]);

  if (!slot) return null;
  const typeColor = slotTypeColor[slot.type] ?? colors.primary;
  const statusColor = slotStatusColor[slot.status] ?? colors.disabled;

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
            <View style={[styles.pill, { backgroundColor: `${statusColor}22` }]}>
              <Text style={[styles.pillText, { color: statusColor }]}>
                {slotStatusLabel[slot.status]}
              </Text>
            </View>
          </View>
          <View style={styles.subHeaderRow}>
            <Text style={styles.zone}>{slot.zoneName}</Text>
            <View style={[styles.pill, { backgroundColor: `${typeColor}22` }]}>
              <Text style={[styles.pillText, { color: typeColor }]}>{slotTypeLabel[slot.type]}</Text>
            </View>
          </View>

          {slot.status === 'DangDauXe' && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Biển số xe</Text>
              <Text style={styles.infoValue}>{slot.currentLicensePlate ?? '—'}</Text>
              {checkInAt && (
                <>
                  <Text style={[styles.infoLabel, { marginTop: 10 }]}>Thời gian đậu</Text>
                  <Text style={styles.infoValue}>{formatDuration(checkInAt)}</Text>
                </>
              )}
            </View>
          )}

          {isLoadingExtra ? (
            <ActivityIndicator color={colors.textSecondary} style={{ marginVertical: 20 }} />
          ) : (
            <>
              {/* Nhóm 1: Ra vào xe */}
              {slot.status === 'Trong' && (
                <ActionGroup title="Ra vào xe">
                  <ActionButton
                    label="Check-in vào slot này"
                    color={colors.primary}
                    onPress={() => {
                      onClose();
                      onCheckIn(slot.slotId, slot.code);
                    }}
                  />
                </ActionGroup>
              )}
              {slot.status === 'DangDauXe' && sessionId && (
                <ActionGroup title="Ra vào xe">
                  <ActionButton
                    label="Check-out xe này"
                    color={colors.primary}
                    onPress={() => {
                      onClose();
                      onCheckOut(sessionId, slot.currentLicensePlate ?? '', slot.code);
                    }}
                  />
                </ActionGroup>
              )}

              {/* Nhóm 2: Hợp đồng vé tháng */}
              <ActionGroup title="Hợp đồng vé tháng">
                {contract ? (
                  <ActionButton
                    label="Xem hợp đồng"
                    color={colors.info}
                    onPress={() => {
                      onClose();
                      onViewContract(contract);
                    }}
                  />
                ) : slot.status === 'Trong' ? (
                  <ActionButton
                    label="Tạo hợp đồng"
                    color={colors.info}
                    onPress={() => {
                      onClose();
                      onCreateContract(slot.slotId, slot.code);
                    }}
                  />
                ) : (
                  <Text style={styles.hintText}>
                    Slot cần ở trạng thái Trống mới tạo được hợp đồng mới.
                  </Text>
                )}
              </ActionGroup>

              {/* Nhóm 3: Quản lý slot (Manager/Admin) */}
              {canManage && (
                <ActionGroup title="Quản lý slot">
                  <ActionButton
                    label="Sửa slot"
                    color={colors.textPrimary}
                    variant="secondary"
                    onPress={() => {
                      onClose();
                      onEditSlot(slot);
                    }}
                  />
                  <ActionButton
                    label={slot.status === 'BaoTri' ? 'Gỡ trạng thái bảo trì' : 'Đánh dấu bảo trì'}
                    color={colors.textPrimary}
                    variant="secondary"
                    loading={isTogglingMaintenance}
                    disabled={slot.status === 'DangDauXe'}
                    onPress={handleToggleMaintenance}
                  />
                  {slot.status === 'DangDauXe' && (
                    <Text style={styles.hintText}>
                      Không thể đánh dấu bảo trì khi slot đang có xe.
                    </Text>
                  )}
                </ActionGroup>
              )}
            </>
          )}

          <TouchableOpacity style={styles.closeLink} onPress={onClose}>
            <Text style={styles.closeLinkText}>Đóng</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function ActionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ActionButton({
  label,
  color,
  onPress,
  variant = 'primary',
  loading,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'primary'
          ? { backgroundColor: color }
          : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        disabled && styles.disabled,
      ]}
      disabled={disabled || loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.textPrimary} />
      ) : (
        <Text
          style={[
            styles.actionButtonText,
            { color: variant === 'primary' ? colors.white : color },
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
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
    maxHeight: '85%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotCode: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  zone: { color: colors.textSecondary, fontSize: 13 },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '600' },
  infoBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginTop: 16 },
  infoLabel: { color: colors.textMuted, fontSize: 12 },
  infoValue: { color: colors.textPrimary, fontSize: 17, fontWeight: '600', marginTop: 2 },
  group: { marginTop: 20 },
  groupTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabled: { opacity: 0.5 },
  actionButtonText: { fontWeight: '600', fontSize: 14 },
  hintText: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  closeLink: { alignItems: 'center', marginTop: 8 },
  closeLinkText: { color: colors.textMuted, fontSize: 13 },
});
