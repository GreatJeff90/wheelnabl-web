'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing default Leaflet marker icons in React
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  center: [number, number];
  onLocationSelect?: (lat: number, lng: number) => void;
  pickup?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
}

function MapEvents({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Map({ center, onLocationSelect, pickup, destination }: MapProps) {
  return (
    <MapContainer center={center} zoom={14} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onSelect={onLocationSelect} />
      {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={markerIcon} />}
      {destination && <Marker position={[destination.lat, destination.lng]} icon={markerIcon} />}
    </MapContainer>
  );
}