"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

interface MarkerData {
  id: string;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  urgensi: string;
  status: string;
}

interface MapInnerProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  polyline?: [number, number][];
  interactive?: boolean;
}

function getMarkerIcon(urgensi: string): L.Icon {
  const color =
    urgensi === "TINGGI" ? "#ef4444" : urgensi === "SEDANG" ? "#f59e0b" : "#22c55e";

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

const depotIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="#4338ca"/>
      <circle cx="12" cy="12" r="6" fill="white"/>
      <text x="12" y="16" text-anchor="middle" font-size="10" fill="#4338ca" font-weight="bold">P</text>
    </svg>
  `)}`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

export default function MapInner({
  markers = [],
  center = [-7.2575, 112.7521],
  zoom = 12,
  polyline,
  interactive = true,
}: MapInnerProps) {
  useEffect(() => {
    // Fix leaflet default icon issue
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-xl"
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={getMarkerIcon(marker.urgensi)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{marker.nama}</p>
              <p className="text-gray-600">{marker.alamat}</p>
              <p>
                Status:{" "}
                <span className="font-medium">
                  {marker.status.replace("_", " ")}
                </span>
              </p>
              <p>
                Urgensi:{" "}
                <span
                  className={
                    marker.urgensi === "TINGGI"
                      ? "text-red-500"
                      : marker.urgensi === "SEDANG"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }
                >
                  {marker.urgensi}
                </span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      {polyline && polyline.length > 1 && (
        <Polyline positions={polyline} color="#4338ca" weight={4} opacity={0.8} />
      )}
    </MapContainer>
  );
}

export { depotIcon, getMarkerIcon };
