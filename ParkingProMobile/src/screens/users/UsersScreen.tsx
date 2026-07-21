import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { usersApi } from '../../api/usersApi';
import { UserProfileDto } from '../../types/api';
import { colors, roleLabel } from '../../theme/colors';

export default function UsersScreen() {
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await usersApi.getAll(1, 100);
    setUsers(res.items);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const toggleActive = async (user: UserProfileDto) => {
    setBusyId(user.id);
    try {
      await usersApi.setActive(user.id, !user.isActive);
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      );
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={users}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={<Text style={styles.header}>Nhân viên & Quản lý</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>{roleLabel[item.role]}</Text>
          </View>
          <Switch
            value={item.isActive}
            disabled={busyId === item.id}
            onValueChange={() => toggleActive(item)}
            trackColor={{ true: colors.accent, false: colors.disabled }}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' },
  header: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  email: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  role: { color: colors.primary, fontSize: 12, marginTop: 4, fontWeight: '600' },
});
