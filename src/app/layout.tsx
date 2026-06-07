import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bantuan Bencana - Sistem Distribusi",
  description: "Sistem Penyaluran Bantuan Bencana dengan optimasi rute Dijkstra",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="bg-[#f3f4f6] text-[#111827]">{children}</body>
    </html>
  );
}
