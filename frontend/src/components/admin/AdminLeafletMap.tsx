"use client";

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Leaflet's default icon images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Report } from '@/types';

console.log('Leaflet Icon Paths:', {
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Fix Leaflet's default icon path issue with Webpack
// @ts-expect-error: _getIconUrl é interno do Leaflet e não está tipado em @types
delete L.Icon.Default.prototype._getIconUrl; // This is a common fix

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src || markerIcon2x, // Prefer .src, fallback to direct object
  iconUrl: markerIcon.src || markerIcon,
  shadowUrl: markerShadow.src || markerShadow,
});

console.log('L.Icon.Default options after merge:', L.Icon.Default.prototype.options);

type LeafletMapContainer = HTMLDivElement & { _leaflet_id?: number };

interface AdminLeafletMapProps {
  reports: Report[];
  handleUpdateStatus: (reportId: string, newStatus: string) => Promise<void>;
}

const AdminLeafletMap: React.FC<AdminLeafletMapProps> = ({ reports, handleUpdateStatus }) => {
  const mapContainerRef = useRef<LeafletMapContainer | null>(null);
  const mapRef = useRef<L.Map | null>(null); // Use useRef for map instance
  const [markerLayer, setMarkerLayer] = useState<L.FeatureGroup | null>(null);

  // Initialize map
  useEffect(() => {
    console.log('AdminLeafletMap: Mount/Effect Run. mapRef.current:', mapRef.current);
    const container = mapContainerRef.current;
    if (container) {
      console.log('AdminLeafletMap: mapContainerRef.current._leaflet_id before init attempt:', container._leaflet_id);
    }

    if (container && !mapRef.current) {
      // Explicitly check _leaflet_id on the container before L.map()
      if (container._leaflet_id) {
        console.error("AdminLeafletMap: Container already has _leaflet_id. Aborting L.map(). This indicates an issue with cleanup or StrictMode.", container);
        return; 
      }
      
      console.log('AdminLeafletMap: Initializing map...');
      const map = L.map(container).setView([-14.235004, -51.92528], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const newMarkerLayer = L.featureGroup().addTo(map);
      setMarkerLayer(newMarkerLayer);
      mapRef.current = map;

      setTimeout(() => {
        if (mapRef.current) { // Check if map still exists
            mapRef.current.invalidateSize();
            console.log('AdminLeafletMap: invalidateSize called.');
        }
      }, 0);
    } else {
      if (!mapContainerRef.current) {
        console.warn('AdminLeafletMap: mapContainerRef.current is null. Cannot initialize map.');
      }
      if (mapRef.current) {
        console.log('AdminLeafletMap: Map already initialized (mapRef.current exists). Skipping init.');
      }
    }

    return () => {
      console.log('AdminLeafletMap: Cleanup Run. mapRef.current:', mapRef.current);
      if (mapRef.current) {
        console.log('AdminLeafletMap: Removing map instance.');
        mapRef.current.remove();
        mapRef.current = null;
        
        if (container) {
          console.log('AdminLeafletMap: container._leaflet_id after remove:', container._leaflet_id);
          if (container._leaflet_id) {
            console.error("AdminLeafletMap: _leaflet_id STILL PRESENT on container after map.remove(). Manually deleting.");
            delete container._leaflet_id;
          }
        }
      } else {
        console.log('AdminLeafletMap: Cleanup: No map instance to remove (mapRef.current is null).');
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

          const currentStatus = report.status || 'Pendente';
          popupContent += `
            <div style="margin-top: 10px;">
              <label for="status-select-${report.id}" style="margin-right: 5px;">Mudar Status:</label>
              <select id="status-select-${report.id}" style="padding: 5px; border-radius: 4px;">
                <option value="Pendente" ${currentStatus === 'Pendente' ? 'selected' : ''}>Pendente</option>
                <option value="Em Análise" ${currentStatus === 'Em Análise' ? 'selected' : ''}>Em Análise</option>
                <option value="Resolvido" ${currentStatus === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
              </select>
              <button id="update-status-btn-${report.id}" data-report-id="${report.id}" style="margin-left: 10px; padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Atualizar</button>
            </div>
          `;
          
          popupContent += `</div>`;

          const marker = L.marker([lat, lng])
            .bindPopup(popupContent)
            .addTo(markerLayer);

          marker.on('popupopen', () => {
            const btn = document.getElementById(`update-status-btn-${report.id}`);
            if (btn) {
              btn.replaceWith(btn.cloneNode(true)); 
              document.getElementById(`update-status-btn-${report.id}`)?.addEventListener('click', () => {
                const selectElement = document.getElementById(`status-select-${report.id}`) as HTMLSelectElement;
                if (selectElement) {
                  const newStatus = selectElement.value;
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
    <div ref={mapContainerRef} id="adminMapIdLeaflet" style={{ height: '100%', width: '100%' }} className="rounded shadow-lg bg-gray-200">
      {/* Map is rendered here by Leaflet */}
    </div>
  );
};

export default AdminLeafletMap;
