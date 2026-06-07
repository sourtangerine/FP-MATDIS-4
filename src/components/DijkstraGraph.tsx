"use client";

interface GraphNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  isDepot: boolean;
}

interface GraphEdgeData {
  id: string;
  fromId: string;
  toId: string;
  weight: number;
}

interface DijkstraGraphProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  highlightPath?: string[];
}

export default function DijkstraGraph({
  nodes,
  edges,
  highlightPath = [],
}: DijkstraGraphProps) {
  const isEdgeHighlighted = (fromId: string, toId: string): boolean => {
    for (let i = 0; i < highlightPath.length - 1; i++) {
      if (
        (highlightPath[i] === fromId && highlightPath[i + 1] === toId) ||
        (highlightPath[i] === toId && highlightPath[i + 1] === fromId)
      ) {
        return true;
      }
    }
    return false;
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full overflow-auto">
      <svg viewBox="0 0 650 550" className="w-full h-auto max-h-[400px]">
        {/* Edges */}
        {edges.map((edge) => {
          const from = nodeMap.get(edge.fromId);
          const to = nodeMap.get(edge.toId);
          if (!from || !to) return null;

          const highlighted = isEdgeHighlighted(edge.fromId, edge.toId);
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g key={edge.id}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={highlighted ? "#4338ca" : "#d1d5db"}
                strokeWidth={highlighted ? 3 : 1.5}
                opacity={highlighted ? 1 : 0.6}
              />
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                fontSize="10"
                fill={highlighted ? "#4338ca" : "#6b7280"}
                fontWeight={highlighted ? "bold" : "normal"}
              >
                {edge.weight} km
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isInPath = highlightPath.includes(node.id);
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isDepot ? 18 : 14}
                fill={
                  node.isDepot
                    ? "#4338ca"
                    : isInPath
                    ? "#22c55e"
                    : "#f3f4f6"
                }
                stroke={isInPath ? "#4338ca" : "#9ca3af"}
                strokeWidth={isInPath ? 2.5 : 1.5}
              />
              <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="9"
                fill={node.isDepot || isInPath ? "white" : "#374151"}
                fontWeight="bold"
              >
                {node.isDepot ? "P" : node.label.split(" ").pop()}
              </text>
              <text
                x={node.x}
                y={node.y + (node.isDepot ? 30 : 26)}
                textAnchor="middle"
                fontSize="8"
                fill="#6b7280"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
