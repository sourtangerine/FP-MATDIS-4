"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface MarkerData {
  id: string;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  urgensi: string;
  status: string;
}

interface MapViewProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  polyline?: [number, number][];
  interactive?: boolean;
}

const MapComponent = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl">
      <p className="text-gray-500 text-sm">Memuat peta...</p>
    </div>
  ),
});

export default function MapView(props: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-xl">
        <p className="text-gray-500 text-sm">Memuat peta...</p>
      </div>
    );
  }

  return <MapComponent {...props} />;
}
