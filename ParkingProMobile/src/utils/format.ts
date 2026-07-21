import dayjs from 'dayjs';

export function formatCurrency(amount?: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return amount.toLocaleString('vi-VN') + ' đ';
}

export function formatDateTime(utcIso?: string | null): string {
  if (!utcIso) return '—';
  return dayjs(utcIso).format('HH:mm DD/MM/YYYY');
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return dayjs(iso).format('DD/MM/YYYY');
}

export function formatDuration(fromIso: string, toIso?: string | null): string {
  const start = dayjs(fromIso);
  const end = toIso ? dayjs(toIso) : dayjs();
  const minutes = end.diff(start, 'minute');
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours <= 0) return `${remMinutes} phút`;
  return `${hours} giờ ${remMinutes} phút`;
}
