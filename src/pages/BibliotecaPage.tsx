import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ArrowRight } from 'lucide-react';

interface Discipline {
  id: string;
  name: string;
  code: string | null;
  year: number;
  semester: number;
  area: string | null;
}

export default function BibliotecaPage() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('disciplines').select('*').order('year').order('semester').then(({ data }) => {
      setDisciplines((data as Discipline[]) || []);
    });
  }, []);

  const areas = useMemo(() => {
    const areaSet = new Set(disciplines.map(d => d.area).filter(Boolean) as string[]);
    return Array.from(areaSet).sort();
  }, [disciplines]);

  const filteredDisciplines = useMemo(() => {
    let list = disciplines;
    if (selectedArea) list = list.filter(d => d.area === selectedArea);
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [disciplines, selectedArea, search]);

  const AREA_COLORS = [
    'bg-primary/10 text-primary border-primary/30',
    'bg-secondary/10 text-secondary border-secondary/30',
    'bg-destructive/10 text-destructive border-destructive/30',
    'bg-accent/10 text-accent-foreground border-accent/30',
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Biblioteca</h1>
        <p className="text-muted-foreground text-sm mt-1">Navegue por áreas e disciplinas</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar disciplina..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Area graph/nodes */}
      {!search && (
        <div className="mb-8">
          <h2 className="text-lg font-heading font-semibold mb-3">Grandes Áreas</h2>
          <div className="flex flex-wrap gap-3">
            {areas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma área cadastrada ainda. Um admin pode adicionar disciplinas com áreas.</p>
            ) : (
              areas.map((area, i) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(selectedArea === area ? null : area)}
                  className={`px-5 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    selectedArea === area
                      ? AREA_COLORS[i % AREA_COLORS.length] + ' scale-105 shadow-md'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  {area}
                  <span className="ml-2 text-xs opacity-70">
                    ({disciplines.filter(d => d.area === area).length})
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Disciplines list */}
      <div>
        {selectedArea && !search && (
          <h2 className="text-lg font-heading font-semibold mb-3">
            Disciplinas em "{selectedArea}"
          </h2>
        )}
        {filteredDisciplines.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma disciplina encontrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDisciplines.map(d => (
              <Link key={d.id} to={`/disciplina/${d.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="text-xs">
                          {d.year}º Ano · {d.semester}º Sem
                        </Badge>
                      </div>
                      <p className="font-medium">{d.name}</p>
                      {d.code && <p className="text-xs text-muted-foreground">{d.code}</p>}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
