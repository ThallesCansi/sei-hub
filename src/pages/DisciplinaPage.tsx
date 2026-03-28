import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DisciplinaPage() {
  const { id } = useParams<{ id: string }>();
  const [discipline, setDiscipline] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from('disciplines').select('*').eq('id', id).single().then(({ data }) => setDiscipline(data));
    supabase
      .from('posts')
      .select('*, profiles:author_id(full_name)')
      .eq('discipline_id', id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [id]);

  if (!discipline) return <div className="container mx-auto p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Link to="/biblioteca" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>

      <h1 className="text-3xl font-heading font-bold mb-1">{discipline.name}</h1>
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="outline">{discipline.year}º Ano · {discipline.semester}º Semestre</Badge>
        {discipline.area && <Badge variant="secondary">{discipline.area}</Badge>}
        {discipline.code && <span className="text-sm text-muted-foreground">{discipline.code}</span>}
      </div>

      <h2 className="text-lg font-heading font-semibold mb-3">Postagens</h2>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma postagem nesta disciplina ainda.</p>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <Link key={p.id} to={`/post/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(p.profiles as any)?.full_name} · {format(new Date(p.created_at), "d 'de' MMM", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
