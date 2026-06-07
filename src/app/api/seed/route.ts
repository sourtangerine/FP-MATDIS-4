import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Clean existing data
    await prisma.graphEdge.deleteMany();
    await prisma.graphNode.deleteMany();
    await prisma.distribusi.deleteMany();
    await prisma.kendaraan.deleteMany();
    await prisma.titikBantuan.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.createMany({
      data: [
        { email: "admin@bantuan.id", password: hashedPassword, name: "Administrator", role: "ADMIN" },
        { email: "operator@bantuan.id", password: hashedPassword, name: "Operator Satu", role: "OPERATOR" },
        { email: "koordinator@bantuan.id", password: hashedPassword, name: "Koordinator A", role: "KOORDINATOR_LAPANGAN" },
      ],
    });

    const titikBantuan = await Promise.all([
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

    await prisma.distribusi.create({ data: { titikBantuanId: titikBantuan[0].id, kendaraanId: kendaraan[1].id, beratBantuan: 500, status: "BERJALAN", jarakAwal: 12.5, jarakOptimal: 9.8 } });
    await prisma.distribusi.create({ data: { titikBantuanId: titikBantuan[3].id, kendaraanId: kendaraan[0].id, beratBantuan: 750, status: "SELESAI", jarakAwal: 18.2, jarakOptimal: 14.5, waktuSelesai: new Date() } });

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

    const edgesData = [
      { fromIdx: 0, toIdx: 1, weight: 4.2 },
      { fromIdx: 0, toIdx: 2, weight: 2.8 },
      { fromIdx: 1, toIdx: 4, weight: 7.5 },
      { fromIdx: 1, toIdx: 7, weight: 5.1 },
      { fromIdx: 2, toIdx: 3, weight: 6.3 },
      { fromIdx: 2, toIdx: 6, weight: 4.0 },
      { fromIdx: 3, toIdx: 6, weight: 3.2 },
      { fromIdx: 4, toIdx: 5, weight: 10.1 },
      { fromIdx: 4, toIdx: 7, weight: 3.8 },
      { fromIdx: 5, toIdx: 7, weight: 8.5 },
      { fromIdx: 6, toIdx: 3, weight: 3.2 },
      { fromIdx: 6, toIdx: 7, weight: 6.0 },
    ];

    for (const edge of edgesData) {
      await prisma.graphEdge.create({ data: { fromId: nodes[edge.fromIdx].id, toId: nodes[edge.toIdx].id, weight: edge.weight } });
      await prisma.graphEdge.create({ data: { fromId: nodes[edge.toIdx].id, toId: nodes[edge.fromIdx].id, weight: edge.weight } });
    }

    return NextResponse.json({ message: "Seed completed successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
