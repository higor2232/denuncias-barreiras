"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Report } from '@/types';

// Dynamically import the map component to ensure it's client-side only
const AdminLeafletMap = dynamic(() => import('@/components/admin/AdminLeafletMap'), {
  ssr: false,
  loading: () => <div style={{ height: '600px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p className='p-4 text-center text-gray-500'>Carregando mapa...</p></div>
});

const AdminMapPage: React.FC = () => {
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingReports(true);
    setError(null);
    try {
      const reportsCollectionRef = collection(db, 'denuncias');
      const q = query(reportsCollectionRef, orderBy('createdAt', 'desc'));
      const reportSnapshot = await getDocs(q);
      const reportList = reportSnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
        timestamp: docSnapshot.data().createdAt?.toDate ? docSnapshot.data().createdAt.toDate().toLocaleString() : 'Data inválida',
      })) as Report[];
      setReports(reportList);
    } catch (err) {
      console.error("Error fetching reports for admin map: ", err);
      setError('Falha ao carregar denúncias.');
    }
    setIsLoadingReports(false);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchReports();
    }
  }, [currentUser, fetchReports]);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    console.log(`Updating status for report ${reportId} to ${newStatus}`);
    try {
      const reportRef = doc(db, 'denuncias', reportId);
      await updateDoc(reportRef, { status: newStatus });

      setReports(prevReports =>
        prevReports.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      );
      alert('Status atualizado com sucesso!');
      // The AdminLeafletMap component can handle closing its own popups if needed
    } catch (err) {
      console.error("Error updating status: ", err);
      alert('Falha ao atualizar status.');
    }
  };

  if (isLoadingAuth) { // Simplified initial loading check
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Carregando autenticação...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600 mb-4">Acesso Negado</p>
        <p className="text-gray-700 mb-6">Você precisa estar logado como administrador para acessar esta página.</p>
        <Link href="/admin/login" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Ir para Login
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }
  
  // Show loading for reports if user is authenticated but reports are still fetching
  if (isLoadingReports) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Carregando denúncias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Mapa de Denúncias - Admin</h1>
          <Link href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Voltar para o Painel
          </Link>
        </div>
        
        <div style={{ height: '600px', width: '100%' }} className="rounded shadow bg-gray-200 relative">
        {/* Conditional rendering for the map or no reports message */}
        {reports.length > 0 ? (
          <AdminLeafletMap reports={reports} handleUpdateStatus={handleUpdateStatus} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p className='p-4 text-center text-gray-500'>Nenhuma denúncia encontrada para exibir no mapa.</p>
          </div>
        )}
        </div>

        <p className="mt-4 text-center text-gray-600">Total de denúncias carregadas: {reports.length}</p>
      </div>
    </div>
  );
};

export default AdminMapPage;