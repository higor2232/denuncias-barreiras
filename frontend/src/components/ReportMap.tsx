// src/components/ReportMap.tsx
"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L to fix marker icon issue

// Fix for default marker icon issue with Webpack
// See: https://github.com/PaulLeCam/react-leaflet/issues/808
const iconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void };
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  // Add other relevant report fields if needed for popups
}

interface ReportMapProps {
  reports: Report[]; // We'll pass the report data as props
  center?: [number, number];
  zoom?: number;
}

const ReportMap: React.FC<ReportMapProps> = ({ 
  reports = [], 
  center = [-15.7801, -47.9292], // Default center (Brasilia, Brazil)
  zoom = 4 
}) => {
  if (typeof window === 'undefined') {
    // Don't render the map on the server
    return null;
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map(report => (
        <Marker key={report.id} position={[report.latitude, report.longitude]}>
          <Popup>
            <strong>{report.category}</strong><br />
            {report.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ReportMap;
