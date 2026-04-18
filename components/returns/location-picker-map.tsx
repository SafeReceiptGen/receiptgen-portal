"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Accra — default map view before a pin is placed */
export const DEFAULT_MAP_CENTER: [number, number] = [5.6037, -0.187];
const DEFAULT_ZOOM_NO_PIN = 12;
const DEFAULT_ZOOM_WITH_PIN = 16;

// Fix Leaflet default marker icons in bundlers (Next.js)
const ICON = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

function MapClickHandler({
  onMapClick,
  disabled,
}: {
  onMapClick: (lat: number, lng: number) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function LocationPickerMap({
  markerPosition,
  onMarkerDragEnd,
  onMapClick,
}: {
  markerPosition: [number, number] | null;
  onMarkerDragEnd: (lat: number, lng: number) => void;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const center = markerPosition ?? DEFAULT_MAP_CENTER;
  const zoom = markerPosition ? DEFAULT_ZOOM_WITH_PIN : DEFAULT_ZOOM_NO_PIN;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="z-0 h-[220px] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10"
      scrollWheelZoom
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter lat={center[0]} lng={center[1]} zoom={zoom} />
      <MapClickHandler onMapClick={onMapClick} disabled={false} />
      {markerPosition && (
        <Marker
          position={markerPosition}
          draggable
          icon={ICON}
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const p = m.getLatLng();
              onMarkerDragEnd(p.lat, p.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
