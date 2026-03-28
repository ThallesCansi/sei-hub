import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Pin, Lock, Unlock, Search, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function AdminPostsTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:author_id(full_name)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const approvePost = async (id: string) => {
    await supabase.from('posts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    toast({ title: 'Post aprovado' });
    fetchPosts();
  };

  const rejectPost = async (id: string) => {
    await supabase.from('posts').update({ status: 'rejected', rejection_reason: 'Rejeitado pelo admin' }).eq('id', id);
    toast({ title: 'Post rejeitado' });
    fetchPosts();
  };

  const togglePin = async (id: string, pinned: boolean) => {
    await supabase.from('posts').update({ pinned: !pinned }).eq('id', id);
    toast({ title: pinned ? 'Desafixado' : 'Fixado' });
    fetchPosts();
  };

  const toggleLock = async (id: string, locked: boolean) => {
    await supabase.from('posts').update({ comments_locked: !locked }).eq('id', id);
    toast({ title: locked ? 'Comentários destrancados' : 'Comentários trancados' });
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    toast({ title: 'Post excluído' });
    fetchPosts();
  };

  const filtered = posts.filter(p => {
    const matchesSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      archived: 'bg-muted text-muted-foreground',
    };
    return map[s] || '';
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="informativo">Informativo</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="trabalho">Trabalho</SelectItem>
              <SelectItem value="estagio">Estágio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} post(s)</p>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {p.pinned && <Pin className="h-3 w-3 inline mr-1 text-primary" />}
                      {p.comments_locked && <Lock className="h-3 w-3 inline mr-1 text-muted-foreground" />}
                      {p.title}
                    </TableCell>
                    <TableCell className="text-sm">{(p.profiles as any)?.full_name}</TableCell>
                    <TableCell><span className="text-xs">{p.type}</span></TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(p.created_at), 'dd/MM/yy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Ver post" onClick={() => navigate(`/post/${p.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.status === 'pending' && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => approvePost(p.id)}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => rejectPost(p.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => togglePin(p.id, p.pinned)}>
                          <Pin className={`h-4 w-4 ${p.pinned ? 'text-primary' : ''}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleLock(p.id, p.comments_locked)}>
                          {p.comments_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deletePost(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
