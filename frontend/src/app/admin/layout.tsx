import { AuthProvider } from '@/contexts/AuthContext'; // Adjust path as needed
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
