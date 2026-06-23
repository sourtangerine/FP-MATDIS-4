"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      setEmail("admin@bantuan.id");
      setPassword("password123");
    } else if (selectedRole === "OPERATOR") {
      setEmail("operator@bantuan.id");
      setPassword("password123");
    } else if (selectedRole === "KOORDINATOR_LAPANGAN") {
      setEmail("koordinator@bantuan.id");
      setPassword("password123");
    }
  }, [selectedRole]);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setToast("Hubungi administrator");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Dynamic styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #1e1b4b, #312e81, #4338ca, #1e1b4b);
          background-size: 400% 400%;
          animation: gradient-shift 12s ease infinite;
        }
      `}} />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 animated-gradient items-center justify-center relative overflow-hidden">
        {/* Decorative elements for premium look */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="text-center relative z-10">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-40 h-40 drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="60" cy="60" r="55" fill="#e0f2fe" />
              <path
                d="M60 30C52 30 45 37 45 45C45 55 60 70 60 70C60 70 75 55 75 45C75 37 68 30 60 30Z"
                fill="#3b82f6"
              />
              <path
                d="M35 55C35 55 40 65 60 75C80 65 85 55 85 55"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M40 65C40 65 48 72 60 80C72 72 80 65 80 65"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="56" y="40" width="8" height="14" rx="1" fill="white" />
              <rect x="53" y="45" width="14" height="4" rx="1" fill="white" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wider mt-4">BANTUAN BENCANA</h2>
          <p className="text-white/60 text-sm mt-2 max-w-sm mx-auto">Sistem Distribusi Logistik & Rute Optimal Dijkstra</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-slate-100 animate-fade-in-up">
          <h1 className="text-2xl font-bold mb-2 text-[#111827]">Masuk ke akun anda</h1>
          <p className="text-slate-400 text-sm mb-8">Pilih tipe akun untuk masuk otomatis</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none transition-all duration-200"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none transition-all duration-200"
                placeholder="Password"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#4338ca] focus:ring-[#4338ca]"
                />
                <span className="text-sm text-gray-600">Ingat Saya</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#4338ca] hover:underline"
              >
                Lupa Password?
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Pilih Akun Demo:
              </p>
              <div className="space-y-3">
                {[
                  { value: "ADMIN", label: "Admin (Administrator)", desc: "Akses penuh sistem" },
                  { value: "OPERATOR", label: "Operator", desc: "Kelola titik bantuan & armada" },
                  { value: "KOORDINATOR_LAPANGAN", label: "Koordinator Lapangan", desc: "Monitor & update status" },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedRole === role.value
                        ? "bg-white border-[#4338ca] shadow-sm"
                        : "bg-transparent border-transparent hover:bg-slate-100/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1 w-4 h-4 text-[#4338ca] border-gray-300 focus:ring-[#4338ca]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{role.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{role.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-[#4338ca]/20"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              Masuk
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {toast}
        </div>
      )}
    </div>
  );
}
