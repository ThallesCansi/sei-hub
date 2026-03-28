import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function NewPostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<string>('informativo');
  const [turmaTarget, setTurmaTarget] = useState<string>('');
  const [eventDate, setEventDate] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        title,
        body,
        type: type as any,
        author_id: user.id,
        turma_target: turmaTarget ? parseInt(turmaTarget) : null,
        event_date: eventDate || null,
      })
      .select()
      .single();

    if (error || !post) {
      toast({ title: 'Erro ao criar postagem', description: error?.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Upload attachments
    for (const file of files.slice(0, 5)) {
      const path = `${user.id}/${post.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(path, file);

      if (!uploadError) {
        await supabase.from('attachments').insert({
          post_id: post.id,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        });
      }
    }

    setLoading(false);
    toast({ title: 'Postagem criada!', description: 'Aguardando aprovação de um administrador.' });
    navigate('/perfil');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f =>
      ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(f.type) && f.size <= 20 * 1024 * 1024
    );
    if (valid.length !== selected.length) {
      toast({ title: 'Alguns arquivos foram removidos', description: 'Apenas PDF e imagens até 20MB.', variant: 'destructive' });
    }
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  if (loading) return <div className="container mx-auto p-8 text-center">Carregando...</div>;
  if (!user) return <div className="container mx-auto p-8 text-center">Faça login para criar postagens.</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Nova Postagem</CardTitle>
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
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="estagio">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turma (opcional)</Label>
                <Select value={turmaTarget} onValueChange={setTurmaTarget}>
                  <SelectTrigger><SelectValue placeholder="Geral" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Geral</SelectItem>
                    <SelectItem value="1">1º Ano</SelectItem>
                    <SelectItem value="2">2º Ano</SelectItem>
                    <SelectItem value="3">3º Ano</SelectItem>
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

            <div className="space-y-2">
              <Label>Anexos (max 5, PDF/imagens até 20MB)</Label>
              <Input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
              {files.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {files.map((f, i) => <div key={i}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</div>)}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar para aprovação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
