import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/authApi';
import { setOnSessionExpired } from '../api/client';
import {
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  saveAuthSession,
  StoredUser,
} from '../utils/storage';

interface AuthContextValue {
  user: StoredUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    try {
      if (refreshToken) await authApi.revokeToken(refreshToken);
    } catch {
      // Bỏ qua lỗi revoke — vẫn xoá session ở local để đăng xuất triệt để
    }
    await clearAuthSession();
    setUser(null);
  }, []);

  useEffect(() => {
    // Khi refresh token cũng hết hạn, client.ts sẽ gọi callback này để buộc đăng xuất
    setOnSessionExpired(() => setUser(null));

    (async () => {
      const stored = await getStoredUser();
      setUser(stored);
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    await saveAuthSession(res);
    setUser({ userId: res.userId, fullName: res.fullName, role: res.role });
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
