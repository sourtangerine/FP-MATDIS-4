"use client";

import { useState } from "react";
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
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e1b4b] items-center justify-center">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="w-40 h-40"
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
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-8">Masuk ke akun anda</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4338ca] focus:border-transparent outline-none"
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
                  className="w-4 h-4 rounded border-gray-300"
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

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Login Sebagai
              </p>
              <div className="space-y-2">
                {[
                  { value: "ADMIN", label: "Admin" },
                  { value: "OPERATOR", label: "Operator" },
                  { value: "KOORDINATOR_LAPANGAN", label: "Koordinator Lapangan" },
                ].map((role) => (
                  <label
                    key={role.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-5 h-5 text-[#4338ca] border-gray-300 focus:ring-[#4338ca]"
                    />
                    <span className="text-sm">{role.label}</span>
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
              className="w-full bg-[#4338ca] hover:bg-[#3730a3] text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
