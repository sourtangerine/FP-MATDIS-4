"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import DeliveryAnimationWrapper from "@/components/DeliveryAnimationWrapper";

interface Distribusi {
  id: string;
  titikBantuan: {
    id: string;
    nama: string;
    alamat: string;
    kecamatan: string;
    kelurahan: string;
    latitude: number;
    longitude: number;
    urgensi: string;
    jenisBantuan: string;
  };
  kendaraan: {
    id: string;
    nama: string;
    platNomor: string;
  };
  beratBantuan: number;
  status: string;
  waktuMulai: string;
  waktuSelesai: string | null;
  jarakOptimal: number | null;
  rutePath: { pathCoordinates?: [number, number][]; roadCoordinates?: [number, number][] } | null;
}

// Map jenisBantuan or urgensi to disaster type for visualization
function getDisasterType(jenisBantuan: string, nama: string): string {
  const text = (jenisBantuan + " " + nama).toLowerCase();
  if (text.includes("kebakaran") || text.includes("api")) return "kebakaran";
  if (text.includes("gempa")) return "gempa";
  if (text.includes("tsunami") || text.includes("gelombang")) return "tsunami";
  if (text.includes("banjir") || text.includes("air")) return "banjir";
  // Default based on urgensi/random
  const types = ["kebakaran", "gempa", "banjir", "tsunami"];
  const hash = nama.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return types[hash % types.length];
}

export default function LaporanPage() {
  const [distribusi, setDistribusi] = useState<Distribusi[]>([]);
  const [filterUrgensi, setFilterUrgensi] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Animation state
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationRoute, setAnimationRoute] = useState<[number, number][]>([]);
  const [animationTarget, setAnimationTarget] = useState("");
  const [animationDisaster, setAnimationDisaster] = useState("kebakaran");
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/distribusi");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDistribusi(data);
      }
    } catch (error) {
      console.error("Failed to fetch distribusi:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleKirim = async (d: Distribusi) => {
    setAnimatingId(d.id);

    // Get road route from API
    try {
      // Posko Pusat coordinates (depot)
      const poskoLat = -7.2575;
      const poskoLng = 112.7521;
      const destLat = d.titikBantuan.latitude;
      const destLng = d.titikBantuan.longitude;

      // Fetch OSRM route for animation
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${poskoLng},${poskoLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      let coordinates: [number, number][] = [];

      if (routeData.code === "Ok" && routeData.routes && routeData.routes.length > 0) {
        // OSRM returns [lng, lat], convert to [lat, lng]
        coordinates = routeData.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        // Sample every Nth point for smoother animation (limit to ~100 points)
        if (coordinates.length > 100) {
          const step = Math.floor(coordinates.length / 100);
          const sampled: [number, number][] = [];
          for (let i = 0; i < coordinates.length; i += step) {
            sampled.push(coordinates[i]);
          }
          // Always include the last point
          sampled.push(coordinates[coordinates.length - 1]);
          coordinates = sampled;
        }
      } else {
        // Fallback: straight line with intermediate points
        coordinates = [
          [poskoLat, poskoLng],
          [(poskoLat + destLat) / 2, (poskoLng + destLng) / 2],
          [destLat, destLng],
        ];
      }

      const disasterType = getDisasterType(
        d.titikBantuan.jenisBantuan || "",
        d.titikBantuan.nama
      );

      setAnimationRoute(coordinates);
      setAnimationTarget(d.titikBantuan.nama);
      setAnimationDisaster(disasterType);
      setShowAnimation(true);
    } catch (error) {
      console.error("Failed to get route for animation:", error);
      // Still mark as complete if animation fails
      await markSelesai(d.id);
    }
  };

  const markSelesai = async (id: string) => {
    try {
      const res = await fetch(`/api/distribusi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SELESAI" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update distribusi:", error);
    }
    setAnimatingId(null);
  };

  const handleAnimationComplete = () => {
    if (animatingId) {
      markSelesai(animatingId);
    }
  };

  const handleAnimationClose = () => {
    setShowAnimation(false);
    if (animatingId) {
      markSelesai(animatingId);
    }
  };

  const handleMarkBerjalan = async (id: string) => {
    try {
      const res = await fetch(`/api/distribusi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "BERJALAN" }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update distribusi:", error);
    }
  };

  const filtered = distribusi.filter((d) => {
    if (filterUrgensi !== "ALL" && d.titikBantuan.urgensi !== filterUrgensi) return false;
    if (filterStatus !== "ALL" && d.status !== filterStatus) return false;
    if (search && !d.titikBantuan.nama.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const mapMarkers = distribusi.map((d) => ({
    id: d.id,
    nama: d.titikBantuan.nama,
    alamat: `${d.titikBantuan.kecamatan}, ${d.titikBantuan.kelurahan}`,
    latitude: d.titikBantuan.latitude,
    longitude: d.titikBantuan.longitude,
    urgensi: d.titikBantuan.urgensi,
    status: d.status,
  }));

  const exportCSV = () => {
    const headers = ["Titik Bantuan", "Alamat", "Bantuan", "Waktu", "Urgensi", "Status"];
    const rows = filtered.map((d) => [
      d.titikBantuan.nama,
      `${d.titikBantuan.kecamatan} ${d.titikBantuan.kelurahan}`,
      `${d.beratBantuan} kg`,
      new Date(d.waktuMulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      d.titikBantuan.urgensi,
      d.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-distribusi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUrgensiColor = (urgensi: string) => {
    switch (urgensi) {
      case "TINGGI": return "text-red-500";
      case "SEDANG": return "text-yellow-500";
      case "RENDAH": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  return (
    <>
      <Header title="Laporan" />
      <div className="p-6 space-y-4">
        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[300px]">
          <MapView markers={mapMarkers} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterUrgensi}
              onChange={(e) => { setFilterUrgensi(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
            >
              <option value="ALL">Semua Urgensi</option>
              <option value="TINGGI">Tinggi</option>
              <option value="SEDANG">Sedang</option>
              <option value="RENDAH">Rendah</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="BERJALAN">Berjalan</option>
              <option value="SELESAI">Selesai</option>
              <option value="TERTUNDA">Tertunda</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama titik bantuan..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none flex-1 min-w-[200px]"
            />
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-sm font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Titik Bantuan</th>
                  <th className="text-left py-3 px-4 font-semibold">Alamat</th>
                  <th className="text-left py-3 px-4 font-semibold">Bantuan</th>
                  <th className="text-left py-3 px-4 font-semibold">Waktu</th>
                  <th className="text-left py-3 px-4 font-semibold">Urgensi</th>
                  <th className="text-left py-3 px-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{d.titikBantuan.nama}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {d.titikBantuan.kecamatan}, {d.titikBantuan.kelurahan}
                    </td>
                    <td className="py-3 px-4">{d.beratBantuan} kg</td>
                    <td className="py-3 px-4">
                      {new Date(d.waktuMulai).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className={`py-3 px-4 font-medium ${getUrgensiColor(d.titikBantuan.urgensi)}`}>
                      {d.titikBantuan.urgensi}
                    </td>
                    <td className="py-3 px-4">
                      {d.status === "SELESAI" ? (
                        <button
                          disabled
                          className="px-3 py-1 bg-[#3b82f6] text-white rounded-full text-xs font-medium opacity-70 cursor-not-allowed"
                        >
                          Selesai
                        </button>
                      ) : d.status === "BERJALAN" ? (
                        <button
                          onClick={() => handleKirim(d)}
                          disabled={animatingId === d.id}
                          className="px-3 py-1 border border-[#4338ca] text-[#4338ca] rounded-full text-xs font-medium hover:bg-[#4338ca] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {animatingId === d.id ? "⏳" : "Kirim"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkBerjalan(d.id)}
                          className="px-3 py-1 border border-gray-400 text-gray-500 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
                        >
                          Tertunda
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Tidak ada data distribusi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Animation Modal */}
      {showAnimation && animationRoute.length > 0 && (
        <DeliveryAnimationWrapper
          routeCoordinates={animationRoute}
          destinationName={animationTarget}
          disasterType={animationDisaster}
          onComplete={handleAnimationComplete}
          onClose={handleAnimationClose}
        />
      )}
    </>
  );
}
