"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Leaflet's default icon images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Report, ReportStatus } from '@/types';

// Fix Leaflet's default icon path issue with Webpack
// @ts-expect-error: _getIconUrl é interno do Leaflet e não está tipado em @types
delete L.Icon.Default.prototype._getIconUrl; // This is a common fix

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x, // Prefer .src, fallback to direct object
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});


type LeafletMapContainer = HTMLDivElement & { _leaflet_id?: number };

interface AdminLeafletMapProps {
  reports: Report[];
  handleUpdateStatus: (reportId: string, newStatus: ReportStatus) => Promise<void>;
}

const AdminLeafletMap: React.FC<AdminLeafletMapProps> = ({ reports, handleUpdateStatus }) => {
  const mapContainerRef = useRef<LeafletMapContainer | null>(null);
  const mapRef = useRef<L.Map | null>(null); // Use useRef for map instance
  const [markerLayer, setMarkerLayer] = useState<L.FeatureGroup | null>(null);

  const getStatusColor = (status?: ReportStatus) => {
    if (!status || status === 'pendente') return '#facc15'; // amarelo
    if (status === 'em_analise') return '#3b82f6'; // azul
    if (status === 'aprovada') return '#22c55e'; // verde
    if (status === 'resolvida') return '#10b981'; // verde esmeralda
    if (status === 'rejeitada') return '#ef4444'; // vermelho
    return '#6b7280'; // cinza
  };

  // Initialize map
  useEffect(() => {
    const container = mapContainerRef.current;

    if (container && !mapRef.current) {
      if (container._leaflet_id) {
        console.error("AdminLeafletMap: Container já possui _leaflet_id. Abortando inicialização do mapa.");
        return; 
      }
      
      const map = L.map(container).setView([-14.235004, -51.92528], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const newMarkerLayer = L.featureGroup().addTo(map);
      setMarkerLayer(newMarkerLayer);
      mapRef.current = map;

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        
        if (container) {
          if (container._leaflet_id) {
            delete container._leaflet_id;
          }
        }
      }
    };
  }, []);

  // Plot markers
  useEffect(() => {
    if (!mapRef.current || !markerLayer) return; // Use mapRef.current

    markerLayer.clearLayers();

    reports.forEach(report => {
      if (report.location && typeof report.location === 'object' && 
          typeof report.location.latitude === 'number' && 
          typeof report.location.longitude === 'number') {
        
        const lat = report.location.latitude;
        const lng = report.location.longitude;

        if (!isNaN(lat) && !isNaN(lng)) {
          let popupContent = `
            <div style="font-family: sans-serif; font-size: 14px;">
              <h4 style="margin-bottom: 5px; font-size: 16px; color: #333;">Detalhes da Denúncia</h4>
              <p><strong>ID:</strong> ${report.id}</p>
              <p><strong>Descrição:</strong> ${report.description || 'N/A'}</p>
              <p><strong>Categoria:</strong> ${report.category || 'N/A'}</p>
              <p><strong>Status:</strong> ${report.status || 'Pendente'}</p>
              <p><strong>Data:</strong> ${report.timestamp || 'N/A'}</p>
          `;

          if (report.userInfo && (report.userInfo.name || report.userInfo.email)) {
            popupContent += `<p><strong>Registrado por:</strong> ${report.userInfo.name || ''} ${report.userInfo.email ? '('+report.userInfo.email+')' : ''}</p>`;
          }

          if (report.imageUrls && report.imageUrls.length > 0) {
            popupContent += `<p style="margin-top: 8px;"><strong>Imagem:</strong><br/><img src="${report.imageUrls[0]}" alt="Imagem da denúncia" style="max-width: 150px; max-height: 150px; margin-top: 5px; border-radius: 4px;" /></p>`;
          }

          const currentStatus = report.status || 'pendente';
          popupContent += `
            <div style="margin-top: 10px;">
              <label for="status-select-${report.id}" style="margin-right: 5px;">Mudar Status:</label>
              <select id="status-select-${report.id}" style="padding: 5px; border-radius: 4px;">
                <option value="pendente" ${currentStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="em_analise" ${currentStatus === 'em_analise' ? 'selected' : ''}>Em Análise</option>
                <option value="aprovada" ${currentStatus === 'aprovada' ? 'selected' : ''}>Aprovada</option>
                <option value="resolvida" ${currentStatus === 'resolvida' ? 'selected' : ''}>Resolvida</option>
                <option value="rejeitada" ${currentStatus === 'rejeitada' ? 'selected' : ''}>Rejeitada</option>
              </select>
              <button id="update-status-btn-${report.id}" data-report-id="${report.id}" style="margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Atualizar</button>
            </div>
          `;
          
          popupContent += `</div>`;

          const markerIcon = L.divIcon({
            className: 'custom-status-marker',
            html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:999px;background-color:${getStatusColor(report.status)};border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4);"></span>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });

          const marker = L.marker([lat, lng], { icon: markerIcon })
            .bindPopup(popupContent)
            .addTo(markerLayer);

          marker.on('popupopen', () => {
            const btn = document.getElementById(`update-status-btn-${report.id}`);
            if (btn) {
              btn.replaceWith(btn.cloneNode(true)); 
              document.getElementById(`update-status-btn-${report.id}`)?.addEventListener('click', () => {
                const selectElement = document.getElementById(`status-select-${report.id}`) as HTMLSelectElement;
                if (selectElement) {
                  const newStatus = selectElement.value as 'pendente' | 'em_analise' | 'aprovada' | 'resolvida' | 'rejeitada';
                  handleUpdateStatus(report.id, newStatus).then(() => {
                    mapRef.current?.closePopup(); // Use mapRef.current
                  });
                }
              });
            }
          });
        }
      }
    });
  }, [reports, markerLayer, handleUpdateStatus]); // mapRef.current is stable, no need to include mapRef in deps

  return (
    <div ref={mapContainerRef} id="adminMapIdLeaflet" style={{ height: '100%', width: '100%' }} className="rounded shadow-lg bg-gray-200 relative">
      {/* Map is rendered here by Leaflet */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded-md shadow px-3 py-2 text-[10px] text-gray-700 space-y-1 border border-gray-200">
        <p className="font-semibold text-[11px]">Legenda de status</p>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor('pendente') }}></span>
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor('em_analise') }}></span>
          <span>Em Análise</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor('aprovada') }}></span>
          <span>Aprovada</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor('resolvida') }}></span>
          <span>Resolvida</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor('rejeitada') }}></span>
          <span>Rejeitada</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLeafletMap;
