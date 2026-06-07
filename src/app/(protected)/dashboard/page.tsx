"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import MapView from "@/components/MapView";

interface Stats {
  titikAktif: number;
  kendaraanTersedia: number;
  totalBantuan: number;
  totalJarak: number;
  distribusiBerjalan: number;
  distribusiSelesai: number;
  distribusiTertunda: number;
  totalBeratTerkirim: number;
  efisiensi: {
    jarakAwal: number;
    jarakOptimal: number;
    persentase: number;
  };
}

interface TitikBantuan {
  id: string;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  urgensi: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [markers, setMarkers] = useState<TitikBantuan[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, titikRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/titik-bantuan"),
      ]);
      const statsData = await statsRes.json();
      const titikData = await titikRes.json();
      setStats(statsData);
      setMarkers(titikData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            value={stats?.titikAktif ?? 0}
            label="Titik Bantuan Aktif"
            icon={<span>📍</span>}
          />
          <StatsCard
            value={stats?.kendaraanTersedia ?? 0}
            label="Kendaraan Tersedia"
            icon={<span>🚛</span>}
          />
          <StatsCard
            value={stats?.totalBantuan ?? 0}
            label="Total Bantuan"
            icon={<span>📦</span>}
            highlight
          />
          <StatsCard
            value={stats?.totalJarak ?? 0}
            label="Total Jarak Ditempuh"
            icon={<span>🛣️</span>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Ringkasan Distribusi */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-3">Ringkasan Distribusi</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Berjalan</span>
                  <span className="font-semibold">
                    {stats?.distribusiBerjalan ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Selesai</span>
                  <span className="font-semibold">
                    {stats?.distribusiSelesai ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tertunda</span>
                  <span className="font-semibold">
                    {stats?.distribusiTertunda ?? 0}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Total Bantuan Terkirim</span>
                  <span className="font-semibold">
                    {stats?.totalBeratTerkirim ?? 0} Kg
                  </span>
                </div>
              </div>
            </div>

            {/* Efisiensi Hari Ini */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-3">Efisiensi Hari Ini</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jarak Awal</span>
                  <span className="font-semibold">
                    {stats?.efisiensi?.jarakAwal ?? 0} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jarak Optimal</span>
                  <span className="font-semibold">
                    {stats?.efisiensi?.jarakOptimal ?? 0} km
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600">Efisiensi</span>
                  <span className="font-semibold text-green-600">
                    {stats?.efisiensi?.persentase ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-3">Peta Sebaran</h3>
            <div className="h-[400px] rounded-xl overflow-hidden">
              <MapView markers={markers} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
