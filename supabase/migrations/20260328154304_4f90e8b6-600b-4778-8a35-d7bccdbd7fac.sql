-- Graph areas table
CREATE TABLE public.graph_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color_bg text NOT NULL DEFAULT '#3B1F6E',
  color_text text NOT NULL DEFAULT '#FFFFFF',
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.graph_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view graph_areas" ON public.graph_areas FOR SELECT USING (true);
CREATE POLICY "Admins can insert graph_areas" ON public.graph_areas FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update graph_areas" ON public.graph_areas FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete graph_areas" ON public.graph_areas FOR DELETE USING (is_admin(auth.uid()));

-- Add graph positioning to disciplines
ALTER TABLE public.disciplines
  ADD COLUMN IF NOT EXISTS graph_area_id uuid REFERENCES public.graph_areas(id) ON DELETE SET NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS graph_x float DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS graph_y float DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS slug text DEFAULT NULL;

-- Insert the existing areas
INSERT INTO public.graph_areas (id, name, slug, color_bg, color_text, position_x, position_y) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Linguagem Matemática', 'linguagem-matematica', '#3B1F6E', '#FFFFFF', 350, 80),
  ('a1000000-0000-0000-0000-000000000002', 'Ciência de Dados', 'ciencia-de-dados', '#3B1F6E', '#FFFFFF', 150, 300),
  ('a1000000-0000-0000-0000-000000000003', 'Ciência da Matéria', 'ciencia-da-materia', '#3B1F6E', '#FFFFFF', 300, 620),
  ('a1000000-0000-0000-0000-000000000004', 'Ciência da Vida', 'ciencia-da-vida', '#3B1F6E', '#FFFFFF', 700, 560),
  ('a1000000-0000-0000-0000-000000000005', 'Humanidades', 'humanidades', '#3B1F6E', '#FFFFFF', 780, 220);