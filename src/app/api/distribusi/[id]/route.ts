import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const distribusi = await prisma.distribusi.findUnique({
      where: { id: params.id },
      include: { titikBantuan: true, kendaraan: true },
    });

    if (!distribusi) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(distribusi);
  } catch (error) {
    console.error("GET distribusi/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, kendaraanId } = body;

    const updateData: Record<string, unknown> = { status };

    if (status === "SELESAI") {
      updateData.waktuSelesai = new Date();
    }

    if (kendaraanId) {
      updateData.kendaraanId = kendaraanId;
    }

    const distribusi = await prisma.distribusi.update({
      where: { id: params.id },
      data: updateData,
      include: { titikBantuan: true, kendaraan: true },
    });

    // Update related records based on status
    if (status === "SELESAI") {
      await prisma.titikBantuan.update({
        where: { id: distribusi.titikBantuanId },
        data: { status: "SELESAI" },
      });
      await prisma.kendaraan.update({
        where: { id: distribusi.kendaraanId },
        data: { status: "TERSEDIA" },
      });
    } else if (status === "TERTUNDA") {
      await prisma.titikBantuan.update({
        where: { id: distribusi.titikBantuanId },
        data: { status: "TERTUNDA" },
      });
    } else if (status === "BERJALAN") {
      await prisma.titikBantuan.update({
        where: { id: distribusi.titikBantuanId },
        data: { status: "SEDANG_DIKIRIM" },
      });
      if (kendaraanId) {
        await prisma.kendaraan.update({
          where: { id: kendaraanId },
          data: { status: "BERTUGAS" },
        });
      }
    }

    return NextResponse.json(distribusi);
  } catch (error) {
    console.error("PATCH distribusi/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update distribusi" },
      { status: 500 }
    );
  }
}
