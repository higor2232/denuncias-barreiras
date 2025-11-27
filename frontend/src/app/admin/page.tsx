import React from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard'; // Adjust path if necessary

// Basic metadata for the page (optional but good practice)
export const metadata = {
  title: 'Painel Administrativo - Denúncias Ambientais',
  description: 'Gerenciamento de denúncias ambientais.',
};

const AdminPage = () => {
  return (
    <main>
      <AdminDashboard />
    </main>
  );
};

export default AdminPage;
