import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<string>('informativo');
  const [turmaTarget, setTurmaTarget] = useState<string>('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (id && user) fetchPost();
  }, [id, user]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id!)
      .eq('author_id', user!.id)
      .single();

    if (!data) {
      toast({ title: 'Postagem não encontrada ou sem permissão', variant: 'destructive' });
      navigate('/perfil');
      return;
    }

    setTitle(data.title);
    setBody(data.body);
    setType(data.type);
    setTurmaTarget(data.turma_target ? String(data.turma_target) : '');
    setEventDate(data.event_date ? new Date(data.event_date).toISOString().slice(0, 16) : '');
    setFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setLoading(true);

    // Create a revision for admin review
    const { error } = await supabase.from('post_revisions').insert({
      post_id: id,
      editor_id: user.id,
      title_snapshot: title,
      body_snapshot: body,
    });

    if (error) {
      toast({ title: 'Erro ao enviar revisão', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Revisão enviada!', description: 'Aguardando aprovação de um administrador.' });
    navigate(`/post/${id}`);
  };

  if (fetching) return <div className="container mx-auto p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Editar Postagem</CardTitle>
          <p className="text-sm text-muted-foreground">As alterações serão enviadas para revisão antes de serem publicadas.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    {profile?.is_admin && <SelectItem value="evento">Evento</SelectItem>}
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="estagio">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turma (opcional)</Label>
                <Select value={turmaTarget || 'geral'} onValueChange={(val) => setTurmaTarget(val === 'geral' ? '' : val)}>
                  <SelectTrigger><SelectValue placeholder="Geral" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="2024">Turma 2024</SelectItem>
                    <SelectItem value="2025">Turma 2025</SelectItem>
                    <SelectItem value="2026">Turma 2026</SelectItem>
                    <SelectItem value="2027">Turma 2027</SelectItem>
                    <SelectItem value="2028">Turma 2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {type === 'evento' && (
              <div className="space-y-2">
                <Label>Data do evento</Label>
                <Input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Título</Label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da postagem" />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea required rows={8} value={body} onChange={e => setBody(e.target.value)} placeholder="Escreva o conteúdo aqui..." />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar revisão para aprovação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
