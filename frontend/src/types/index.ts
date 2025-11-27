import type { Timestamp } from 'firebase/firestore';

export interface Report {
  id: string;
  description: string;
  category: string;
  location: { latitude: number; longitude: number } | string;
  imageUrls?: string[];
  timestamp: string; // Formatted string for display
  createdAt?: Timestamp; // Firestore Timestamp para filtros
  userInfo?: { name?: string; email?: string };
  status?: string;
}

export interface Category {
  id: string;
  name: string;
}
