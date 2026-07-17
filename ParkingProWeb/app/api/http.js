// Lớp gọi API dùng chung: tự đính kèm JWT, tự refresh token khi hết hạn (401),
// và tự phát sự kiện "auth:logout" khi refresh thất bại để AuthContext xử lý.

const ACCESS_TOKEN_KEY = 'parkingpro_access_token';
const REFRESH_TOKEN_KEY = 'parkingpro_refresh_token';

export const getApiBaseUrl = () =>
    (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ||
    'http://localhost:5080';

export const tokenStorage = {
    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },
    clear: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};

class ApiError extends Error {
    constructor(status, title, errors) {
        super(title || `Yêu cầu thất bại (HTTP ${status})`);
        this.status = status;
        this.errors = errors;
    }
}

let refreshPromise = null;

const doRefresh = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) throw new ApiError(401, 'Chưa đăng nhập.');

    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new ApiError(response.status, 'Phiên đăng nhập đã hết hạn.');

    const data = await response.json();
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
};

/**
 * @param {string} path - vd "/api/sessions/active"
 * @param {object} options - { method, body, isFormData, skipAuth }
 *   - body: object (JSON) hoặc FormData (khi isFormData=true)
 */
export const apiFetch = async (path, options = {}) => {
    const { method = 'GET', body, isFormData = false, skipAuth = false } = options;

    const buildHeaders = (token) => {
        const headers = {};
        if (!isFormData) headers['Content-Type'] = 'application/json';
        if (!skipAuth && token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const doFetch = async (token) => {
        return fetch(`${getApiBaseUrl()}${path}`, {
            method,
            headers: buildHeaders(token),
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        });
    };

    let response = await doFetch(tokenStorage.getAccessToken());

    // Access token hết hạn -> thử refresh 1 lần rồi gọi lại request gốc
    if (response.status === 401 && !skipAuth) {
        try {
            if (!refreshPromise) refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
            const newToken = await refreshPromise;
            response = await doFetch(newToken);
        } catch (err) {
            tokenStorage.clear();
            window.dispatchEvent(new CustomEvent('auth:logout'));
            throw new ApiError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        }
    }

    if (response.status === 204) return null;

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        throw new ApiError(response.status, data?.title || data?.message, data?.errors);
    }

    return data;
};

export { ApiError };
