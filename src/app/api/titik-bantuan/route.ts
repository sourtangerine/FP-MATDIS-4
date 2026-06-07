import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const urgensi = searchParams.get("urgensi");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (urgensi) where.urgensi = urgensi;
    if (status) where.status = status;

    const titikBantuan = await prisma.titikBantuan.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(titikBantuan);
  } catch (error) {
    console.error("GET titik-bantuan error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN" && role !== "OPERATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const titikBantuan = await prisma.titikBantuan.create({
      data: {
        nama: body.nama,
        alamat: body.alamat,
        kecamatan: body.kecamatan,
        kelurahan: body.kelurahan,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        urgensi: body.urgensi || "SEDANG",
        jenisBantuan: body.jenisBantuan,
      },
    });

    return NextResponse.json(titikBantuan, { status: 201 });
  } catch (error) {
    console.error("POST titik-bantuan error:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}
