import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  totalPosts: number;
  pendingPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  openReports: number;
  totalComments: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, pendingUsers: 0, totalPosts: 0,
    pendingPosts: 0, approvedPosts: 0, rejectedPosts: 0,
    openReports: 0, totalComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [profiles, posts, reports, comments] = await Promise.all([
      supabase.from('profiles').select('id, status', { count: 'exact' }),
      supabase.from('posts').select('id, status', { count: 'exact' }),
      supabase.from('reports').select('id, status', { count: 'exact' }),
      supabase.from('comments').select('id', { count: 'exact' }),
    ]);

    const allPosts = posts.data || [];
    const allProfiles = profiles.data || [];

    setStats({
      totalUsers: allProfiles.length,
      pendingUsers: allProfiles.filter(p => p.status === 'pending').length,
      totalPosts: allPosts.length,
      pendingPosts: allPosts.filter(p => p.status === 'pending').length,
      approvedPosts: allPosts.filter(p => p.status === 'approved').length,
      rejectedPosts: allPosts.filter(p => p.status === 'rejected').length,
      openReports: (reports.data || []).filter(r => r.status === 'open').length,
      totalComments: comments.data?.length || 0,
    });

    // Recent posts
    const { data: recent } = await supabase
      .from('posts')
      .select('id, title, status, created_at, profiles:author_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentPosts(recent || []);
    setLoading(false);
  };

  if (loading) return <p className="text-muted-foreground">Carregando estatísticas...</p>;

  const cards = [
    { label: 'Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-600' },
    { label: 'Posts Total', value: stats.totalPosts, icon: FileText, color: 'text-primary' },
    { label: 'Posts Pendentes', value: stats.pendingPosts, icon: Clock, color: 'text-yellow-600' },
    { label: 'Posts Aprovados', value: stats.approvedPosts, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Posts Rejeitados', value: stats.rejectedPosts, icon: XCircle, color: 'text-red-600' },
    { label: 'Denúncias Abertas', value: stats.openReports, icon: AlertTriangle, color: 'text-orange-600' },
    { label: 'Comentários', value: stats.totalComments, icon: FileText, color: 'text-purple-600' },
    { label: 'Usuários Pendentes', value: stats.pendingUsers, icon: Clock, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className={`h-8 w-8 ${c.color} flex-shrink-0`} />
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum post encontrado.</p>
          ) : (
            <div className="space-y-2">
              {recentPosts.map(p => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {(p.profiles as any)?.full_name} · {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.status === 'approved' ? 'bg-green-100 text-green-700' :
                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
