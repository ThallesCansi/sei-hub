import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function AdminReportsTab() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*, profiles:reporter_id(full_name)')
      .eq('status', 'open')
      .order('created_at', { ascending: true });
    setReports(data || []);
  };

  const resolve = async (id: string) => {
    await supabase.from('reports').update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: profile!.id,
    }).eq('id', id);
    toast({ title: 'Denúncia resolvida' });
    fetchReports();
  };

  return (
    <div className="space-y-4">
      {reports.length === 0 && <p className="text-muted-foreground">Nenhuma denúncia aberta.</p>}
      {reports.map(r => (
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
              <Button size="sm" variant="outline" onClick={() => resolve(r.id)}>
                Resolver
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
