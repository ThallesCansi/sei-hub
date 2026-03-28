import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, ShieldOff, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersTab() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    await supabase.from('profiles').update({ is_admin: !isAdmin }).eq('id', userId);
    toast({ title: isAdmin ? 'Admin removido' : 'Admin adicionado' });
    fetchUsers();
  };

  const updateStatus = async (userId: string, status: string) => {
    await supabase.from('profiles').update({ status }).eq('id', userId);
    toast({ title: `Status atualizado para ${status}` });
    fetchUsers();
  };

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.matricula?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || ''}`}>{status}</span>;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou matrícula..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} usuário(s)</p>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.full_name}
                      {u.admin_label && (
                        <Badge variant="outline" className="ml-2 text-xs">{u.admin_label}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{u.matricula}</TableCell>
                    <TableCell>{u.turma_ano}</TableCell>
                    <TableCell>{statusBadge(u.status)}</TableCell>
                    <TableCell>
                      {u.is_admin ? (
                        <Badge className="bg-primary/10 text-primary">Admin</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(u.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title={u.is_admin ? 'Remover admin' : 'Tornar admin'}
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                        >
                          {u.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>
                        {u.status === 'approved' && (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => updateStatus(u.id, 'suspended')}>
                            Suspender
                          </Button>
                        )}
                        {u.status === 'suspended' && (
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus(u.id, 'approved')}>
                            Reativar
                          </Button>
                        )}
                        {u.status === 'pending' && (
                          <Button size="sm" variant="ghost" className="text-green-600" onClick={() => updateStatus(u.id, 'approved')}>
                            Aprovar
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
      </CardContent>
    </Card>
  );
}
