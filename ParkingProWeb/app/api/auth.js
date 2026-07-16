import { apiFetch, tokenStorage } from './http';

export const login = async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: { email, password },
    });
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
};

export const logoutApi = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    if (!refreshToken) return;
    try {
        await apiFetch('/api/auth/revoke-token', { method: 'POST', body: { refreshToken } });
    } catch (e) {
        // Bỏ qua lỗi khi logout, token cục bộ đã bị xóa rồi
    }
};
