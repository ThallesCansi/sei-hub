import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const TURMA_YEARS = ['2024', '2025', '2026', '2027', '2028'];

function extractMatricula(email: string): string {
  const match = email.match(/(\d+)@/);
  return match ? match[1] : '';
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [turmaAno, setTurmaAno] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const matricula = extractMatricula(email);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaAno) {
      toast({ title: 'Selecione sua turma', variant: 'destructive' });
      return;
    }
    if (!email.endsWith('@ilum.cnpem.br')) {
      toast({ title: 'Use seu e-mail institucional (@ilum.cnpem.br)', variant: 'destructive' });
      return;
    }
    if (!matricula) {
      toast({ title: 'Não foi possível extrair a matrícula do e-mail', description: 'O e-mail deve conter números antes de @ilum.cnpem.br', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          matricula,
          turma_ano: parseInt(turmaAno),
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Cadastro realizado!', description: 'Verifique seu e-mail para confirmar a conta.' });
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">Criar Conta</CardTitle>
          <CardDescription>Preencha seus dados para se cadastrar no SEI</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="João da Silva" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail institucional</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nome24006@ilum.cnpem.br" />
              {matricula && (
                <p className="text-xs text-muted-foreground">Matrícula detectada: <strong>{matricula}</strong></p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Turma (Ano de ingresso)</Label>
              <Select value={turmaAno} onValueChange={setTurmaAno}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {TURMA_YEARS.map(y => (
                    <SelectItem key={y} value={y}>Turma {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
