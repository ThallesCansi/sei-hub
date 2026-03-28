export interface GraphNode {
  id: string;
  label: string;
  slug: string;
  type: 'center' | 'area' | 'discipline';
  x: number;
  y: number;
  area?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const VB_W = 960;
const VB_H = 800;
const CX = VB_W / 2;
const CY = VB_H / 2;

export const GRAPH_NODES: GraphNode[] = [
  // Central node (Ilum logo)
  { id: 'ilum', label: 'Ilum', slug: '', type: 'center', x: CX, y: CY },

  // Major areas (hub nodes)
  { id: 'mat', label: 'Linguagem Matemática', slug: 'linguagem-matematica', type: 'area', x: 350, y: 80 },
  { id: 'dados', label: 'Ciência de Dados', slug: 'ciencia-de-dados', type: 'area', x: 150, y: 300 },
  { id: 'materia', label: 'Ciência da Matéria', slug: 'ciencia-da-materia', type: 'area', x: 300, y: 620 },
  { id: 'vida', label: 'Ciência da Vida', slug: 'ciencia-da-vida', type: 'area', x: 700, y: 560 },
  { id: 'human', label: 'Humanidades', slug: 'humanidades', type: 'area', x: 780, y: 220 },

  // Linguagem Matemática disciplines
  { id: 'algebra', label: 'Álgebra Linear', slug: 'algebra-linear', type: 'discipline', x: 310, y: 15, area: 'mat' },
  { id: 'modelagem', label: 'Modelagem', slug: 'modelagem', type: 'discipline', x: 450, y: 15, area: 'mat' },
  { id: 'calc', label: 'Cálculo Multivariado', slug: 'calculo-multivariado', type: 'discipline', x: 220, y: 55, area: 'mat' },
  { id: 'biomat', label: 'Biomatemática', slug: 'biomatematica', type: 'discipline', x: 500, y: 65, area: 'mat' },

  // Ciência de Dados disciplines
  { id: 'aprendizado', label: 'Aprendizado de Máquina', slug: 'aprendizado-de-maquina', type: 'discipline', x: 90, y: 160, area: 'dados' },
  { id: 'redes', label: 'Redes Neurais Artificiais', slug: 'redes-neurais-artificiais', type: 'discipline', x: 30, y: 230, area: 'dados' },
  { id: 'pln', label: 'Proc. de Linguagem Natural', slug: 'processamento-de-linguagem-natural', type: 'discipline', x: 210, y: 200, area: 'dados' },
  { id: 'prob', label: 'Probabilidade e Estatística', slug: 'probabilidade-e-estatistica', type: 'discipline', x: 340, y: 200, area: 'dados' },
  { id: 'otim', label: 'Otimização', slug: 'otimizacao', type: 'discipline', x: 460, y: 200, area: 'dados' },
  { id: 'logica', label: 'Lógica Computacional', slug: 'logica-computacional', type: 'discipline', x: 30, y: 340, area: 'dados' },
  { id: 'procimg', label: 'Processamento de Imagem', slug: 'processamento-de-imagem', type: 'discipline', x: 220, y: 370, area: 'dados' },
  { id: 'mineracao', label: 'Mineração e Análise de Dados', slug: 'mineracao-e-analise-de-dados', type: 'discipline', x: 80, y: 420, area: 'dados' },
  { id: 'compevo', label: 'Computação Evolutiva', slug: 'computacao-evolutiva', type: 'discipline', x: 210, y: 440, area: 'dados' },

  // Ciência da Matéria disciplines
  { id: 'quiorg', label: 'Química Orgânica', slug: 'quimica-organica', type: 'discipline', x: 330, y: 470, area: 'materia' },
  { id: 'atomos', label: 'Teoria de Átomos e Moléculas', slug: 'teoria-de-atomos-e-moleculas', type: 'discipline', x: 460, y: 470, area: 'materia' },
  { id: 'eletroquim', label: 'Eletroquímica', slug: 'eletroquimica', type: 'discipline', x: 230, y: 520, area: 'materia' },
  { id: 'matcond', label: 'Matéria Condensada', slug: 'materia-condensada', type: 'discipline', x: 460, y: 530, area: 'materia' },
  { id: 'fundmat', label: 'Fundamentos da Matéria', slug: 'fundamentos-da-materia', type: 'discipline', x: 160, y: 580, area: 'materia' },
  { id: 'ondulat', label: 'Física Ondulatória', slug: 'fisica-ondulatoria', type: 'discipline', x: 430, y: 590, area: 'materia' },
  { id: 'cinetica', label: 'Cinética Química', slug: 'cinetica-quimica', type: 'discipline', x: 140, y: 660, area: 'materia' },
  { id: 'estat', label: 'Física Estatística', slug: 'fisica-estatistica', type: 'discipline', x: 400, y: 660, area: 'materia' },
  { id: 'mecanica', label: 'Mecânica Clássica', slug: 'mecanica-classica', type: 'discipline', x: 190, y: 720, area: 'materia' },
  { id: 'quantica', label: 'Teoria Quântica', slug: 'teoria-quantica', type: 'discipline', x: 360, y: 730, area: 'materia' },
  { id: 'termo', label: 'Termodinâmica', slug: 'termodinamica', type: 'discipline', x: 240, y: 775, area: 'materia' },
  { id: 'eletrodin', label: 'Eletrodinâmica', slug: 'eletrodinamica', type: 'discipline', x: 380, y: 775, area: 'materia' },

  // Ciência da Vida disciplines
  { id: 'genetica', label: 'Genética', slug: 'genetica', type: 'discipline', x: 610, y: 460, area: 'vida' },
  { id: 'imuno', label: 'Imunologia', slug: 'imunologia', type: 'discipline', x: 780, y: 460, area: 'vida' },
  { id: 'dna', label: 'DNA', slug: 'dna', type: 'discipline', x: 600, y: 510, area: 'vida' },
  { id: 'neuro', label: 'Neurociências', slug: 'neurociencias', type: 'discipline', x: 880, y: 480, area: 'vida' },
  { id: 'proteinas', label: 'Proteínas', slug: 'proteinas', type: 'discipline', x: 560, y: 570, area: 'vida' },
  { id: 'metabolismo', label: 'Metabolismo', slug: 'metabolismo', type: 'discipline', x: 880, y: 540, area: 'vida' },
  { id: 'evolucao', label: 'Evolução', slug: 'evolucao', type: 'discipline', x: 570, y: 640, area: 'vida' },
  { id: 'biotech', label: 'Biotecnologia', slug: 'biotecnologia', type: 'discipline', x: 870, y: 620, area: 'vida' },
  { id: 'meioamb', label: 'Meio Ambiente', slug: 'meio-ambiente', type: 'discipline', x: 570, y: 710, area: 'vida' },
  { id: 'micro', label: 'Microbiologia', slug: 'microbiologia', type: 'discipline', x: 870, y: 680, area: 'vida' },
  { id: 'biocell', label: 'Biologia Celular', slug: 'biologia-celular', type: 'discipline', x: 640, y: 760, area: 'vida' },
  { id: 'bioquim', label: 'Bioquímica', slug: 'bioquimica', type: 'discipline', x: 770, y: 760, area: 'vida' },

  // Humanidades disciplines
  { id: 'antropo', label: 'Antropoceno', slug: 'antropoceno', type: 'discipline', x: 750, y: 100, area: 'human' },
  { id: 'cimod', label: 'Ciência Moderna', slug: 'ciencia-moderna', type: 'discipline', x: 680, y: 150, area: 'human' },
  { id: 'gestao', label: 'Gestão de Projetos', slug: 'gestao-de-projetos', type: 'discipline', x: 870, y: 140, area: 'human' },
  { id: 'cisoc', label: 'Ciência e Sociedade', slug: 'ciencia-e-sociedade', type: 'discipline', x: 650, y: 230, area: 'human' },
  { id: 'empreend', label: 'Empreendedorismo', slug: 'empreendedorismo', type: 'discipline', x: 920, y: 200, area: 'human' },
  { id: 'cultnat', label: 'Cultura e Natureza', slug: 'cultura-e-natureza', type: 'discipline', x: 690, y: 310, area: 'human' },
  { id: 'cultdig', label: 'Cultura Digital', slug: 'cultura-digital', type: 'discipline', x: 910, y: 290, area: 'human' },
  { id: 'arte', label: 'Arte', slug: 'arte', type: 'discipline', x: 700, y: 380, area: 'human' },
  { id: 'etica', label: 'Ética', slug: 'etica', type: 'discipline', x: 850, y: 370, area: 'human' },
];

// Edges: center connects to all areas, disciplines connect to their areas
export const GRAPH_EDGES: GraphEdge[] = [
  // Center (Ilum) to all areas
  { from: 'ilum', to: 'mat' },
  { from: 'ilum', to: 'dados' },
  { from: 'ilum', to: 'materia' },
  { from: 'ilum', to: 'vida' },
  { from: 'ilum', to: 'human' },
  // All disciplines to their parent area
  ...GRAPH_NODES.filter(n => n.type === 'discipline' && n.area).map(n => ({
    from: n.area!,
    to: n.id,
  })),
];

export const AREA_COLORS: Record<string, { bg: string; text: string }> = {
  mat: { bg: '#3B1F6E', text: '#FFFFFF' },
  dados: { bg: '#3B1F6E', text: '#FFFFFF' },
  materia: { bg: '#3B1F6E', text: '#FFFFFF' },
  vida: { bg: '#3B1F6E', text: '#FFFFFF' },
  human: { bg: '#3B1F6E', text: '#FFFFFF' },
};

export const DISCIPLINE_COLOR = { bg: '#D94F8E', text: '#FFFFFF' };
