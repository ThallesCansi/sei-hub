import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileLink {
  label: string;
  url: string;
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchPosts();
    }
  }, [id]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id!)
      .single();
    setProfileData(data);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, type, created_at, status')
      .eq('author_id', id!)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(20);
    setPosts(data || []);
  };

  if (loading) return <div className="container mx-auto p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!profileData) return <div className="container mx-auto p-8 text-center text-muted-foreground">Perfil não encontrado.</div>;

  // If viewing own profile, redirect
  if (user?.id === id) {
    window.location.href = '/perfil';
    return null;
  }

  const initials = profileData.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const links: ProfileLink[] = Array.isArray(profileData.links) ? profileData.links : [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profileData.avatar_url || undefined} alt={profileData.full_name} />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-heading font-bold">{profileData.full_name}</h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{profileData.matricula}</span>
          <span>·</span>
          <span>Turma {profileData.turma_ano}</span>
          {profileData.admin_label && (
            <Badge variant="outline" className="ml-1">{profileData.admin_label}</Badge>
          )}
        </div>
        {profileData.bio && (
          <p className="mt-3 text-sm text-muted-foreground max-w-md">{profileData.bio}</p>
        )}

        {profileData.interests && profileData.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {profileData.interests.map((interest: string) => (
              <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
            ))}
          </div>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Postagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {posts.map(p => (
              <Link
                key={p.id}
                to={`/post/${p.id}`}
                className="block p-3 rounded-md hover:bg-muted transition-colors"
              >
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
