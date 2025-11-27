import type { Timestamp } from 'firebase/firestore';

export const REPORT_STATUSES = ['pendente', 'em_analise', 'aprovada', 'resolvida', 'rejeitada'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface Report {
  id: string;
  description: string;
  category: string;
  location: { latitude: number; longitude: number } | string;
  imageUrls?: string[];
  timestamp: string; // Formatted string for display
  createdAt?: Timestamp; // Firestore Timestamp para filtros
  userInfo?: { name?: string; email?: string };
  status?: ReportStatus;
}

export interface Category {
  id: string;
  name: string;
}
