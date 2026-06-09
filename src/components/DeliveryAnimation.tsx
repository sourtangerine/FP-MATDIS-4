"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

interface DeliveryAnimationProps {
  routeCoordinates: [number, number][];
  destinationName: string;
  disasterType: string;
  onComplete: () => void;
  onClose: () => void;
}

// Truck icon
const truckIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <rect x="4" y="12" width="24" height="16" rx="2" fill="#4338ca"/>
      <rect x="28" y="16" width="10" height="12" rx="1" fill="#6366f1"/>
      <circle cx="12" cy="30" r="4" fill="#1e1b4b" stroke="white" stroke-width="1.5"/>
      <circle cx="24" cy="30" r="4" fill="#1e1b4b" stroke="white" stroke-width="1.5"/>
      <circle cx="34" cy="30" r="3" fill="#1e1b4b" stroke="white" stroke-width="1.5"/>
      <rect x="30" y="18" width="6" height="5" rx="1" fill="#93c5fd"/>
      <text x="14" y="24" text-anchor="middle" font-size="8" fill="white" font-weight="bold">+</text>
    </svg>
  `)}`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Disaster icons based on type
function getDisasterIcon(type: string): L.Icon {
  const icons: Record<string, string> = {
    kebakaran: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
      <path d="M18 6c0 0-8 8-8 14 a8 8 0 0 0 16 0c0-6-8-14-8-14z" fill="#ef4444" opacity="0.8"/>
      <path d="M18 12c0 0-4 4-4 8 a4 4 0 0 0 8 0c0-4-4-8-4-8z" fill="#fbbf24"/>
    </svg>`,
    gempa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
      <path d="M6 18 L10 14 L14 22 L18 10 L22 26 L26 16 L30 18" stroke="#ef4444" stroke-width="2.5" fill="none"/>
      <path d="M8 24 L12 20 L16 26 L20 18 L24 28 L28 22" stroke="#f59e0b" stroke-width="1.5" fill="none"/>
    </svg>`,
    tsunami: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
      <path d="M4 20 Q9 14 14 20 Q19 26 24 20 Q29 14 34 20" stroke="#3b82f6" stroke-width="2.5" fill="none"/>
      <path d="M4 24 Q9 18 14 24 Q19 30 24 24 Q29 18 34 24" stroke="#60a5fa" stroke-width="2" fill="none"/>
      <path d="M4 16 Q9 10 14 16 Q19 22 24 16 Q29 10 34 16" stroke="#93c5fd" stroke-width="1.5" fill="none"/>
    </svg>`,
    banjir: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
      <path d="M6 16 Q10 12 14 16 Q18 20 22 16 Q26 12 30 16" stroke="#3b82f6" stroke-width="2" fill="none"/>
      <path d="M6 22 Q10 18 14 22 Q18 26 22 22 Q26 18 30 22" stroke="#3b82f6" stroke-width="2" fill="none"/>
      <rect x="14" y="8" width="8" height="10" fill="#64748b" opacity="0.5"/>
      <path d="M12 18 L18 12 L24 18" fill="#94a3b8" opacity="0.5"/>
    </svg>`,
  };

  const svg = icons[type] || icons.kebakaran;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

// Start marker (Posko Pusat)
const startIcon = L.icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#4338ca"/>
      <circle cx="16" cy="14" r="7" fill="white"/>
      <text x="16" y="18" text-anchor="middle" font-size="10" fill="#4338ca" font-weight="bold">P</text>
    </svg>
  `)}`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
});

// Animate the truck along the route
function AnimatedTruck({
  route,
  speed,
  onFinish,
}: {
  route: [number, number][];
  speed: number;
  onFinish: () => void;
}) {
  const [position, setPosition] = useState<[number, number]>(route[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const map = useMap();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (route.length < 2) return;

    // Fit map to route bounds
    const bounds = L.latLngBounds(route.map((c) => L.latLng(c[0], c[1])));
    map.fitBounds(bounds, { padding: [50, 50] });

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 1;
      if (idx >= route.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onFinish();
        return;
      }
      setPosition(route[idx]);
      setCurrentIndex(idx);
      // Pan map to follow truck
      map.panTo(route[idx], { animate: true, duration: 0.3 });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [route, speed, map, onFinish]);

  return (
    <>
      {/* Trail - completed path */}
      {currentIndex > 0 && (
        <Polyline
          positions={route.slice(0, currentIndex + 1)}
          color="#22c55e"
          weight={5}
          opacity={0.7}
        />
      )}
      {/* Remaining path */}
      <Polyline
        positions={route.slice(currentIndex)}
        color="#4338ca"
        weight={4}
        opacity={0.5}
        dashArray="8 12"
      />
      {/* Truck */}
      <Marker position={position} icon={truckIcon} />
    </>
  );
}

export default function DeliveryAnimation({
  routeCoordinates,
  destinationName,
  disasterType,
  onComplete,
  onClose,
}: DeliveryAnimationProps) {
  const [animationDone, setAnimationDone] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Fix leaflet icon issue
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const startPoint = routeCoordinates[0];
  const endPoint = routeCoordinates[routeCoordinates.length - 1];
  const center: [number, number] = [
    (startPoint[0] + endPoint[0]) / 2,
    (startPoint[1] + endPoint[1]) / 2,
  ];

  const handleFinish = () => {
    setAnimationDone(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl w-[90vw] max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#1e1b4b] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Pengiriman Bantuan</h2>
            <p className="text-sm text-white/70">
              Posko Pusat → {destinationName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {animationDone ? (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                ✓ Bantuan Terkirim!
              </span>
            ) : started ? (
              <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                🚛 Sedang Dikirim...
              </span>
            ) : (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Siap Kirim
              </span>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={13}
            className="w-full h-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Start point - Posko Pusat */}
            <Marker position={startPoint} icon={startIcon}>
              <Popup>
                <strong>Posko Pusat</strong>
                <br />
                Titik Awal Distribusi
              </Popup>
            </Marker>

            {/* End point - Disaster location */}
            <Marker position={endPoint} icon={getDisasterIcon(disasterType)}>
              <Popup>
                <strong>{destinationName}</strong>
                <br />
                Bencana: {disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}
              </Popup>
            </Marker>

            {/* Animated truck */}
            {started && !animationDone && (
              <AnimatedTruck
                route={routeCoordinates}
                speed={80}
                onFinish={handleFinish}
              />
            )}

            {/* Show full route before animation starts */}
            {!started && (
              <Polyline
                positions={routeCoordinates}
                color="#4338ca"
                weight={4}
                opacity={0.6}
                dashArray="8 12"
              />
            )}

            {/* Show completed route after animation */}
            {animationDone && (
              <Polyline
                positions={routeCoordinates}
                color="#22c55e"
                weight={5}
                opacity={0.8}
              />
            )}
          </MapContainer>

          {/* Disaster type badge */}
          <div className="absolute top-4 right-4 z-[1000]">
            <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
              disasterType === "kebakaran" ? "bg-red-100 text-red-800 border border-red-300" :
              disasterType === "gempa" ? "bg-orange-100 text-orange-800 border border-orange-300" :
              disasterType === "tsunami" ? "bg-blue-100 text-blue-800 border border-blue-300" :
              "bg-cyan-100 text-cyan-800 border border-cyan-300"
            }`}>
              {disasterType === "kebakaran" && "🔥 Kebakaran"}
              {disasterType === "gempa" && "🌍 Gempa Bumi"}
              {disasterType === "tsunami" && "🌊 Tsunami"}
              {disasterType === "banjir" && "💧 Banjir"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-[#4338ca] rounded-full mr-1"></span>
            Rute optimal (aman dari bencana)
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-4 mr-1"></span>
            Sudah dilalui
          </div>
          {!started ? (
            <button
              onClick={() => setStarted(true)}
              className="px-6 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg font-medium transition-colors"
            >
              🚛 Mulai Kirim
            </button>
          ) : animationDone ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              ✓ Selesai
            </button>
          ) : (
            <span className="text-sm text-gray-500 italic">
              Kendaraan sedang dalam perjalanan...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
