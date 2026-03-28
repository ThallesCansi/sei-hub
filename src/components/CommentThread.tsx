import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CornerDownRight } from 'lucide-react';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  parent_id: string | null;
  profiles: { full_name: string; matricula: string } | null;
}

interface CommentThreadProps {
  comments: Comment[];
  postId: string;
  commentsLocked: boolean;
  onRefresh: () => void;
}

function CommentItem({ comment, depth, postId, commentsLocked, onRefresh }: {
  comment: Comment;
  depth: number;
  postId: string;
  commentsLocked: boolean;
  onRefresh: () => void;
}) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: user.id,
      body: replyText.trim(),
      parent_id: comment.id,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erro ao responder', description: error.message, variant: 'destructive' });
    } else {
      setReplyText('');
      setReplying(false);
      onRefresh();
    }
  };

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1 text-sm">
            <span className="font-medium">{(comment.profiles as any)?.full_name}</span>
            <span className="text-muted-foreground">· {(comment.profiles as any)?.matricula}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {format(new Date(comment.created_at), "d/MM/yy HH:mm")}
            </span>
          </div>
          <p className="text-sm">{comment.body}</p>
          {user && profile && !commentsLocked && depth < 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground mt-1 h-6 px-2"
              onClick={() => setReplying(!replying)}
            >
              <CornerDownRight className="h-3 w-3 mr-1" /> Responder
            </Button>
          )}
          {replying && (
            <div className="mt-2 space-y-2">
              <Textarea
                placeholder="Escreva sua resposta..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" disabled={submitting || !replyText.trim()} onClick={submitReply}>
                  {submitting ? 'Enviando...' : 'Responder'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Build tree from flat list
function buildTree(comments: Comment[]): (Comment & { children: any[] })[] {
  const map = new Map<string, Comment & { children: any[] }>();
  const roots: (Comment & { children: any[] })[] = [];

  comments.forEach(c => map.set(c.id, { ...c, children: [] }));
  comments.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function RenderTree({ nodes, depth, postId, commentsLocked, onRefresh }: {
  nodes: (Comment & { children: any[] })[];
  depth: number;
  postId: string;
  commentsLocked: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-3">
      {nodes.map(node => (
        <div key={node.id}>
          <CommentItem comment={node} depth={depth} postId={postId} commentsLocked={commentsLocked} onRefresh={onRefresh} />
          {node.children.length > 0 && (
            <div className="mt-2">
              <RenderTree nodes={node.children} depth={depth + 1} postId={postId} commentsLocked={commentsLocked} onRefresh={onRefresh} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CommentThread({ comments, postId, commentsLocked, onRefresh }: CommentThreadProps) {
  const tree = buildTree(comments);

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>;
  }

  return <RenderTree nodes={tree} depth={0} postId={postId} commentsLocked={commentsLocked} onRefresh={onRefresh} />;
}
