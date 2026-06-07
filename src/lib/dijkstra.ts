interface DijkstraNode {
  id: string;
  label: string;
}

interface DijkstraEdge {
  fromId: string;
  toId: string;
  weight: number;
}

interface DijkstraResult {
  path: string[];
  pathLabels: string[];
  totalCost: number;
  found: boolean;
}

export function dijkstra(
  nodes: DijkstraNode[],
  edges: DijkstraEdge[],
  startId: string,
  endId: string
): DijkstraResult {
  const adjacency: Map<string, { nodeId: string; weight: number }[]> = new Map();

  // Build adjacency list (undirected)
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const fromList = adjacency.get(edge.fromId);
    if (fromList) {
      fromList.push({ nodeId: edge.toId, weight: edge.weight });
    }
    const toList = adjacency.get(edge.toId);
    if (toList) {
      toList.push({ nodeId: edge.fromId, weight: edge.weight });
    }
  }

  // Dijkstra's algorithm with array-based priority queue
  const dist: Map<string, number> = new Map();
  const prev: Map<string, string | null> = new Map();
  const visited: Set<string> = new Set();

  for (const node of nodes) {
    dist.set(node.id, Infinity);
    prev.set(node.id, null);
  }

  dist.set(startId, 0);

  // Array-based min-priority queue
  const queue: { id: string; cost: number }[] = [{ id: startId, cost: 0 }];

  while (queue.length > 0) {
    // Find minimum cost node
    let minIdx = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].cost < queue[minIdx].cost) {
        minIdx = i;
      }
    }

    const current = queue[minIdx];
    queue.splice(minIdx, 1);

    if (visited.has(current.id)) continue;
    visited.add(current.id);

    if (current.id === endId) break;

    const neighbors = adjacency.get(current.id) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) continue;

      const newDist = (dist.get(current.id) || 0) + neighbor.weight;
      if (newDist < (dist.get(neighbor.nodeId) || Infinity)) {
        dist.set(neighbor.nodeId, newDist);
        prev.set(neighbor.nodeId, current.id);
        queue.push({ id: neighbor.nodeId, cost: newDist });
      }
    }
  }

  // Reconstruct path
  const totalCost = dist.get(endId) || Infinity;
  if (totalCost === Infinity) {
    return { path: [], pathLabels: [], totalCost: 0, found: false };
  }

  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) || null;
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n.label]));
  const pathLabels = path.map((id) => nodeMap.get(id) || id);

  return {
    path,
    pathLabels,
    totalCost: Math.round(totalCost * 100) / 100,
    found: true,
  };
}
