"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-sm text-gray-600">
            Halo {session?.user?.name || "User"}!
          </span>
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-50">
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
