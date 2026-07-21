import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterCustomerRequest, RegisterCustomerResponse } from '../types/api';

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then(r => r.data),

  revokeToken: (refreshToken: string) =>
    apiClient.post('/auth/revoke-token', { refreshToken }).then(r => r.data),

  /** Tạo tài khoản khách hàng mới (role Customer) — dùng khi tạo hợp đồng vé tháng cho khách chưa có tài khoản. */
  registerCustomer: (payload: RegisterCustomerRequest) =>
    apiClient
      .post<RegisterCustomerResponse>('/auth/register-customer', payload)
      .then(r => r.data),
};
