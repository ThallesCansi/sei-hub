import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  postId: string;
  size?: 'sm' | 'default';
  className?: string;
}

export default function FavoriteButton({ postId, size = 'sm', className }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkFavorite();
  }, [user, postId]);

  const checkFavorite = async () => {
    const { data } = await supabase
      .from('favorites' as any)
      .select('id')
      .eq('user_id', user!.id)
      .eq('post_id', postId)
      .maybeSingle();
    setIsFavorited(!!data);
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);

    if (isFavorited) {
      await supabase
        .from('favorites' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
      setIsFavorited(false);
    } else {
      await supabase
        .from('favorites' as any)
        .insert({ user_id: user.id, post_id: postId } as any);
      setIsFavorited(true);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggle}
      disabled={loading}
      className={cn('text-muted-foreground hover:text-destructive', className)}
      title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          isFavorited && 'fill-destructive text-destructive'
        )}
      />
    </Button>
  );
}
