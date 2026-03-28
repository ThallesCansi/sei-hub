import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { GRAPH_NODES } from '@/data/graphData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DisciplinaSlugPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Find the graph node for this slug
  const graphNode = GRAPH_NODES.find(n => n.slug === slug);
  const disciplineName = graphNode?.label || slug || '';

  useEffect(() => {
    if (!disciplineName) return;
    fetchPosts();
  }, [disciplineName]);

  const fetchPosts = async () => {
    setLoading(true);
    // Search posts by discipline name match or by body/title containing it
    // First try to find a discipline in DB by name
    const { data: disciplines } = await supabase
      .from('disciplines')
      .select('id')
      .ilike('name', `%${disciplineName}%`);

    let postData: any[] = [];

    if (disciplines && disciplines.length > 0) {
      const ids = disciplines.map(d => d.id);
      const { data } = await supabase
        .from('posts')
        .select('*, profiles:author_id(full_name, matricula)')
        .in('discipline_id', ids)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      postData = data || [];
    }

    // Also search posts that mention this discipline in title
    if (postData.length === 0) {
      const { data } = await supabase
        .from('posts')
        .select('*, profiles:author_id(full_name, matricula)')
        .eq('status', 'approved')
        .ilike('title', `%${disciplineName}%`)
        .order('created_at', { ascending: false });
      postData = data || [];
    }

    setPosts(postData);
    setLoading(false);
  };

  // Find parent area
  const parentArea = graphNode?.area
    ? GRAPH_NODES.find(n => n.id === graphNode.area)
    : null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link
        to="/biblioteca"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Biblioteca
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-primary" />
          {parentArea && (
            <Badge variant="secondary" className="text-xs">
              {parentArea.label}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-heading font-bold">{disciplineName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Postagens e materiais relacionados a esta disciplina
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Nenhuma postagem nesta disciplina ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Seja o primeiro a contribuir!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <Link key={p.id} to={`/post/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-heading font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {p.body?.replace(/[#*_~`]/g, '').slice(0, 200)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {(p.profiles as any)?.full_name}
                    </span>
                    <span>·</span>
                    <span>{(p.profiles as any)?.matricula}</span>
                    <span>·</span>
                    <span>{format(new Date(p.created_at), "d 'de' MMM yyyy", { locale: ptBR })}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
