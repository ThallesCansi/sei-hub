import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BookOpen, Trophy } from 'lucide-react';

export default function AtleticaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ backgroundColor: 'hsl(270, 55%, 40%)' }}>
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            <path d="M0 300 Q 200 200, 400 280 T 800 250 L800 400 L0 400Z" fill="currentColor" className="text-card/10" />
            <path d="M0 350 Q 300 280, 500 340 T 800 300 L800 400 L0 400Z" fill="currentColor" className="text-card/10" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card/20 backdrop-blur mb-4">
            <Trophy className="h-10 w-10 text-card" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-card mb-2">
            Centro Atlético Acadêmico
          </h1>
          <p className="text-lg text-card/80">Pesquisa & Ensino de Ciências</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">
        {/* Sobre nós */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Sobre nós</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            A Atlética é responsável por promover a prática esportiva e a integração entre os estudantes do curso. Organizamos campeonatos, treinos e eventos esportivos ao longo do ano.
          </p>
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
                  Acesse as atas das reuniões da Atlética.
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
                  Leia o estatuto da Atlética. Conheça as regras e a estrutura da organização.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Histórico */}
        <section>
          <h2 className="text-2xl font-heading font-bold mb-4">Histórico</h2>
          <Card style={{ backgroundColor: 'hsl(270, 55%, 40%, 0.05)' }}>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                A Atlética foi fundada com o objetivo de promover o esporte e a integração estudantil, participando de competições interuniversitárias e organizando eventos internos.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
