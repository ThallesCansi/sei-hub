import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UserProfileLink from '@/components/UserProfileLink';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pin, Calendar, Search, Plus, Clock } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const POST_TYPE_LABELS: Record<string, string> = {
  informativo: 'Informativo',
  evento: 'Evento',
  material: 'Material',
  trabalho: 'Trabalho',
  estagio: 'Estágio',
};

const POST_TYPE_COLORS: Record<string, string> = {
  informativo: 'bg-primary/15 text-primary',
  evento: 'bg-secondary/15 text-secondary',
  material: 'bg-muted text-muted-foreground',
  trabalho: 'bg-destructive/15 text-destructive',
  estagio: 'bg-accent/15 text-accent-foreground',
};

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTurma, setFilterTurma] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchUpcomingEvents();
  }, [filterType, filterTurma]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, profiles:author_id(full_name, matricula, avatar_url, id)')
      .eq('status', 'approved')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);

    if (filterType !== 'all') query = query.eq('type', filterType as any);
    if (filterTurma !== 'all') {
      query = query.or(`turma_target.eq.${filterTurma},turma_target.is.null`);
    }

    const { data } = await query;
    setPosts(data || []);
    setLoading(false);
  };

  const fetchUpcomingEvents = async () => {
    const now = new Date().toISOString();
    const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString();
    const { data } = await supabase
      .from('posts')
      .select('id, title, event_date')
      .eq('status', 'approved')
      .eq('type', 'evento')
      .gte('event_date', now)
      .lte('event_date', twoWeeks)
      .order('event_date', { ascending: true })
      .limit(5);
    setUpcomingEvents(data || []);
  };

  const filteredPosts = posts.filter(p =>
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Mural</h1>
          <p className="text-muted-foreground text-sm mt-1">Informativos, eventos e mais</p>
        </div>
        {user && (
          <Link to="/nova-postagem">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Nova Postagem
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar postagens..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="informativo">Informativos</SelectItem>
                <SelectItem value="evento">Eventos</SelectItem>
                <SelectItem value="material">Materiais</SelectItem>
                <SelectItem value="trabalho">Trabalhos</SelectItem>
                <SelectItem value="estagio">Estágios</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTurma} onValueChange={setFilterTurma}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas turmas</SelectItem>
                <SelectItem value="2024">Turma 2024</SelectItem>
                <SelectItem value="2025">Turma 2025</SelectItem>
                <SelectItem value="2026">Turma 2026</SelectItem>
                <SelectItem value="2027">Turma 2027</SelectItem>
                <SelectItem value="2028">Turma 2028</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Posts list */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Carregando...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma postagem encontrada.
            </div>
          ) : (
            filteredPosts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {post.pinned && (
                            <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                          )}
                          <Badge variant="outline" className={POST_TYPE_COLORS[post.type]}>
                            {POST_TYPE_LABELS[post.type]}
                          </Badge>
                          {post.turma_target && (
                            <Badge variant="outline">Turma {post.turma_target}</Badge>
                          )}
                        </div>
                        <h3 className="font-heading font-semibold text-lg truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.body?.replace(/[#*_~`]/g, '').slice(0, 200)}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <UserProfileLink
                            userId={(post.profiles as any)?.id || post.author_id}
                            fullName={(post.profiles as any)?.full_name || 'Anônimo'}
                            avatarUrl={(post.profiles as any)?.avatar_url}
                            size="sm"
                          />
                          <span>•</span>
                          <span>{format(new Date(post.created_at), "d 'de' MMM", { locale: ptBR })}</span>
                        </div>
                          <span>{format(new Date(post.created_at), "d 'de' MMM", { locale: ptBR })}</span>
                        </div>
                      </div>
                      <FavoriteButton postId={post.id} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Clock className="h-4 w-4" /> Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento próximo</p>
              ) : (
                upcomingEvents.map(ev => (
                  <Link key={ev.id} to={`/post/${ev.id}`} className="block">
                    <div className="flex items-start gap-2 hover:bg-muted/50 rounded p-1.5 -m-1.5 transition-colors">
                      <Calendar className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ev.event_date), "d 'de' MMM, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {!user && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm mb-3">Faça login para criar postagens e comentar</p>
                <Link to="/login">
                  <Button size="sm">Entrar</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
