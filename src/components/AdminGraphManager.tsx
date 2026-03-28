import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

interface Area {
  id: string;
  name: string;
  slug: string;
  color_bg: string;
  color_text: string;
  position_x: number;
  position_y: number;
}

interface Discipline {
  id: string;
  name: string;
  slug: string | null;
  semester: number;
  year: number;
  graph_area_id: string | null;
  graph_x: number | null;
  graph_y: number | null;
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminGraphManager() {
  const { toast } = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);

  // Area modal
  const [areaModal, setAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [areaForm, setAreaForm] = useState({ name: '', color_bg: '#3B1F6E', color_text: '#FFFFFF', position_x: 400, position_y: 400 });

  // Discipline modal
  const [discModal, setDiscModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Discipline | null>(null);
  const [discForm, setDiscForm] = useState({ name: '', semester: 1, year: 1, graph_area_id: '', graph_x: 400, graph_y: 400 });

  // Selected area filter
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [a, d] = await Promise.all([
      supabase.from('graph_areas' as any).select('*').order('name'),
      supabase.from('disciplines').select('*').order('name'),
    ]);
    setAreas((a.data || []) as any);
    setDisciplines((d.data || []) as any);
    setLoading(false);
  };

  // --- AREA CRUD ---
  const openNewArea = () => {
    setEditingArea(null);
    setAreaForm({ name: '', color_bg: '#3B1F6E', color_text: '#FFFFFF', position_x: 400, position_y: 400 });
    setAreaModal(true);
  };

  const openEditArea = (area: Area) => {
    setEditingArea(area);
    setAreaForm({ name: area.name, color_bg: area.color_bg, color_text: area.color_text, position_x: area.position_x, position_y: area.position_y });
    setAreaModal(true);
  };

  const saveArea = async () => {
    const slug = slugify(areaForm.name);
    if (editingArea) {
      const { error } = await supabase.from('graph_areas' as any).update({
        name: areaForm.name, slug, color_bg: areaForm.color_bg, color_text: areaForm.color_text,
        position_x: areaForm.position_x, position_y: areaForm.position_y,
      } as any).eq('id', editingArea.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Área atualizada' });
    } else {
      const { error } = await supabase.from('graph_areas' as any).insert({
        name: areaForm.name, slug, color_bg: areaForm.color_bg, color_text: areaForm.color_text,
        position_x: areaForm.position_x, position_y: areaForm.position_y,
      } as any);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Área criada' });
    }
    setAreaModal(false);
    fetchAll();
  };

  const deleteArea = async (areaId: string) => {
    if (!confirm('Remover esta área? As disciplinas perderão a associação.')) return;
    await supabase.from('graph_areas' as any).delete().eq('id', areaId);
    toast({ title: 'Área removida' });
    fetchAll();
  };

  // --- DISCIPLINE CRUD ---
  const openNewDisc = () => {
    setEditingDisc(null);
    setDiscForm({ name: '', semester: 1, year: 1, graph_area_id: '', graph_x: 400, graph_y: 400 });
    setDiscModal(true);
  };

  const openEditDisc = (disc: Discipline) => {
    setEditingDisc(disc);
    setDiscForm({
      name: disc.name,
      semester: disc.semester,
      year: disc.year,
      graph_area_id: disc.graph_area_id || '',
      graph_x: disc.graph_x ?? 400,
      graph_y: disc.graph_y ?? 400,
    });
    setDiscModal(true);
  };

  const saveDisc = async () => {
    const slug = slugify(discForm.name);
    const payload = {
      name: discForm.name,
      slug,
      semester: discForm.semester,
      year: discForm.year,
      graph_area_id: discForm.graph_area_id || null,
      graph_x: discForm.graph_area_id ? discForm.graph_x : null,
      graph_y: discForm.graph_area_id ? discForm.graph_y : null,
    };

    if (editingDisc) {
      const { error } = await supabase.from('disciplines').update(payload as any).eq('id', editingDisc.id);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Disciplina atualizada' });
    } else {
      const { error } = await supabase.from('disciplines').insert(payload as any);
      if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Disciplina criada' });
    }
    setDiscModal(false);
    fetchAll();
  };

  const deleteDisc = async (discId: string) => {
    if (!confirm('Remover esta disciplina?')) return;
    await supabase.from('disciplines').delete().eq('id', discId);
    toast({ title: 'Disciplina removida' });
    fetchAll();
  };

  const filteredDiscs = selectedAreaFilter === 'all'
    ? disciplines
    : selectedAreaFilter === 'none'
      ? disciplines.filter(d => !d.graph_area_id)
      : disciplines.filter(d => d.graph_area_id === selectedAreaFilter);

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      {/* Areas Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Grandes Áreas</CardTitle>
          <Button size="sm" onClick={openNewArea}><Plus className="h-4 w-4 mr-1" /> Nova Área</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {areas.map(area => (
              <div key={area.id} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: area.color_bg }} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{area.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {disciplines.filter(d => d.graph_area_id === area.id).length} disciplinas · ({Math.round(area.position_x)}, {Math.round(area.position_y)})
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditArea(area)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteArea(area.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
          {areas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma área cadastrada.</p>}
        </CardContent>
      </Card>

      {/* Disciplines Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg font-heading">Disciplinas no Grafo</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedAreaFilter} onValueChange={setSelectedAreaFilter}>
              <SelectTrigger className="w-[180px] h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="none">Sem área</SelectItem>
                {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={openNewDisc}><Plus className="h-4 w-4 mr-1" /> Nova Disciplina</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDiscs.map(disc => {
              const area = areas.find(a => a.id === disc.graph_area_id);
              return (
                <div key={disc.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#D94F8E' }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{disc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {area ? (
                          <Badge variant="outline" className="text-xs h-5">{area.name}</Badge>
                        ) : (
                          <span className="text-destructive">Sem área</span>
                        )}
                        {disc.graph_x != null && <span>({Math.round(disc.graph_x)}, {Math.round(disc.graph_y!)})</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEditDisc(disc)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteDisc(disc.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
            {filteredDiscs.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Area Modal */}
      <Dialog open={areaModal} onOpenChange={setAreaModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? 'Editar Área' : 'Nova Área'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={areaForm.name} onChange={e => setAreaForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Ciência de Dados" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor de fundo</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={areaForm.color_bg} onChange={e => setAreaForm(f => ({ ...f, color_bg: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={areaForm.color_bg} onChange={e => setAreaForm(f => ({ ...f, color_bg: e.target.value }))} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor do texto</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={areaForm.color_text} onChange={e => setAreaForm(f => ({ ...f, color_text: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={areaForm.color_text} onChange={e => setAreaForm(f => ({ ...f, color_text: e.target.value }))} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posição X (0-960)</Label>
                <Input type="number" value={areaForm.position_x} onChange={e => setAreaForm(f => ({ ...f, position_x: Number(e.target.value) }))} min={0} max={960} />
              </div>
              <div className="space-y-2">
                <Label>Posição Y (0-800)</Label>
                <Input type="number" value={areaForm.position_y} onChange={e => setAreaForm(f => ({ ...f, position_y: Number(e.target.value) }))} min={0} max={800} />
              </div>
            </div>
            <div className="rounded-lg border border-border p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground">Pré-visualização da posição</p>
              <div className="relative mt-2 bg-card rounded border border-border" style={{ height: 120 }}>
                <div
                  className="absolute w-5 h-5 rounded-full border-2 border-background shadow-md"
                  style={{
                    backgroundColor: areaForm.color_bg,
                    left: `${(areaForm.position_x / 960) * 100}%`,
                    top: `${(areaForm.position_y / 800) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaModal(false)}>Cancelar</Button>
            <Button onClick={saveArea} disabled={!areaForm.name.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discipline Modal */}
      <Dialog open={discModal} onOpenChange={setDiscModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDisc ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={discForm.name} onChange={e => setDiscForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Álgebra Linear" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Select value={String(discForm.semester)} onValueChange={v => setDiscForm(f => ({ ...f, semester: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Semestre</SelectItem>
                    <SelectItem value="2">2º Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={String(discForm.year)} onValueChange={v => setDiscForm(f => ({ ...f, year: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Ano</SelectItem>
                    <SelectItem value="2">2º Ano</SelectItem>
                    <SelectItem value="3">3º Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Grande Área</Label>
              <Select value={discForm.graph_area_id || 'none'} onValueChange={v => setDiscForm(f => ({ ...f, graph_area_id: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem área (não aparece no grafo)</SelectItem>
                  {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {discForm.graph_area_id && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posição X (0-960)</Label>
                  <Input type="number" value={discForm.graph_x} onChange={e => setDiscForm(f => ({ ...f, graph_x: Number(e.target.value) }))} min={0} max={960} />
                </div>
                <div className="space-y-2">
                  <Label>Posição Y (0-800)</Label>
                  <Input type="number" value={discForm.graph_y} onChange={e => setDiscForm(f => ({ ...f, graph_y: Number(e.target.value) }))} min={0} max={800} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscModal(false)}>Cancelar</Button>
            <Button onClick={saveDisc} disabled={!discForm.name.trim()}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
