import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CurriculumGraph } from '@/components/CurriculumGraph';

export default function BibliotecaPage() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Biblioteca</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Clique em uma grande área para dar zoom, ou clique em uma disciplina para ver suas postagens
        </p>
      </div>

      <CurriculumGraph
        selectedArea={selectedArea}
        onAreaSelect={setSelectedArea}
      />
    </div>
  );
}
