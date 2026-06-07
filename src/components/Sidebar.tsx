"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Map" },
  { href: "/laporan", label: "Laporan" },
  { href: "/monitoring", label: "Monitoring" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[#1e1b4b] text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 flex items-center justify-center">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            className="w-8 h-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 8C16 8 12 12 12 16C12 22 20 30 20 30C20 30 28 22 28 16C28 12 24 8 20 8Z"
              fill="#3b82f6"
            />
            <path
              d="M10 20C10 20 13 26 20 30C27 26 30 20 30 20"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="18" y="13" width="4" height="7" rx="1" fill="white" />
            <rect x="16" y="15" width="8" height="3" rx="1" fill="white" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white text-[#1e1b4b] font-medium"
                  : "text-white/80 hover:bg-[#3730a3] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-4 py-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
