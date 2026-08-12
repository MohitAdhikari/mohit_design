export interface CodeItem {
  code: string;
  reward: string;
  status: 'active' | 'notsure' | 'expired';
  addedDate: string;
  lastChecked: string;
}

export interface PollOption {
  label: string;
  percent: number;
  barClass: string;
}

export type Status = CodeItem['status'];
