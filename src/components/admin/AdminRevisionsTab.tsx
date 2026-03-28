import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';

export default function AdminRevisionsTab() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [revisions, setRevisions] = useState<any[]>([]);

  useEffect(() => { fetchRevisions(); }, []);

  const fetchRevisions = async () => {
    const { data } = await supabase
      .from('post_revisions')
      .select('*, profiles:editor_id(full_name), posts(title)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setRevisions(data || []);
  };

  const approve = async (revId: string, postId: string, title: string, body: string) => {
    await supabase.from('post_revisions').update({
      status: 'approved',
      reviewed_by: profile!.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', revId);
    await supabase.from('posts').update({
      title, body, last_approved_revision_id: revId,
    }).eq('id', postId);
    toast({ title: 'Revisão aprovada' });
    fetchRevisions();
  };

  return (
    <div className="space-y-4">
      {revisions.length === 0 && <p className="text-muted-foreground">Nenhuma revisão pendente.</p>}
      {revisions.map(r => (
        <Card key={r.id}>
          <CardContent className="p-4">
            <h3 className="font-semibold">Revisão: {r.title_snapshot}</h3>
            <p className="text-sm text-muted-foreground">
              Post original: {(r.posts as any)?.title} · por {(r.profiles as any)?.full_name}
            </p>
            <p className="text-sm mt-2 line-clamp-3">{r.body_snapshot?.slice(0, 300)}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => approve(r.id, r.post_id, r.title_snapshot, r.body_snapshot)}>
                <Check className="h-4 w-4 mr-1" /> Aprovar Revisão
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
