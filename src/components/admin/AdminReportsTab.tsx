import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ExternalLink, Eye, CheckCircle, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  assedio: 'Assédio',
  direitos_autorais: 'Direitos Autorais',
  desinformacao: 'Desinformação',
  outros: 'Outros',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Aberta',
  in_review: 'Em análise',
  resolved: 'Resolvida',
};

export default function AdminReportsTab() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [targetContent, setTargetContent] = useState<any>(null);

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    let query = supabase
      .from('reports')
      .select('*, profiles:reporter_id(full_name)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setReports(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'open' | 'in_review' | 'resolved') => {
    const updates: any = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = profile!.id;
    }
    await supabase.from('reports').update(updates).eq('id', id);
    toast({ title: `Status atualizado para: ${STATUS_LABELS[status]}` });
    fetchReports();
    if (selectedReport?.id === id) {
      setSelectedReport((prev: any) => prev ? { ...prev, status } : null);
    }
  };

  const viewReportDetail = async (report: any) => {
    setSelectedReport(report);
    // Fetch the target content
    if (report.target_type === 'post') {
      const { data } = await supabase
        .from('posts')
        .select('id, title, body, status, profiles:author_id(full_name)')
        .eq('id', report.target_id)
        .single();
      setTargetContent(data);
    } else if (report.target_type === 'comment') {
      const { data } = await supabase
        .from('comments')
        .select('id, body, profiles:author_id(full_name)')
        .eq('id', report.target_id)
        .single();
      setTargetContent(data);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-100 text-red-700',
      in_review: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || ''}`}>
        {STATUS_LABELS[status] || status}
      </span>
    );
  };

  const reasonBadge = (reason: string) => (
    <Badge variant="outline" className="text-xs">
      {REASON_LABELS[reason] || reason}
    </Badge>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="font-semibold text-lg">Denúncias</h3>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="in_review">Em análise</SelectItem>
              <SelectItem value="resolved">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">{reports.length} denúncia(s)</p>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : reports.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma denúncia encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {r.target_type === 'post' ? 'Post' : 'Comentário'}
                      </Badge>
                    </TableCell>
                    <TableCell>{reasonBadge(r.reason)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {r.details || <span className="text-muted-foreground italic">Sem detalhes</span>}
                    </TableCell>
                    <TableCell className="text-sm">{(r.profiles as any)?.full_name}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(r.created_at), 'dd/MM/yy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" title="Ver detalhes" onClick={() => viewReportDetail(r)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {r.status === 'open' && (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(r.id, 'in_review')}>
                            Analisar
                          </Button>
                        )}
                        {r.status !== 'resolved' && (
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => updateStatus(r.id, 'resolved')}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolver
                          </Button>
                        )}
                        {r.status === 'resolved' && (
                          <Button size="sm" variant="ghost" className="text-xs" onClick={() => updateStatus(r.id, 'open')}>
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={(open) => { if (!open) { setSelectedReport(null); setTargetContent(null); } }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Denúncia</DialogTitle>
              <DialogDescription>
                {selectedReport?.target_type === 'post' ? 'Postagem' : 'Comentário'} denunciado(a)
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Motivo</p>
                    <p className="font-medium">{REASON_LABELS[selectedReport.reason]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Status</p>
                    {statusBadge(selectedReport.status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Reportado por</p>
                    <p>{(selectedReport.profiles as any)?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data</p>
                    <p>{format(new Date(selectedReport.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>

                {selectedReport.details && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Detalhes</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedReport.details}</p>
                  </div>
                )}

                {/* Target content */}
                {targetContent && (
                  <div className="border rounded-lg p-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Conteúdo {selectedReport.target_type === 'post' ? 'da postagem' : 'do comentário'}:
                    </p>
                    {selectedReport.target_type === 'post' && (
                      <>
                        <p className="font-semibold">{targetContent.title}</p>
                        <p className="text-sm text-muted-foreground">
                          por {(targetContent.profiles as any)?.full_name} · Status: {targetContent.status}
                        </p>
                        <p className="text-sm line-clamp-4">{targetContent.body?.slice(0, 400)}</p>
                        <Link to={`/post/${targetContent.id}`} className="text-xs text-primary flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-3 w-3" /> Ver postagem completa
                        </Link>
                      </>
                    )}
                    {selectedReport.target_type === 'comment' && (
                      <>
                        <p className="text-sm">{targetContent.body}</p>
                        <p className="text-xs text-muted-foreground">
                          por {(targetContent.profiles as any)?.full_name}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {!targetContent && (
                  <p className="text-sm text-muted-foreground italic">
                    Conteúdo não encontrado (pode ter sido excluído).
                  </p>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  {selectedReport.status === 'open' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selectedReport.id, 'in_review')}>
                      Marcar em análise
                    </Button>
                  )}
                  {selectedReport.status !== 'resolved' && (
                    <Button size="sm" onClick={() => updateStatus(selectedReport.id, 'resolved')}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Resolver
                    </Button>
                  )}
                  {selectedReport.target_type === 'post' && targetContent && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await supabase.from('posts').update({ status: 'rejected', rejection_reason: `Denúncia: ${REASON_LABELS[selectedReport.reason]}` }).eq('id', selectedReport.target_id);
                        await updateStatus(selectedReport.id, 'resolved');
                        toast({ title: 'Post rejeitado e denúncia resolvida' });
                      }}
                    >
                      Rejeitar Post
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
