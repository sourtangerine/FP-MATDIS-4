"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import MapView from "@/components/MapView";
import DijkstraGraph from "@/components/DijkstraGraph";

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

interface GraphNode {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  x: number;
  y: number;
  isDepot: boolean;
}

interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
  weight: number;
}

interface Kendaraan {
  id: string;
  nama: string;
  platNomor: string;
  kapasitas: number;
  status: string;
}

interface RouteResult {
  path: string[];
  pathLabels: string[];
  totalCost: number;
  found: boolean;
  pathCoordinates: [number, number][];
}

export default function MapPage() {
  const [titikBantuan, setTitikBantuan] = useState<TitikBantuan[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [polyline, setPolyline] = useState<[number, number][]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Route planner
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  // Add location form
  const [addForm, setAddForm] = useState({
    nama: "",
    alamat: "",
    kecamatan: "",
    kelurahan: "",
    urgensi: "SEDANG",
    jenisBantuan: "",
    latitude: "",
    longitude: "",
  });

  // Setup form
  const [setupForm, setSetupForm] = useState({
    titikBantuanId: "",
    kendaraanId: "",
    beratBantuan: "",
  });
  const [setupLoading, setSetupLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [titikRes, ruteRes, kendaraanRes] = await Promise.all([
        fetch("/api/titik-bantuan"),
        fetch("/api/rute"),
        fetch("/api/kendaraan"),
      ]);
      const titikData = await titikRes.json();
      const ruteData = await ruteRes.json();
      const kendaraanData = await kendaraanRes.json();
      setTitikBantuan(titikData);
      setGraphNodes(ruteData.nodes || []);
      setGraphEdges(ruteData.edges || []);
      setKendaraan(kendaraanData);
    } catch (error) {
      console.error("Failed to fetch map data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleComputeRoute = async () => {
    if (!fromId || !toId) return;
    setRouteLoading(true);
    try {
      const res = await fetch("/api/rute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId, toId }),
      });
      const data = await res.json();
      setRouteResult(data);
      if (data.pathCoordinates) {
        setPolyline(data.pathCoordinates);
      }
    } catch (error) {
      console.error("Failed to compute route:", error);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleAddTitik = async () => {
    try {
      const res = await fetch("/api/titik-bantuan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({
          nama: "",
          alamat: "",
          kecamatan: "",
          kelurahan: "",
          urgensi: "SEDANG",
          jenisBantuan: "",
          latitude: "",
          longitude: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add titik:", error);
    }
  };

  const handleSetup = async () => {
    if (!setupForm.titikBantuanId || !setupForm.kendaraanId || !setupForm.beratBantuan) return;
    setSetupLoading(true);
    try {
      const res = await fetch("/api/distribusi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setupForm),
      });
      if (res.ok) {
        setShowSetupModal(false);
        setSetupForm({ titikBantuanId: "", kendaraanId: "", beratBantuan: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create distribusi:", error);
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <>
      <Header title="Map" />
      <div className="p-6 flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-lg mr-4">Peta Sebaran</h2>
            {[
              { icon: "📋", label: "Data Penerbangan", action: () => {} },
              { icon: "🌐", label: "Perencanaan Penerbangan", action: () => setShowRouteModal(true) },
              { icon: "⚙️", label: "Setup", action: () => setShowSetupModal(true) },
              { icon: "🖥️", label: "Simulasi", action: handleComputeRoute },
              { icon: "📺", label: "Monitoring", action: () => window.location.href = "/monitoring" },
              { icon: "➕", label: "Tambah Titik", action: () => setShowAddModal(true) },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600"
                title={btn.label}
              >
                <span className="text-lg">{btn.icon}</span>
                <span className="whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <MapView markers={titikBantuan} polyline={polyline} />
          </div>

          {/* Info Panel */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-auto">
            <h3 className="font-bold mb-3">Titik Posko Pusat</h3>
            {graphNodes.filter((n) => n.isDepot).map((node) => (
              <div key={node.id} className="text-sm space-y-1 mb-4">
                <p><span className="font-medium">Lat</span> {node.latitude}</p>
                <p><span className="font-medium">Long</span> {node.longitude}</p>
                <p><span className="font-medium">Alt</span> 0</p>
              </div>
            ))}

            {routeResult && routeResult.found && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-bold text-sm text-green-800 mb-1">Rute Optimal</p>
                <p className="text-xs text-green-700">
                  {routeResult.pathLabels.join(" → ")}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Total: {routeResult.totalCost} km
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Table */}
        <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Titik Bantuan</th>
                  <th className="text-left py-2 px-3 font-semibold">Lat</th>
                  <th className="text-left py-2 px-3 font-semibold">Long</th>
                  <th className="text-left py-2 px-3 font-semibold">Alt</th>
                </tr>
              </thead>
              <tbody>
                {titikBantuan.map((titik, idx) => (
                  <tr key={titik.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 px-3">{idx + 1}</td>
                    <td className="py-2 px-3">{titik.latitude.toFixed(6)}</td>
                    <td className="py-2 px-3">{titik.longitude.toFixed(6)}</td>
                    <td className="py-2 px-3">0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Titik Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Tambah Titik Bantuan</h2>
            <div className="space-y-3">
              {[
                { key: "nama", label: "Nama Titik", type: "text" },
                { key: "alamat", label: "Alamat", type: "text" },
                { key: "kecamatan", label: "Kecamatan", type: "text" },
                { key: "kelurahan", label: "Kelurahan", type: "text" },
                { key: "jenisBantuan", label: "Jenis Bantuan", type: "text" },
                { key: "latitude", label: "Latitude", type: "number" },
                { key: "longitude", label: "Longitude", type: "number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={addForm[field.key as keyof typeof addForm]}
                    onChange={(e) =>
                      setAddForm({ ...addForm, [field.key]: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgensi
                </label>
                <select
                  value={addForm.urgensi}
                  onChange={(e) =>
                    setAddForm({ ...addForm, urgensi: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                >
                  <option value="TINGGI">Tinggi</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="RENDAH">Rendah</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddTitik}
                className="flex-1 bg-[#4338ca] hover:bg-[#3730a3] text-white py-2 rounded-lg text-sm font-medium"
              >
                Simpan
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route Planner Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Perencanaan Rute (Dijkstra)</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titik Asal
                </label>
                <select
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                >
                  <option value="">Pilih titik asal</option>
                  {graphNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titik Tujuan
                </label>
                <select
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                >
                  <option value="">Pilih titik tujuan</option>
                  {graphNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleComputeRoute}
                disabled={routeLoading || !fromId || !toId}
                className="w-full bg-[#4338ca] hover:bg-[#3730a3] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {routeLoading ? "Menghitung..." : "Hitung Rute"}
              </button>

              {routeResult && (
                <div className="mt-4">
                  {routeResult.found ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="font-bold text-sm text-green-800">Rute Ditemukan!</p>
                      <p className="text-sm text-green-700 mt-1">
                        {routeResult.pathLabels.join(" → ")}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Total jarak: <strong>{routeResult.totalCost} km</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">Rute tidak ditemukan</p>
                    </div>
                  )}
                </div>
              )}

              {/* Graph Visualization */}
              {graphNodes.length > 0 && (
                <div className="mt-4">
                  <DijkstraGraph
                    nodes={graphNodes}
                    edges={graphEdges}
                    highlightPath={routeResult?.path || []}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowRouteModal(false)}
              className="w-full mt-4 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Kendaraan</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titik Bantuan
                </label>
                <select
                  value={setupForm.titikBantuanId}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, titikBantuanId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                >
                  <option value="">Pilih titik bantuan</option>
                  {titikBantuan.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} — {t.status.replace("_", " ")} ({t.urgensi})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kendaraan
                </label>
                <select
                  value={setupForm.kendaraanId}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, kendaraanId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                >
                  <option value="">Pilih kendaraan</option>
                  {kendaraan.map((k) => (
                    <option key={k.id} value={k.id} disabled={k.status !== "TERSEDIA"}>
                      {k.nama} ({k.platNomor}) - {k.kapasitas}kg [{k.status}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berat Bantuan (kg)
                </label>
                <input
                  type="number"
                  value={setupForm.beratBantuan}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, beratBantuan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4338ca] outline-none"
                  placeholder="Berat dalam kg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSetup}
                disabled={setupLoading || !setupForm.titikBantuanId || !setupForm.kendaraanId || !setupForm.beratBantuan}
                className="flex-1 bg-[#4338ca] hover:bg-[#3730a3] text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupLoading ? "Memproses..." : "Assign"}
              </button>
              <button
                onClick={() => setShowSetupModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
