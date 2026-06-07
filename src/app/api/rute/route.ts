import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dijkstra } from "@/lib/dijkstra";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fromId, toId } = body;

    if (!fromId || !toId) {
      return NextResponse.json(
        { error: "fromId and toId are required" },
        { status: 400 }
      );
    }

    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();

    const result = dijkstra(
      nodes.map((n) => ({ id: n.id, label: n.label })),
      edges.map((e) => ({ fromId: e.fromId, toId: e.toId, weight: e.weight })),
      fromId,
      toId
    );

    // Get coordinates for the path
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const pathCoordinates = result.path.map((id) => {
      const node = nodeMap.get(id);
      return node ? [node.latitude, node.longitude] : [0, 0];
    });

    return NextResponse.json({
      ...result,
      pathCoordinates,
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        latitude: n.latitude,
        longitude: n.longitude,
        x: n.x,
        y: n.y,
        isDepot: n.isDepot,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        fromId: e.fromId,
        toId: e.toId,
        weight: e.weight,
      })),
    });
  } catch (error) {
    console.error("POST rute error:", error);
    return NextResponse.json(
      { error: "Failed to compute route" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();

    return NextResponse.json({
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        latitude: n.latitude,
        longitude: n.longitude,
        x: n.x,
        y: n.y,
        isDepot: n.isDepot,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        fromId: e.fromId,
        toId: e.toId,
        weight: e.weight,
      })),
    });
  } catch (error) {
    console.error("GET rute error:", error);
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    );
  }
}
