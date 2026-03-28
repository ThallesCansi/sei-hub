import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPendingPostsTab() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:author_id(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setPosts(data || []);
  };

  const approve = async (id: string) => {
    await supabase.from('posts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id);
    toast({ title: 'Post aprovado' });
    fetchPending();
  };

  const reject = async (id: string) => {
    await supabase.from('posts').update({
      status: 'rejected',
      rejection_reason: rejectReason[id] || 'Rejeitado pelo admin',
    }).eq('id', id);
    toast({ title: 'Post rejeitado' });
    fetchPending();
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 && <p className="text-muted-foreground">Nenhum post pendente.</p>}
      {posts.map(p => (
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
                <Button size="sm" onClick={() => approve(p.id)}>
                  <Check className="h-4 w-4 mr-1" /> Aprovar
                </Button>
                <div className="flex gap-1">
                  <Input
                    placeholder="Motivo"
                    className="text-xs h-8"
                    value={rejectReason[p.id] || ''}
                    onChange={e => setRejectReason(r => ({ ...r, [p.id]: e.target.value }))}
                  />
                  <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
