import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Format date as DD.MM.YY
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd.MM.yy');
}

// Format date for display (Сегодня, Вчера, or DD.MM.YY)
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return 'Сегодня';
  if (isYesterday(d)) return 'Вчера';

  return format(d, 'dd.MM.yy');
}

// Format time as HH:mm
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

// Format full date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'dd MMM yyyy, HH:mm', { locale: ru });
}

// Get current date in DD.MM.YY format
export function getCurrentDate(): string {
  return formatShortDate(new Date());
}
