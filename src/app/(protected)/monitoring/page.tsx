"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";

interface TitikBantuan {
  id: string;
  nama: string;
  alamat: string;
  kecamatan: string;
  kelurahan: string;
  latitude: number;
  longitude: number;
  urgensi: string;
  status: string;
  jenisBantuan: string;
}

export default function MonitoringPage() {
  const [titikBantuan, setTitikBantuan] = useState<TitikBantuan[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/titik-bantuan");
      const data = await res.json();
      setTitikBantuan(data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkSelesai = async (id: string) => {
    try {
      const res = await fetch(`/api/titik-bantuan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SELESAI" }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const handleMarkTertunda = async (id: string) => {
    try {
      const res = await fetch(`/api/titik-bantuan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TERTUNDA" }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SEDANG_DIKIRIM":
        return "text-yellow-500";
      case "SELESAI":
        return "text-green-500";
      case "MENUNGGU":
        return "text-gray-500";
      case "TERTUNDA":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SEDANG_DIKIRIM":
        return "Sedang Dikirim";
      case "SELESAI":
        return "Selesai";
      case "MENUNGGU":
        return "Menunggu";
      case "TERTUNDA":
        return "Tertunda";
      default:
        return status;
    }
  };

  const activeTitik = titikBantuan.filter((t) => t.status !== "SELESAI");
  const featured = activeTitik[0];
  const others = activeTitik.slice(1);

  return (
    <>
      <Header title="Monitoring" />
      <div className="p-6 space-y-4">
        {/* Featured Card */}
        {featured && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-start justify-between p-4">
              <h3 className="font-bold text-lg">Titik 1 — {featured.nama}</h3>
              <div className="text-right">
                <p className="text-sm font-medium">Status</p>
                <p className={`font-semibold ${getStatusStyle(featured.status)}`}>
                  {getStatusLabel(featured.status)}
                </p>
              </div>
            </div>
            <div className="h-[300px]">
              <MapView
                markers={[
                  {
                    id: featured.id,
                    nama: featured.nama,
                    alamat: featured.alamat,
                    latitude: featured.latitude,
                    longitude: featured.longitude,
                    urgensi: featured.urgensi,
                    status: featured.status,
                  },
                ]}
                center={[featured.latitude, featured.longitude]}
                zoom={15}
              />
            </div>
            {expandedId === featured.id && (
              <div className="p-4 border-t bg-gray-50">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <p><span className="font-medium">Alamat:</span> {featured.alamat}</p>
                  <p><span className="font-medium">Urgensi:</span> {featured.urgensi}</p>
                  <p><span className="font-medium">Jenis:</span> {featured.jenisBantuan}</p>
                  <p><span className="font-medium">Kecamatan:</span> {featured.kecamatan}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkSelesai(featured.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    Tandai Selesai
                  </button>
                  <button
                    onClick={() => handleMarkTertunda(featured.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Tandai Tertunda
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
              className="w-full py-2 text-sm text-[#4338ca] hover:bg-gray-50 border-t"
            >
              {expandedId === featured.id ? "Tutup" : "Lihat Detail"}
            </button>
          </div>
        )}

        {/* Grid of other titik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map((titik, idx) => (
            <div
              key={titik.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-3">
                <h4 className="font-semibold text-sm">
                  Titik {idx + 2} — {titik.nama}
                </h4>
                <span className={`text-xs font-medium ${getStatusStyle(titik.status)}`}>
                  {getStatusLabel(titik.status)}
                </span>
              </div>
              <div className="h-[150px]">
                <MapView
                  markers={[
                    {
                      id: titik.id,
                      nama: titik.nama,
                      alamat: titik.alamat,
                      latitude: titik.latitude,
                      longitude: titik.longitude,
                      urgensi: titik.urgensi,
                      status: titik.status,
                    },
                  ]}
                  center={[titik.latitude, titik.longitude]}
                  zoom={15}
                  interactive={false}
                />
              </div>
              {expandedId === titik.id && (
                <div className="p-3 border-t bg-gray-50">
                  <div className="text-xs space-y-1 mb-2">
                    <p><span className="font-medium">Alamat:</span> {titik.alamat}</p>
                    <p><span className="font-medium">Urgensi:</span> {titik.urgensi}</p>
                    <p><span className="font-medium">Jenis:</span> {titik.jenisBantuan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkSelesai(titik.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Tandai Selesai
                    </button>
                    <button
                      onClick={() => handleMarkTertunda(titik.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Tandai Tertunda
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setExpandedId(expandedId === titik.id ? null : titik.id)}
                className="w-full py-2 text-xs text-[#4338ca] hover:bg-gray-50 border-t"
              >
                {expandedId === titik.id ? "Tutup" : "Detail"}
              </button>
            </div>
          ))}
        </div>

        {titikBantuan.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Tidak ada data titik bantuan
          </div>
        )}
      </div>
    </>
  );
}
