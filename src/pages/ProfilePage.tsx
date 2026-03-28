import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const [myPosts, setMyPosts] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, type, status, created_at')
      .eq('author_id', user!.id)
      .order('created_at', { ascending: false });
    setMyPosts(data || []);
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-muted-foreground mb-4">Faça login para ver seu perfil.</p>
        <Link to="/login"><Button>Entrar</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Nome:</strong> {profile.full_name}</p>
          <p><strong>Matrícula:</strong> {profile.matricula}</p>
          <p><strong>Turma:</strong> {profile.turma_ano}</p>
          {profile.is_admin && <Badge className="bg-secondary text-secondary-foreground">Admin</Badge>}
          <div className="pt-4">
            <Button variant="outline" onClick={signOut}>Sair da conta</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Minhas Postagens</CardTitle>
        </CardHeader>
        <CardContent>
          {myPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma postagem.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map(p => (
                <Link key={p.id} to={`/post/${p.id}`} className="block">
                  <div className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), 'dd/MM/yyyy')}</p>
                    </div>
                    <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
