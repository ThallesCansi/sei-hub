import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAPH_NODES, GRAPH_EDGES, AREA_COLORS, DISCIPLINE_COLOR, GraphNode } from '@/data/graphData';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onDisciplineClick?: (disciplineLabel: string) => void;
  selectedArea: string | null;
  onAreaSelect: (area: string | null) => void;
}

export function CurriculumGraph({ onDisciplineClick, selectedArea, onAreaSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const VB_W = 960;
  const VB_H = 800;

  const visibleNodes = selectedArea
    ? GRAPH_NODES.filter(n => n.type === 'area' || n.area === selectedArea)
    : GRAPH_NODES;

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleEdges = GRAPH_EDGES.filter(
    e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
  );

  const getNodeById = (id: string) => GRAPH_NODES.find(n => n.id === id);

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'area') {
      onAreaSelect(selectedArea === node.id ? null : node.id);
    } else if (onDisciplineClick) {
      onDisciplineClick(node.label);
    }
  };

  // Zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({
      ...t,
      scale: Math.min(3, Math.max(0.5, t.scale * delta)),
    }));
  }, []);

  // Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform(t => ({
      ...t,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    }));
  };

  const handleMouseUp = () => setIsPanning(false);

  const areaRadius = 42;
  const discRadius = 30;

  // Word wrap helper
  const wrapText = (text: string, maxChars: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if (current && (current + ' ' + word).length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-border bg-card overflow-hidden select-none"
      style={{ height: 'min(70vh, 600px)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-full"
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Edges */}
          {visibleEdges.map((edge, i) => {
            const from = getNodeById(edge.from);
            const to = getNodeById(edge.to);
            if (!from || !to) return null;
            const isHighlighted =
              hoveredNode === edge.from || hoveredNode === edge.to;
            return (
              <line
                key={`edge-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHighlighted ? '#6B3FA0' : '#C4A0D0'}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={hoveredNode && !isHighlighted ? 0.15 : 0.5}
                style={{ transition: 'all 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {visibleNodes.map(node => {
            const isArea = node.type === 'area';
            const r = isArea ? areaRadius : discRadius;
            const colors = isArea
              ? AREA_COLORS[node.id] || AREA_COLORS.mat
              : DISCIPLINE_COLOR;
            const isHovered = hoveredNode === node.id;
            const isConnected =
              hoveredNode &&
              GRAPH_EDGES.some(
                e =>
                  (e.from === hoveredNode && e.to === node.id) ||
                  (e.to === hoveredNode && e.from === node.id)
              );
            const dimmed = hoveredNode && !isHovered && !isConnected;
            const lines = wrapText(node.label, isArea ? 12 : 10);
            const fontSize = isArea ? 8 : 6.5;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  cursor: 'pointer',
                  opacity: dimmed ? 0.25 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? r + 3 : r}
                  fill={colors.bg}
                  stroke={isHovered ? '#fff' : 'none'}
                  strokeWidth={2}
                  style={{ transition: 'r 0.15s, fill 0.15s' }}
                />
                {lines.map((line, li) => (
                  <text
                    key={li}
                    x={node.x}
                    y={node.y + (li - (lines.length - 1) / 2) * (fontSize + 2)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.text}
                    fontSize={fontSize}
                    fontWeight={isArea ? 700 : 500}
                    fontFamily="'Space Grotesk', sans-serif"
                    pointerEvents="none"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-muted-foreground bg-card/80 backdrop-blur rounded-lg px-3 py-2 border border-border">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B1F6E' }} />
          Grande Área
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D94F8E' }} />
          Disciplina
        </span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={() => setTransform(t => ({ ...t, scale: Math.min(3, t.scale * 1.2) }))}
          className="w-8 h-8 rounded bg-card/80 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.5, t.scale * 0.8) }))}
          className="w-8 h-8 rounded bg-card/80 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
        >
          −
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="h-8 px-2 rounded bg-card/80 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-xs"
        >
          Reset
        </button>
      </div>

      {selectedArea && (
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border">
          <p className="text-xs text-muted-foreground">
            Área: <strong className="text-foreground">{getNodeById(selectedArea)?.label}</strong>
          </p>
          <button
            onClick={() => onAreaSelect(null)}
            className="text-xs text-primary hover:underline mt-0.5"
          >
            Ver todas as áreas
          </button>
        </div>
      )}
    </div>
  );
}
