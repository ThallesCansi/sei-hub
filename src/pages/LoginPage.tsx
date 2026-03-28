import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function getLoginErrorMessage(message: string, code?: string) {
  if (code === 'invalid_credentials' || message === 'Invalid login credentials') {
    return 'E-mail ou senha incorretos.';
  }

  return message;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: getLoginErrorMessage(error.message, error.code),
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Entrar no SEI</CardTitle>
          <CardDescription>Use seu e-mail e senha para acessar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-right">
              <Link to="/esqueci-senha" className="text-sm text-primary hover:underline font-medium">
                Esqueceu a senha?
              </Link>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
