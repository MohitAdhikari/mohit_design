import type { Status } from './types';

export const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    dot: string;
    border: string;
    text: string;
    bg: string;
    pillBorder: string;
    leftBorder: string;
    shadow: string;
  }
> = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.53)]',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    pillBorder: 'border-emerald-600/40',
    leftBorder: 'border-l-emerald-500',
    shadow:
      'hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:border-emerald-500/30',
  },
  notsure: {
    label: 'Not Sure',
    dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.53)]',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    pillBorder: 'border-amber-600/40',
    leftBorder: 'border-l-amber-500',
    shadow:
      'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:border-amber-500/30',
  },
  expired: {
    label: 'Expired',
    dot: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.53)]',
    border: 'border-red-500/30',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    pillBorder: 'border-red-600/40',
    leftBorder: 'border-l-red-500',
    shadow: '',
  },
};
