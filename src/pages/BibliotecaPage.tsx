import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import { CurriculumGraph } from '@/components/CurriculumGraph';

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
  const [selectedDisciplineName, setSelectedDisciplineName] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('disciplines').select('*').order('year').order('semester').then(({ data }) => {
      setDisciplines((data as Discipline[]) || []);
    });
  }, []);

  const filteredDisciplines = useMemo(() => {
    let list = disciplines;
    if (selectedDisciplineName) {
      list = list.filter(d => d.name.toLowerCase().includes(selectedDisciplineName.toLowerCase()));
    }
    if (search) {
      list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  }, [disciplines, selectedDisciplineName, search]);

  const handleDisciplineClick = (label: string) => {
    setSelectedDisciplineName(label);
    setSearch(label);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Biblioteca</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Clique em uma grande área para explorar, ou em uma disciplina para ver seus materiais
        </p>
      </div>

      {/* Interactive Graph */}
      <div className="mb-8">
        <CurriculumGraph
          selectedArea={selectedArea}
          onAreaSelect={setSelectedArea}
          onDisciplineClick={handleDisciplineClick}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar disciplina..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedDisciplineName(null);
          }}
        />
      </div>

      {/* Disciplines from database */}
      {(search || selectedDisciplineName) && (
        <div>
          <h2 className="text-lg font-heading font-semibold mb-3">
            {filteredDisciplines.length > 0
              ? `Disciplinas encontradas (${filteredDisciplines.length})`
              : 'Nenhuma disciplina encontrada no banco de dados'}
          </h2>
          {filteredDisciplines.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Esta disciplina ainda não foi cadastrada. Um admin pode adicioná-la no painel administrativo.
            </p>
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
      )}
    </div>
  );
}
