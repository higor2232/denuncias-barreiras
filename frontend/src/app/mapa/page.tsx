// src/app/mapa/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/firebase/config';
import { collection, getDocs, Timestamp } from 'firebase/firestore';

// Dynamic import to avoid SSR issues with Leaflet
const ReportMap = dynamic(() => import('@/components/ReportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Carregando mapa...</span>
    </div>
  ),
});

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  timestamp?: Timestamp;
}

const MapaPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const denunciasCollectionRef = collection(db, 'denuncias');
        const querySnapshot = await getDocs(denunciasCollectionRef);
        const fetchedReports: Report[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location && typeof data.location.latitude === 'number' && typeof data.location.longitude === 'number') {
            fetchedReports.push({
              id: doc.id,
              latitude: data.location.latitude,
              longitude: data.location.longitude,
              category: data.category || 'Categoria não informada',
              description: data.description || 'Sem descrição',
              timestamp: data.timestamp,
            });
          }
        });
        setReports(fetchedReports);
      } catch (err) {
        console.error("Erro ao buscar denúncias: ", err);
        setError('Falha ao carregar as denúncias no mapa.');
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Mapa de Denúncias
        </h1>
        <p className="text-gray-600">
          Visualize todas as denúncias ambientais registradas na região
        </p>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            {reports.length} denúncia{reports.length !== 1 ? 's' : ''} registrada{reports.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Map Container */}
      {loading ? (
        <div className="h-[500px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Carregando mapa e denúncias...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <ReportMap reports={reports} />
        </div>
      )}

      {/* Legend */}
      {!loading && !error && reports.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-md">
          <h3 className="font-semibold text-gray-800 mb-2">Legenda</h3>
          <p className="text-sm text-gray-600">
            Clique nos marcadores no mapa para ver detalhes de cada denúncia.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapaPage;
