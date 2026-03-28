import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

export default function AdminInstitutionalTab() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast({ title: 'Selecione o tipo da conta', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-institutional-account', {
      body: { email, password, full_name: name, account_type: type },
    });
    setLoading(false);
    if (error || data?.error) {
      toast({ title: 'Erro ao criar conta', description: data?.error || error?.message, variant: 'destructive' });
    } else {
      toast({ title: 'Conta institucional criada!', description: `Conta para ${name} criada com sucesso.` });
      setEmail(''); setPassword(''); setName(''); setType('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Criar Conta Institucional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Crie contas para entidades como Centro Acadêmico e Atlética. Essas contas não precisam de e-mail @ilum.cnpem.br.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label>Tipo da Conta</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="centro_academico">Centro Acadêmico</SelectItem>
                <SelectItem value="atletica">Atlética</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nome da Entidade</Label>
            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Centro Acadêmico Ilum" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ca@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta Institucional'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
