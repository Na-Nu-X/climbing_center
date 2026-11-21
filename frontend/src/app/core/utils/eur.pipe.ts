import { Pipe, PipeTransform } from '@angular/core';

const EUR = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' });
const EUR_ROUND = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatEur(value: string | number | null | undefined, compact = false): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(amount)) return '—';
  return (compact && Number.isInteger(amount) ? EUR_ROUND : EUR).format(amount);
}

/** Formats a decimal string/number as Slovak EUR, e.g. `13,00 €` (or `13 €` with `compact`). */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: string | number | null | undefined, compact = false): string {
    return formatEur(value, compact);
  }
}

/** Formats a decimal string like `16.5` as `16,5`. */
@Pipe({ name: 'skDecimal' })
export class SkDecimalPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString('sk-SK', { maximumFractionDigits: 1 }) : String(value);
  }
}
