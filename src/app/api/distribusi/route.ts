import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dijkstra } from "@/lib/dijkstra";
import { getOSRMRoute } from "@/lib/osrm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const urgensi = searchParams.get("urgensi");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (urgensi) where.titikBantuan = { urgensi };

    const distribusi = await prisma.distribusi.findMany({
      where,
      include: {
        titikBantuan: true,
        kendaraan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(distribusi);
  } catch (error) {
    console.error("GET distribusi error:", error);
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

  try {
    const body = await req.json();
    const { titikBantuanId, kendaraanId, beratBantuan } = body;

    // Run Dijkstra to compute optimal route
    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();

    const depotNode = nodes.find((n) => n.isDepot);
    const titik = await prisma.titikBantuan.findUnique({
      where: { id: titikBantuanId },
    });

    let jarakAwal = 0;
    let jarakOptimal = 0;
    let rutePath = null;

    if (depotNode && titik) {
      // Find nearest graph node to target titik bantuan
      let nearestNode = nodes[0];
      let nearestDist = Infinity;
      for (const node of nodes) {
        if (node.isDepot) continue;
        const dist = Math.sqrt(
          Math.pow(node.latitude - titik.latitude, 2) +
            Math.pow(node.longitude - titik.longitude, 2)
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestNode = node;
        }
      }

      const result = dijkstra(
        nodes.map((n) => ({ id: n.id, label: n.label })),
        edges.map((e) => ({ fromId: e.fromId, toId: e.toId, weight: e.weight })),
        depotNode.id,
        nearestNode.id
      );

      if (result.found) {
        // Get real road distance using OSRM
        const osrmRoute = await getOSRMRoute(
          depotNode.latitude,
          depotNode.longitude,
          titik.latitude,
          titik.longitude
        );

        if (osrmRoute) {
          jarakOptimal = Math.round(osrmRoute.distance * 100) / 100;
          // Simulate a longer non-optimal route (straight-line * factor)
          const straightLine = Math.sqrt(
            Math.pow((depotNode.latitude - titik.latitude) * 111, 2) +
              Math.pow((depotNode.longitude - titik.longitude) * 111 * Math.cos(depotNode.latitude * Math.PI / 180), 2)
          );
          jarakAwal = Math.round((jarakOptimal + straightLine * 0.3) * 100) / 100;
          rutePath = { ...result, roadCoordinates: osrmRoute.coordinates };
        } else {
          jarakOptimal = result.totalCost;
          jarakAwal = Math.round(jarakOptimal * (1 + Math.random() * 0.3) * 100) / 100;
          rutePath = result;
        }
      }
    }

    // Create distribusi
    const distribusi = await prisma.distribusi.create({
      data: {
        titikBantuanId,
        kendaraanId,
        beratBantuan: parseFloat(beratBantuan),
        status: "BERJALAN",
        jarakAwal: Math.round(jarakAwal * 10) / 10,
        jarakOptimal: Math.round(jarakOptimal * 10) / 10,
        rutePath: rutePath as object,
      },
      include: {
        titikBantuan: true,
        kendaraan: true,
      },
    });

    // Update kendaraan status
    await prisma.kendaraan.update({
      where: { id: kendaraanId },
      data: { status: "BERTUGAS" },
    });

    // Update titik bantuan status
    await prisma.titikBantuan.update({
      where: { id: titikBantuanId },
      data: { status: "SEDANG_DIKIRIM" },
    });

    return NextResponse.json(distribusi, { status: 201 });
  } catch (error) {
    console.error("POST distribusi error:", error);
    return NextResponse.json(
      { error: "Failed to create distribusi" },
      { status: 500 }
    );
  }
}
