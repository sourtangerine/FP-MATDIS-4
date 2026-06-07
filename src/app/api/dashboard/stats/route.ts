import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      titikAktif,
      kendaraanTersedia,
      totalBantuan,
      totalJarak,
      distribusiBerjalan,
      distribusiSelesai,
      distribusiTertunda,
      totalBeratTerkirim,
      efisiensiData,
    ] = await Promise.all([
      prisma.titikBantuan.count({ where: { status: { not: "SELESAI" } } }),
      prisma.kendaraan.count({ where: { status: "TERSEDIA" } }),
      prisma.titikBantuan.count(),
      prisma.distribusi.aggregate({ _sum: { jarakOptimal: true } }),
      prisma.distribusi.count({ where: { status: "BERJALAN" } }),
      prisma.distribusi.count({ where: { status: "SELESAI" } }),
      prisma.distribusi.count({ where: { status: "TERTUNDA" } }),
      prisma.distribusi.aggregate({
        where: { status: "SELESAI" },
        _sum: { beratBantuan: true },
      }),
      prisma.distribusi.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { jarakAwal: true, jarakOptimal: true },
      }),
    ]);

    const jarakAwal = efisiensiData._sum.jarakAwal || 0;
    const jarakOptimal = efisiensiData._sum.jarakOptimal || 0;
    const efisiensi =
      jarakAwal > 0
        ? Math.round(((jarakAwal - jarakOptimal) / jarakAwal) * 100)
        : 0;

    return NextResponse.json({
      titikAktif,
      kendaraanTersedia,
      totalBantuan,
      totalJarak: Math.round((totalJarak._sum.jarakOptimal || 0) * 10) / 10,
      distribusiBerjalan,
      distribusiSelesai,
      distribusiTertunda,
      totalBeratTerkirim: Math.round((totalBeratTerkirim._sum.beratBantuan || 0) * 10) / 10,
      efisiensi: {
        jarakAwal: Math.round(jarakAwal * 10) / 10,
        jarakOptimal: Math.round(jarakOptimal * 10) / 10,
        persentase: efisiensi,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
