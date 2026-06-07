import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const kendaraan = await prisma.kendaraan.findMany({
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(kendaraan);
  } catch (error) {
    console.error("GET kendaraan error:", error);
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
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const kendaraan = await prisma.kendaraan.create({
      data: {
        nama: body.nama,
        platNomor: body.platNomor,
        kapasitas: parseFloat(body.kapasitas),
        status: body.status || "TERSEDIA",
      },
    });

    return NextResponse.json(kendaraan, { status: 201 });
  } catch (error) {
    console.error("POST kendaraan error:", error);
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}
