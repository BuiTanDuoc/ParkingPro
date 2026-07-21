import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse } from '../types/api';

const KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
} as const;

export interface StoredUser {
  userId: string;
  fullName: string;
  role: LoginResponse['role'];
}

export async function saveAuthSession(res: LoginResponse): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.accessToken, res.accessToken],
    [KEYS.refreshToken, res.refreshToken],
    [
      KEYS.user,
      JSON.stringify({
        userId: res.userId,
        fullName: res.fullName,
        role: res.role,
      } satisfies StoredUser),
    ],
  ]);
}

export async function updateAccessToken(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.accessToken, accessToken],
    [KEYS.refreshToken, refreshToken],
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.accessToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.refreshToken);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.accessToken, KEYS.refreshToken, KEYS.user]);
}
