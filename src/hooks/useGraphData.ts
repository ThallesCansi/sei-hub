import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GraphNode {
  id: string;
  label: string;
  slug: string;
  type: 'center' | 'area' | 'discipline';
  x: number;
  y: number;
  area?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface AreaColors {
  [key: string]: { bg: string; text: string };
}

export const DISCIPLINE_COLOR = { bg: '#D94F8E', text: '#FFFFFF' };

export const VB_W = 960;
export const VB_H = 800;
const CX = VB_W / 2;
const CY = VB_H / 2;

export function useGraphData() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [areaColors, setAreaColors] = useState<AreaColors>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    const [areasRes, disciplinesRes] = await Promise.all([
      supabase.from('graph_areas' as any).select('*'),
      supabase.from('disciplines').select('*'),
    ]);

    const areas = (areasRes.data || []) as any[];
    const disciplines = (disciplinesRes.data || []) as any[];

    const graphNodes: GraphNode[] = [
      { id: 'ilum', label: 'Ilum', slug: '', type: 'center', x: CX, y: CY },
    ];

    const colors: AreaColors = {};

    // Add areas
    areas.forEach((a: any) => {
      graphNodes.push({
        id: a.id,
        label: a.name,
        slug: a.slug,
        type: 'area',
        x: a.position_x,
        y: a.position_y,
      });
      colors[a.id] = { bg: a.color_bg, text: a.color_text };
    });

    // Add disciplines that have graph positions
    disciplines.forEach((d: any) => {
      if (d.graph_area_id && d.graph_x != null && d.graph_y != null) {
        graphNodes.push({
          id: d.id,
          label: d.name,
          slug: d.slug || d.id,
          type: 'discipline',
          x: d.graph_x,
          y: d.graph_y,
          area: d.graph_area_id,
        });
      }
    });

    // Build edges
    const graphEdges: GraphEdge[] = [];
    areas.forEach((a: any) => {
      graphEdges.push({ from: 'ilum', to: a.id });
    });
    graphNodes.filter(n => n.type === 'discipline' && n.area).forEach(n => {
      graphEdges.push({ from: n.area!, to: n.id });
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
    setAreaColors(colors);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { nodes, edges, areaColors, loading, refetch: fetchData };
}
