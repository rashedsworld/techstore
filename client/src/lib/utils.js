import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const takaFormatter = new Intl.NumberFormat('en-BD', { maximumFractionDigits: 2 });

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTaka(amount) {
  return `৳${takaFormatter.format(Number(amount) || 0)}`;
}