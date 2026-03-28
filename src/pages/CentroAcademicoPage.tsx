import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, BookOpen, Trophy } from 'lucide-react';
import heroCA from '@/assets/hero-ca.svg';

export default function CentroAcademicoPage() {
  return (
      <div className="min-h-screen">
        
        {/* Hero Substituído */}
      <div className="w-full bg-[#F2D6A3]">
        {/* Removi o max-w-[1280px] daqui */}
        <div className="w-full">
          <img 
            src={heroCA} 
            alt="Banner Centro Acadêmico Lélia Gonzales" 
            className="w-full h-auto object-cover md:max-h-[500px] lg:max-h-[640px]" 
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Sobre nós */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Sobre nós</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            O Centro Acadêmico representa os estudantes do curso de Ciência e Tecnologia, promovendo atividades acadêmicas, culturais e sociais. Nossa missão é garantir a voz estudantil nas decisões do curso e criar um ambiente colaborativo de aprendizado.
          </p>
        </section>

        {/* Cargos */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Cargos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Presidente', 'Vice-Presidente', 'Secretário(a)', 'Tesoureiro(a)', 'Dir. Acadêmico', 'Dir. Comunicação'].map(cargo => (
              <Card key={cargo}>
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">{cargo}</p>
                  <p className="text-sm text-muted-foreground">Nome do membro</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Membros */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Membros</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 text-center">
                  <div className="w-20 h-20 rounded-lg bg-muted mx-auto mb-2 flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Membro {i + 1}</p>
                  <p className="text-xs text-muted-foreground">Cargo</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Documentos */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Documentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> Atas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse as atas das reuniões do Centro Acadêmico. Mantenha-se informado sobre as decisões tomadas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" /> Estatuto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leia o estatuto do Centro Acadêmico. Conheça seus direitos e deveres como estudante.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Histórico</h2>
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Fundado em [ano], o Centro Acadêmico tem uma longa história de representação estudantil e conquistas para o curso de Ciência e Tecnologia.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
