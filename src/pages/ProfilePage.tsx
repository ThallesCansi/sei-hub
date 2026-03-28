import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Camera, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import AvatarCropModal from '@/components/AvatarCropModal';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const INTEREST_SUGGESTIONS = [
  'Física', 'Química', 'Biologia', 'Matemática', 'Computação',
  'Engenharia', 'Neurociência', 'Inteligência Artificial', 'Robótica',
  'Biotecnologia', 'Meio Ambiente', 'Astronomia', 'Ciência de Dados',
  'Filosofia', 'Música', 'Arte', 'Esportes', 'Empreendedorismo',
];

interface ProfileLink {
  label: string;
  url: string;
}

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Crop modal
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchMyPosts();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setFullName((profile as any).full_name || '');
      setBio((profile as any).bio || '');
      setInterests((profile as any).interests || []);
      setLinks((profile as any).links || []);
      setAvatarUrl((profile as any).avatar_url || null);
    }
  }, [profile]);

  const fetchMyPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, type, status, created_at')
      .eq('author_id', user!.id)
      .order('created_at', { ascending: false });
    setMyPosts(data || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Selecione uma imagem', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (blob: Blob) => {
    setPendingAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropSrc(null);
  };

  const addInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !interests.includes(trimmed) && interests.length < 10) {
      setInterests([...interests, trimmed]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, { label: '', url: '' }]);
    }
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let newAvatarUrl = avatarUrl;

    // Upload avatar if changed
    if (pendingAvatarBlob) {
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, pendingAvatarBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) {
        toast({ title: 'Erro ao enviar foto', description: uploadError.message, variant: 'destructive' });
        setSaving(false);
        return;
      }

      newAvatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl + `?t=${Date.now()}`;
    }

    // Filter out incomplete links
    const validLinks = links.filter(l => l.label.trim() && l.url.trim());

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        interests,
        links: validLinks,
        avatar_url: newAvatarUrl,
      } as any)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Erro ao salvar perfil', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Perfil atualizado!' });
      setEditing(false);
      setPendingAvatarBlob(null);
      setAvatarPreview(null);
      // Reload to reflect changes
      window.location.reload();
    }
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-muted-foreground mb-4">Faça login para ver seu perfil.</p>
        <Link to="/login"><Button>Entrar</Button></Link>
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-heading font-bold text-muted-foreground">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-background" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            {editing ? (
              <div className="w-full space-y-4 text-left">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <Label>Áreas de interesse (max 10)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {interests.map(interest => (
                      <Badge key={interest} variant="secondary" className="gap-1 pr-1">
                        {interest}
                        <button onClick={() => removeInterest(interest)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newInterest}
                      onChange={e => setNewInterest(e.target.value)}
                      placeholder="Adicionar interesse..."
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest(newInterest))}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => addInterest(newInterest)} disabled={!newInterest.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {interests.length < 10 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {INTEREST_SUGGESTIONS.filter(s => !interests.includes(s)).slice(0, 8).map(s => (
                        <button
                          key={s}
                          onClick={() => addInterest(s)}
                          className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <Label>Links (max 5)</Label>
                  {links.map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder="Nome (ex: GitHub)"
                        value={link.label}
                        onChange={e => updateLink(i, 'label', e.target.value)}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={e => updateLink(i, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {links.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={addLink}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar link
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setPendingAvatarBlob(null);
                    setAvatarPreview(null);
                    // Reset to original values
                    if (profile) {
                      setFullName((profile as any).full_name || '');
                      setBio((profile as any).bio || '');
                      setInterests((profile as any).interests || []);
                      setLinks((profile as any).links || []);
                    }
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-heading font-bold">{profile.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Matrícula {profile.matricula} · Turma {profile.turma_ano}
                </p>
                {profile.is_admin && <Badge className="mt-1 bg-secondary text-secondary-foreground">Admin</Badge>}

                {(profile as any).bio && (
                  <p className="text-sm mt-3 max-w-md">{(profile as any).bio}</p>
                )}

                {/* Interests display */}
                {((profile as any).interests as string[] | undefined)?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                    {((profile as any).interests as string[]).map(interest => (
                      <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                    ))}
                  </div>
                )}

                {/* Links display */}
                {((profile as any).links as ProfileLink[] | undefined)?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {((profile as any).links as ProfileLink[]).map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Editar perfil
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut}>Sair da conta</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crop Modal */}
      {cropSrc && (
        <AvatarCropModal
          open={!!cropSrc}
          onOpenChange={open => !open && setCropSrc(null)}
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* My Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Minhas Postagens</CardTitle>
        </CardHeader>
        <CardContent>
          {myPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma postagem.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map(p => (
                <Link key={p.id} to={`/post/${p.id}`} className="block">
                  <div className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), 'dd/MM/yyyy')}</p>
                    </div>
                    <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
