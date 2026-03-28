import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Flag, Lock, Paperclip, User } from 'lucide-react';
import AttachmentModal from '@/components/AttachmentModal';

const POST_TYPE_LABELS: Record<string, string> = {
  informativo: 'Informativo',
  evento: 'Evento',
  material: 'Material',
  trabalho: 'Trabalho',
  estagio: 'Estágio',
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      fetchAttachments();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:author_id(full_name, matricula), disciplines(name), academic_terms(label)')
      .eq('id', id!)
      .single();
    setPost(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles:author_id(full_name, matricula)')
      .eq('post_id', id!)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const fetchAttachments = async () => {
    const { data } = await supabase
      .from('attachments')
      .select('*')
      .eq('post_id', id!);
    setAttachments(data || []);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user || !profile) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: id!,
      author_id: user.id,
      body: newComment.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erro ao comentar', description: error.message, variant: 'destructive' });
    } else {
      setNewComment('');
      fetchComments();
    }
  };

  const reportPost = async () => {
    if (!user) return;
    const { error } = await supabase.from('reports').insert({
      target_type: 'post' as const,
      target_id: id!,
      reporter_id: user.id,
      reason: 'outros' as const,
      details: 'Denúncia via botão',
    });
    if (!error) toast({ title: 'Denúncia enviada' });
  };

  if (loading) return <div className="container mx-auto p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!post) return <div className="container mx-auto p-8 text-center text-muted-foreground">Postagem não encontrada.</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <article>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline">{POST_TYPE_LABELS[post.type]}</Badge>
          {post.turma_target && <Badge variant="outline">Turma {post.turma_target}</Badge>}
          {post.pinned && <Badge className="bg-primary/10 text-primary">Fixado</Badge>}
        </div>

        <h1 className="text-3xl font-heading font-bold mb-2">{post.title}</h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6 flex-wrap">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {(post.profiles as any)?.full_name} · {(post.profiles as any)?.matricula}
          </span>
          <span>{format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</span>
          {post.event_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.event_date), "d 'de' MMM, HH:mm", { locale: ptBR })}
            </span>
          )}
          {(post.disciplines as any)?.name && <Badge variant="secondary">{(post.disciplines as any).name}</Badge>}
          {(post.academic_terms as any)?.label && <Badge variant="outline">{(post.academic_terms as any).label}</Badge>}
        </div>

        <div className="prose prose-sm max-w-none mb-6 whitespace-pre-wrap">
          {post.body}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium flex items-center gap-1">
              <Paperclip className="h-4 w-4" /> Anexos
            </h3>
            {attachments.map(att => (
              <button
                key={att.id}
                onClick={() => setSelectedAttachment(att)}
                className="block text-sm text-primary hover:underline cursor-pointer text-left"
              >
                {att.file_name} ({(att.size_bytes / 1024).toFixed(0)} KB)
              </button>
            ))}
          </div>
        )}

        <AttachmentModal
          open={!!selectedAttachment}
          onOpenChange={(open) => !open && setSelectedAttachment(null)}
          attachment={selectedAttachment}
        />

        {user && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={reportPost}>
            <Flag className="h-3.5 w-3.5 mr-1" /> Denunciar
          </Button>
        )}
      </article>

      {/* Comments */}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-lg font-heading font-semibold mb-4">Comentários</h2>

        {post.comments_locked ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <Lock className="h-4 w-4" /> Comentários trancados nesta postagem
          </div>
        ) : (
          user && profile && (
            <div className="mb-6 space-y-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
              />
              <Button size="sm" disabled={submitting || !newComment.trim()} onClick={submitComment}>
                {submitting ? 'Enviando...' : 'Comentar'}
              </Button>
            </div>
          )
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
          ) : (
            comments.map(c => (
              <Card key={c.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1 text-sm">
                    <span className="font-medium">{(c.profiles as any)?.full_name}</span>
                    <span className="text-muted-foreground">· {(c.profiles as any)?.matricula}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(c.created_at), "d/MM/yy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm">{c.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
