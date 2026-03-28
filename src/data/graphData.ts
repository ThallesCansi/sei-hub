export interface GraphNode {
  id: string;
  label: string;
  type: 'area' | 'discipline';
  x: number;
  y: number;
  area?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

// Positions are relative to a 1000x800 viewBox
export const GRAPH_NODES: GraphNode[] = [
  // Major areas (hub nodes)
  { id: 'mat', label: 'Linguagem Matemática', type: 'area', x: 350, y: 80 },
  { id: 'dados', label: 'Ciência de Dados', type: 'area', x: 150, y: 300 },
  { id: 'materia', label: 'Ciência da Matéria', type: 'area', x: 300, y: 580 },
  { id: 'vida', label: 'Ciência da Vida', type: 'area', x: 700, y: 520 },
  { id: 'human', label: 'Humanidades', type: 'area', x: 780, y: 220 },

  // Linguagem Matemática disciplines
  { id: 'algebra', label: 'Álgebra Linear', type: 'discipline', x: 310, y: 15, area: 'mat' },
  { id: 'modelagem', label: 'Modelagem', type: 'discipline', x: 450, y: 15, area: 'mat' },
  { id: 'calc', label: 'Cálculo Multivariado', type: 'discipline', x: 220, y: 55, area: 'mat' },
  { id: 'biomat', label: 'Biomatemática', type: 'discipline', x: 500, y: 65, area: 'mat' },

  // Ciência de Dados disciplines
  { id: 'aprendizado', label: 'Aprendizado de Máquina', type: 'discipline', x: 90, y: 160, area: 'dados' },
  { id: 'redes', label: 'Redes Neurais Artificiais', type: 'discipline', x: 30, y: 230, area: 'dados' },
  { id: 'pln', label: 'Processamento de Linguagem Natural', type: 'discipline', x: 210, y: 200, area: 'dados' },
  { id: 'prob', label: 'Probabilidade e Estatística', type: 'discipline', x: 340, y: 200, area: 'dados' },
  { id: 'otim', label: 'Otimização', type: 'discipline', x: 460, y: 200, area: 'dados' },
  { id: 'logica', label: 'Lógica Computacional', type: 'discipline', x: 30, y: 340, area: 'dados' },
  { id: 'procimg', label: 'Processamento de Imagem', type: 'discipline', x: 220, y: 370, area: 'dados' },
  { id: 'mineracao', label: 'Mineração e Análise de Dados', type: 'discipline', x: 80, y: 420, area: 'dados' },
  { id: 'compevo', label: 'Computação Evolutiva', type: 'discipline', x: 210, y: 440, area: 'dados' },

  // Ciência da Matéria disciplines
  { id: 'quiorg', label: 'Química Orgânica', type: 'discipline', x: 330, y: 440, area: 'materia' },
  { id: 'atomos', label: 'Teoria de Átomos e Moléculas', type: 'discipline', x: 440, y: 430, area: 'materia' },
  { id: 'eletroquim', label: 'Eletroquímica', type: 'discipline', x: 250, y: 490, area: 'materia' },
  { id: 'matcond', label: 'Matéria Condensada', type: 'discipline', x: 440, y: 490, area: 'materia' },
  { id: 'fundmat', label: 'Fundamentos da Matéria', type: 'discipline', x: 180, y: 560, area: 'materia' },
  { id: 'ondulat', label: 'Física Ondulatória', type: 'discipline', x: 420, y: 540, area: 'materia' },
  { id: 'cinetica', label: 'Cinética Química', type: 'discipline', x: 160, y: 640, area: 'materia' },
  { id: 'estat', label: 'Física Estatística', type: 'discipline', x: 400, y: 620, area: 'materia' },
  { id: 'mecanica', label: 'Mecânica Clássica', type: 'discipline', x: 210, y: 700, area: 'materia' },
  { id: 'quantica', label: 'Teoria Quântica', type: 'discipline', x: 370, y: 710, area: 'materia' },
  { id: 'termo', label: 'Termodinâmica', type: 'discipline', x: 260, y: 760, area: 'materia' },
  { id: 'eletrodin', label: 'Eletrodinâmica', type: 'discipline', x: 380, y: 760, area: 'materia' },

  // Ciência da Vida disciplines
  { id: 'genetica', label: 'Genética', type: 'discipline', x: 610, y: 460, area: 'vida' },
  { id: 'imuno', label: 'Imunologia', type: 'discipline', x: 780, y: 460, area: 'vida' },
  { id: 'dna', label: 'DNA', type: 'discipline', x: 600, y: 510, area: 'vida' },
  { id: 'neuro', label: 'Neurociências', type: 'discipline', x: 880, y: 480, area: 'vida' },
  { id: 'proteinas', label: 'Proteínas', type: 'discipline', x: 560, y: 560, area: 'vida' },
  { id: 'metabolismo', label: 'Metabolismo', type: 'discipline', x: 880, y: 540, area: 'vida' },
  { id: 'evolucao', label: 'Evolução', type: 'discipline', x: 570, y: 640, area: 'vida' },
  { id: 'biotech', label: 'Biotecnologia', type: 'discipline', x: 870, y: 600, area: 'vida' },
  { id: 'meioamb', label: 'Meio Ambiente', type: 'discipline', x: 570, y: 720, area: 'vida' },
  { id: 'micro', label: 'Microbiologia', type: 'discipline', x: 870, y: 660, area: 'vida' },
  { id: 'biocell', label: 'Biologia Celular', type: 'discipline', x: 640, y: 770, area: 'vida' },
  { id: 'bioquim', label: 'Bioquímica', type: 'discipline', x: 770, y: 770, area: 'vida' },

  // Humanidades disciplines
  { id: 'antropo', label: 'Antropoceno', type: 'discipline', x: 750, y: 100, area: 'human' },
  { id: 'cimod', label: 'Ciência Moderna', type: 'discipline', x: 680, y: 160, area: 'human' },
  { id: 'gestao', label: 'Gestão de Projetos', type: 'discipline', x: 870, y: 140, area: 'human' },
  { id: 'cisoc', label: 'Ciência e Sociedade', type: 'discipline', x: 650, y: 230, area: 'human' },
  { id: 'empreend', label: 'Empreendedorismo', type: 'discipline', x: 920, y: 200, area: 'human' },
  { id: 'cultnat', label: 'Cultura e Natureza', type: 'discipline', x: 690, y: 310, area: 'human' },
  { id: 'cultdig', label: 'Cultura Digital', type: 'discipline', x: 910, y: 290, area: 'human' },
  { id: 'arte', label: 'Arte', type: 'discipline', x: 700, y: 380, area: 'human' },
  { id: 'etica', label: 'Ética', type: 'discipline', x: 850, y: 370, area: 'human' },
];

// Edges connect disciplines to their areas, plus cross-area connections
export const GRAPH_EDGES: GraphEdge[] = [
  // All disciplines to their parent area
  ...GRAPH_NODES.filter(n => n.type === 'discipline' && n.area).map(n => ({
    from: n.area!,
    to: n.id,
  })),
  // Cross-area connections (visible in the reference image)
  { from: 'mat', to: 'prob' },
  { from: 'mat', to: 'otim' },
  { from: 'mat', to: 'biomat' },
  { from: 'dados', to: 'prob' },
  { from: 'dados', to: 'otim' },
  { from: 'materia', to: 'atomos' },
  { from: 'vida', to: 'biomat' },
  { from: 'vida', to: 'dna' },
  { from: 'human', to: 'cisoc' },
  { from: 'human', to: 'cultnat' },
];

export const AREA_COLORS: Record<string, { bg: string; text: string; line: string }> = {
  mat: { bg: '#3B1F6E', text: '#FFFFFF', line: '#6B3FA0' },
  dados: { bg: '#3B1F6E', text: '#FFFFFF', line: '#6B3FA0' },
  materia: { bg: '#3B1F6E', text: '#FFFFFF', line: '#6B3FA0' },
  vida: { bg: '#3B1F6E', text: '#FFFFFF', line: '#6B3FA0' },
  human: { bg: '#3B1F6E', text: '#FFFFFF', line: '#6B3FA0' },
};

export const DISCIPLINE_COLOR = { bg: '#D94F8E', text: '#FFFFFF' };
