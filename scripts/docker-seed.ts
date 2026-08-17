/**
 * Docker seed — same as prisma/seed.ts but safe to run repeatedly.
 * Skips seeding if data already exists.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  const hash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { email: "admin@bantuan.id", password: hash, name: "Administrator", role: "ADMIN" },
      { email: "operator@bantuan.id", password: hash, name: "Operator Satu", role: "OPERATOR" },
      { email: "koordinator@bantuan.id", password: hash, name: "Koordinator A", role: "KOORDINATOR_LAPANGAN" },
    ],
  });

  const titik = await Promise.all([
    prisma.titikBantuan.create({ data: { nama: "Desa Wonokromo", alamat: "Jl. Wonokromo No. 10", kecamatan: "Wonokromo", kelurahan: "Wonokromo", latitude: -7.2908, longitude: 112.7378, urgensi: "TINGGI", status: "SEDANG_DIKIRIM", jenisBantuan: "Bantuan pangan" } }),
    prisma.titikBantuan.create({ data: { nama: "Desa Gubeng", alamat: "Jl. Gubeng Kertajaya No. 5", kecamatan: "Gubeng", kelurahan: "Gubeng", latitude: -7.2725, longitude: 112.7521, urgensi: "SEDANG", status: "MENUNGGU", jenisBantuan: "Bantuan evakuasi" } }),
    prisma.titikBantuan.create({ data: { nama: "Desa Rungkut", alamat: "Jl. Rungkut Industri No. 15", kecamatan: "Rungkut", kelurahan: "Rungkut Kidul", latitude: -7.3228, longitude: 112.7701, urgensi: "RENDAH", status: "MENUNGGU", jenisBantuan: "Bantuan evakuasi" } }),
    prisma.titikBantuan.create({ data: { nama: "Desa Waru", alamat: "Jl. Waru Raya No. 20", kecamatan: "Waru", kelurahan: "Waru", latitude: -7.3567, longitude: 112.7259, urgensi: "TINGGI", status: "SELESAI", jenisBantuan: "Bantuan pangan" } }),
    prisma.titikBantuan.create({ data: { nama: "Desa Sidoarjo", alamat: "Jl. Sidoarjo Kota No. 8", kecamatan: "Sidoarjo", kelurahan: "Sidoarjo", latitude: -7.4478, longitude: 112.7183, urgensi: "SEDANG", status: "TERTUNDA", jenisBantuan: "Bantuan medis" } }),
  ]);

  const kendaraan = await Promise.all([
    prisma.kendaraan.create({ data: { nama: "Truk Bantuan 01", platNomor: "L 1234 AB", kapasitas: 1000, status: "TERSEDIA" } }),
    prisma.kendaraan.create({ data: { nama: "Truk Bantuan 02", platNomor: "L 5678 CD", kapasitas: 800, status: "BERTUGAS" } }),
    prisma.kendaraan.create({ data: { nama: "Mobil Pickup 01", platNomor: "L 9012 EF", kapasitas: 500, status: "TERSEDIA" } }),
  ]);

  await prisma.distribusi.create({ data: { titikBantuanId: titik[0].id, kendaraanId: kendaraan[1].id, beratBantuan: 500, status: "BERJALAN", jarakAwal: 12.5, jarakOptimal: 9.8 } });
  await prisma.distribusi.create({ data: { titikBantuanId: titik[3].id, kendaraanId: kendaraan[0].id, beratBantuan: 750, status: "SELESAI", jarakAwal: 18.2, jarakOptimal: 14.5, waktuSelesai: new Date() } });

  const nodes = await Promise.all([
    prisma.graphNode.create({ data: { label: "Posko Pusat", latitude: -7.2575, longitude: 112.7521, x: 300, y: 50, isDepot: true } }),
    prisma.graphNode.create({ data: { label: "Desa Wonokromo", latitude: -7.2908, longitude: 112.7378, x: 150, y: 200, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Desa Gubeng", latitude: -7.2725, longitude: 112.7521, x: 450, y: 150, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Desa Rungkut", latitude: -7.3228, longitude: 112.7701, x: 550, y: 300, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Desa Waru", latitude: -7.3567, longitude: 112.7259, x: 100, y: 400, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Desa Sidoarjo", latitude: -7.4478, longitude: 112.7183, x: 300, y: 500, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Lokasi Bencana A", latitude: -7.3000, longitude: 112.7600, x: 400, y: 350, isDepot: false } }),
    prisma.graphNode.create({ data: { label: "Lokasi Bencana B", latitude: -7.3300, longitude: 112.7100, x: 200, y: 350, isDepot: false } }),
  ]);

  const edges = [
    [0,1,4.2],[0,2,2.8],[1,4,7.5],[1,7,5.1],[2,3,6.3],[2,6,4.0],
    [3,6,3.2],[4,5,10.1],[4,7,3.8],[5,7,8.5],[6,7,6.0],
  ];

  for (const [fi, ti, w] of edges) {
    await prisma.graphEdge.create({ data: { fromId: nodes[fi].id, toId: nodes[ti].id, weight: w } });
    await prisma.graphEdge.create({ data: { fromId: nodes[ti].id, toId: nodes[fi].id, weight: w } });
  }

  console.log("Seed completed successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
