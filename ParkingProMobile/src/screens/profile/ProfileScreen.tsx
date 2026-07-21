import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useParkingLot } from '../../contexts/ParkingLotContext';
import { usersApi } from '../../api/usersApi';
import { UserProfileDto } from '../../types/api';
import { colors, roleLabel } from '../../theme/colors';
import { resolveMediaUrl } from '../../config/env';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { parkingLotName, clearParkingLot } = useParkingLot();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    usersApi.getMe().then(setProfile);
  }, []);

  const changeAvatar = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    const asset = res.assets?.[0];
    if (!asset) return;
    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await usersApi.updateAvatar(asset);
      setProfile(p => (p ? { ...p, avatarUrl } : p));
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleChangeParkingLot = () => {
    Alert.alert('Đổi bãi xe', 'Bạn sẽ cần nhập lại Id bãi xe khác. Tiếp tục?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đồng ý', onPress: clearParkingLot },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={changeAvatar} disabled={isUploadingAvatar}>
          <Image source={{ uri: resolveMediaUrl(profile.avatarUrl) }} style={styles.avatar} />
          {isUploadingAvatar && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{profile.fullName}</Text>
        <Text style={styles.role}>{roleLabel[profile.role]}</Text>
      </View>

      <View style={styles.section}>
        <Row label="Email" value={profile.email} />
        <Row label="Số điện thoại" value={profile.phoneNumber ?? '—'} />
        <Row label="Bãi xe hiện tại" value={parkingLotName ?? '—'} />
      </View>

      <TouchableOpacity style={styles.actionRow} onPress={handleChangeParkingLot}>
        <Text style={styles.actionText}>Đổi bãi xe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 12 },
  role: { color: colors.primary, fontSize: 13, marginTop: 2 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { color: colors.textMuted, fontSize: 13 },
  infoValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  actionRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  logoutRow: { borderColor: colors.danger },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});
