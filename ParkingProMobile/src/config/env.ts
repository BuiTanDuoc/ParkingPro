/**
 * Cấu hình môi trường cho app.
 *
 * - Android emulator: dùng 10.0.2.2 để trỏ về localhost của máy host.
 * - Thiết bị thật / iOS simulator: đổi thành IP LAN của máy chạy backend,
 *   hoặc domain thật khi đã deploy (vd: carbookingserver.adgps.vn dạng tương tự).
 */
import { Platform } from 'react-native';

const LOCAL_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// TODO: đổi sang domain thật khi deploy production, vd:
// export const API_BASE_URL = 'https://parkingpro.adgps.vn/api';
/* 
export const API_BASE_URL = __DEV__
  ? `http://${LOCAL_HOST}/api`
  : 'https://parkingproserver.adgps.vn/api';

export const API_ROOT_URL = __DEV__
  ? `http://${LOCAL_HOST}`
  : 'https://parkingpro.adgps.vn';

export const HUB_URL = `${API_ROOT_URL}/hubs/parking`;
 */

export const API_BASE_URL = 'https://parkingproserver.adgps.vn/api';

export const API_ROOT_URL = 'https://parkingproserver.adgps.vn';

export const HUB_URL = `https://parkingproserver.adgps.vn/hubs/parking`;

/** Nối URL ảnh tương đối trả về từ backend thành URL đầy đủ. */
export function resolveMediaUrl(relativeUrl?: string | null): string | undefined {
  if (!relativeUrl) return undefined;
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl;
  }
  return `${API_ROOT_URL}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
}
