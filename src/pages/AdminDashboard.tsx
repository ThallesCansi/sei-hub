import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Check, X, Pin, Lock, Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [pendingRevisions, setPendingRevisions] = useState<any[]>([]);
  const [openReports, setOpenReports] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile?.is_admin) {
      fetchPending();
      fetchRevisions();
      fetchReports();
    }
  }, [profile]);

  if (!profile?.is_admin) return <Navigate to="/" replace />;

  const fetchPending = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:author_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setPendingPosts(data || []);
  };

  const fetchRevisions = async () => {
    const { data } = await supabase
      .from('post_revisions')
      .select('*, profiles:editor_id(full_name), posts(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setPendingRevisions(data || []);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*, profiles:reporter_id(full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: true });
    setOpenReports(data || []);
  };

  const approvePost = async (postId: string) => {
    await supabase.from('posts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', postId);
    toast({ title: 'Post aprovado' });
    fetchPending();
  };

  const rejectPost = async (postId: string) => {
    await supabase.from('posts').update({
      status: 'rejected',
      rejection_reason: rejectReason[postId] || 'Rejeitado pelo admin',
    }).eq('id', postId);
    toast({ title: 'Post rejeitado' });
    fetchPending();
  };

  const togglePin = async (postId: string, pinned: boolean) => {
    await supabase.from('posts').update({ pinned: !pinned }).eq('id', postId);
    toast({ title: pinned ? 'Desafixado' : 'Fixado' });
    fetchPending();
  };

  const toggleCommentsLock = async (postId: string, locked: boolean) => {
    await supabase.from('posts').update({ comments_locked: !locked }).eq('id', postId);
    toast({ title: locked ? 'Comentários destrancados' : 'Comentários trancados' });
  };

  const approveRevision = async (revId: string, postId: string, titleSnap: string, bodySnap: string) => {
    await supabase.from('post_revisions').update({
      status: 'approved',
      reviewed_by: profile!.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', revId);
    await supabase.from('posts').update({
      title: titleSnap,
      body: bodySnap,
      last_approved_revision_id: revId,
    }).eq('id', postId);
    toast({ title: 'Revisão aprovada' });
    fetchRevisions();
  };

  const resolveReport = async (reportId: string) => {
    await supabase.from('reports').update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: profile!.id,
    }).eq('id', reportId);
    toast({ title: 'Denúncia resolvida' });
    fetchReports();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-heading font-bold mb-6">Painel Admin</h1>

      <Tabs defaultValue="posts">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">
            Posts Pendentes ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="revisions">
            Revisões ({pendingRevisions.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Denúncias ({openReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {pendingPosts.length === 0 && <p className="text-muted-foreground">Nenhum post pendente.</p>}
          {pendingPosts.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      por {(p.profiles as any)?.full_name} · {format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="text-sm mt-2 line-clamp-3">{p.body?.slice(0, 300)}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => approvePost(p.id)}>
                      <Check className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Motivo"
                        className="text-xs h-8"
                        value={rejectReason[p.id] || ''}
                        onChange={e => setRejectReason(r => ({ ...r, [p.id]: e.target.value }))}
                      />
                      <Button size="sm" variant="destructive" onClick={() => rejectPost(p.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="revisions" className="space-y-4">
          {pendingRevisions.length === 0 && <p className="text-muted-foreground">Nenhuma revisão pendente.</p>}
          {pendingRevisions.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">Revisão: {r.title_snapshot}</h3>
                <p className="text-sm text-muted-foreground">
                  Post original: {(r.posts as any)?.title} · por {(r.profiles as any)?.full_name}
                </p>
                <p className="text-sm mt-2 line-clamp-3">{r.body_snapshot?.slice(0, 300)}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => approveRevision(r.id, r.post_id, r.title_snapshot, r.body_snapshot)}>
                    <Check className="h-4 w-4 mr-1" /> Aprovar Revisão
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {openReports.length === 0 && <p className="text-muted-foreground">Nenhuma denúncia aberta.</p>}
          {openReports.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline">{r.reason}</Badge>
                    <p className="text-sm mt-1">{r.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      por {(r.profiles as any)?.full_name} · {format(new Date(r.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => resolveReport(r.id)}>
                    Resolver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
