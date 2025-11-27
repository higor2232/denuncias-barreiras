export interface Report {
  id: string;
  description: string;
  category: string;
  location: { latitude: number; longitude: number } | string;
  imageUrls?: string[];
  timestamp: any; // Formatted string for display
  createdAt?: any; // Firestore Timestamp or Date object for filtering
  userInfo?: { name?: string; email?: string };
  status?: string;
}

export interface Category {
  id: string;
  name: string;
}
