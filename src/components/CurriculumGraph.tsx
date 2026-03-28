import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAPH_NODES, GRAPH_EDGES, AREA_COLORS, DISCIPLINE_COLOR, GraphNode } from '@/data/graphData';
import ilumLogo from '@/assets/ilum-logo.png';

interface Props {
  selectedArea: string | null;
  onAreaSelect: (area: string | null) => void;
}

const VB_W = 960;
const VB_H = 800;

export function CurriculumGraph({ selectedArea, onAreaSelect }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: VB_W, h: VB_H });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, vbx: 0, vby: 0 });

  const getNodeById = (id: string) => GRAPH_NODES.find(n => n.id === id);

  // When an area is selected, zoom into it
  const zoomToArea = useCallback((areaId: string | null) => {
    if (!areaId) {
      setViewBox({ x: 0, y: 0, w: VB_W, h: VB_H });
      onAreaSelect(null);
      return;
    }
    const areaNode = getNodeById(areaId);
    if (!areaNode) return;

    // Find all disciplines in this area
    const children = GRAPH_NODES.filter(n => n.area === areaId);
    const allNodes = [areaNode, ...children];

    let minX = Math.min(...allNodes.map(n => n.x)) - 80;
    let maxX = Math.max(...allNodes.map(n => n.x)) + 80;
    let minY = Math.min(...allNodes.map(n => n.y)) - 60;
    let maxY = Math.max(...allNodes.map(n => n.y)) + 60;

    const w = Math.max(maxX - minX, 200);
    const h = Math.max(maxY - minY, 200);

    // Maintain aspect ratio ~4:3
    const aspectTarget = VB_W / VB_H;
    const currentAspect = w / h;
    let finalW = w, finalH = h, finalX = minX, finalY = minY;
    if (currentAspect > aspectTarget) {
      finalH = w / aspectTarget;
      finalY = minY - (finalH - h) / 2;
    } else {
      finalW = h * aspectTarget;
      finalX = minX - (finalW - w) / 2;
    }

    setViewBox({ x: finalX, y: finalY, w: finalW, h: finalH });
    onAreaSelect(areaId);
  }, [onAreaSelect]);

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === 'center') {
      zoomToArea(null);
    } else if (node.type === 'area') {
      if (selectedArea === node.id) {
        zoomToArea(null);
      } else {
        zoomToArea(node.id);
      }
    } else if (node.type === 'discipline') {
      navigate(`/biblioteca/${node.slug}`);
    }
  };

  // Visible nodes logic
  const visibleNodes = useMemo(() => {
    if (!selectedArea) return GRAPH_NODES;
    return GRAPH_NODES.filter(
      n => n.type === 'center' || n.type === 'area' || n.area === selectedArea
    );
  }, [selectedArea]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => GRAPH_EDGES.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)),
    [visibleNodeIds]
  );

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    setIsPanning(true);
    setPanStart({
      x: e.clientX * scaleX,
      y: e.clientY * scaleY,
      vbx: viewBox.x,
      vby: viewBox.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = panStart.x - e.clientX * scaleX;
    const dy = panStart.y - e.clientY * scaleY;
    setViewBox(vb => ({ ...vb, x: panStart.vbx + dx, y: panStart.vby + dy }));
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(vb => {
      const newW = Math.max(150, Math.min(VB_W * 2, vb.w * factor));
      const newH = Math.max(120, Math.min(VB_H * 2, vb.h * factor));
      const cx = vb.x + vb.w / 2;
      const cy = vb.y + vb.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, []);

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

  const areaRadius = 42;
  const discRadius = 30;
  const centerRadius = 55;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-border bg-card overflow-hidden select-none"
      style={{ height: 'min(70vh, 620px)' }}
    >
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-full"
        style={{
          cursor: isPanning ? 'grabbing' : 'grab',
          transition: isPanning ? 'none' : 'viewBox 0.5s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <clipPath id="ilum-clip">
            <circle cx={VB_W / 2} cy={VB_H / 2} r={centerRadius} />
          </clipPath>
          {/* Glow filter for center */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {visibleEdges.map((edge, i) => {
          const from = getNodeById(edge.from);
          const to = getNodeById(edge.to);
          if (!from || !to) return null;
          const isCenter = edge.from === 'ilum' || edge.to === 'ilum';
          const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
          const dimmed = hoveredNode && !isHighlighted;

          return (
            <line
              key={`edge-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isCenter ? '#6B3FA0' : isHighlighted ? '#6B3FA0' : '#C4A0D0'}
              strokeWidth={isCenter ? 2.5 : isHighlighted ? 2 : 1}
              opacity={dimmed ? 0.1 : isCenter ? 0.6 : 0.4}
              style={{ transition: 'all 0.25s ease' }}
            />
          );
        })}

        {/* Nodes */}
        {visibleNodes.map(node => {
          if (node.type === 'center') {
            // Ilum logo center node
            const isHovered = hoveredNode === 'ilum';
            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={centerRadius + 4}
                  fill="none"
                  stroke="#6B3FA0"
                  strokeWidth={2}
                  opacity={isHovered ? 0.8 : 0.3}
                  filter={isHovered ? 'url(#glow)' : undefined}
                  style={{ transition: 'all 0.2s' }}
                />
                <circle cx={node.x} cy={node.y} r={centerRadius} fill="#5B2D8E" />
                <image
                  href={ilumLogo}
                  x={node.x - centerRadius}
                  y={node.y - centerRadius}
                  width={centerRadius * 2}
                  height={centerRadius * 2}
                  clipPath="url(#ilum-clip)"
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          }

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
          const dimmed = hoveredNode && hoveredNode !== 'ilum' && !isHovered && !isConnected;
          const lines = wrapText(node.label, isArea ? 12 : 10);
          const fontSize = isArea ? 8 : 6.5;

          // For non-selected areas when zoomed, make them smaller
          const isOtherArea = selectedArea && isArea && node.id !== selectedArea;
          const finalR = isOtherArea ? r * 0.7 : isHovered ? r + 3 : r;
          const finalFontSize = isOtherArea ? fontSize * 0.7 : fontSize;

          return (
            <g
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node);
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                cursor: 'pointer',
                opacity: dimmed ? 0.2 : isOtherArea ? 0.5 : 1,
                transition: 'opacity 0.25s',
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={finalR}
                fill={colors.bg}
                stroke={isHovered ? '#fff' : 'none'}
                strokeWidth={2}
                style={{ transition: 'r 0.2s ease, fill 0.2s' }}
              />
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={node.x}
                  y={node.y + (li - (lines.length - 1) / 2) * (finalFontSize + 2)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize={finalFontSize}
                  fontWeight={isArea ? 700 : 500}
                  fontFamily="'Space Grotesk', sans-serif"
                  pointerEvents="none"
                  style={{ transition: 'font-size 0.2s' }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs text-muted-foreground bg-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B1F6E' }} />
          Grande Área
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#D94F8E' }} />
          Disciplina
        </span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={() => setViewBox(vb => {
            const f = 0.8;
            const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
            return { x: cx - vb.w * f / 2, y: cy - vb.h * f / 2, w: vb.w * f, h: vb.h * f };
          })}
          className="w-8 h-8 rounded bg-card/90 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => setViewBox(vb => {
            const f = 1.25;
            const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
            return { x: cx - vb.w * f / 2, y: cy - vb.h * f / 2, w: vb.w * f, h: vb.h * f };
          })}
          className="w-8 h-8 rounded bg-card/90 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-sm font-bold"
        >
          −
        </button>
        <button
          onClick={() => zoomToArea(null)}
          className="h-8 px-2 rounded bg-card/90 backdrop-blur border border-border text-foreground hover:bg-muted flex items-center justify-center text-xs"
        >
          Reset
        </button>
      </div>

      {/* Selected area indicator */}
      {selectedArea && (
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border">
          <p className="text-xs text-muted-foreground">
            Área: <strong className="text-foreground">{getNodeById(selectedArea)?.label}</strong>
          </p>
          <button
            onClick={() => zoomToArea(null)}
            className="text-xs text-primary hover:underline mt-0.5"
          >
            ← Ver todas as áreas
          </button>
        </div>
      )}
    </div>
  );
}
