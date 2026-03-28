
-- Enums
CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE public.post_type AS ENUM ('informativo', 'evento', 'material', 'trabalho', 'estagio');
CREATE TYPE public.post_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
CREATE TYPE public.revision_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.report_reason AS ENUM ('spam', 'assedio', 'direitos_autorais', 'desinformacao', 'outros');
CREATE TYPE public.report_status AS ENUM ('open', 'in_review', 'resolved');
CREATE TYPE public.report_target_type AS ENUM ('post', 'comment');

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1) profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  turma_ano INT NOT NULL CHECK (turma_ano IN (1, 2, 3)),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  admin_label TEXT,
  status profile_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public profiles view (no email)
CREATE VIEW public.public_profiles WITH (security_invoker=on) AS
  SELECT id, full_name, matricula, turma_ano, is_admin
  FROM public.profiles;

-- 2) academic_terms
CREATE TABLE public.academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_terms ENABLE ROW LEVEL SECURITY;

-- 3) disciplines
CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  year INT NOT NULL CHECK (year IN (1, 2, 3)),
  semester INT NOT NULL CHECK (semester IN (1, 2)),
  area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- 4) posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type post_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  turma_target INT CHECK (turma_target IS NULL OR turma_target IN (1, 2, 3)),
  discipline_id UUID REFERENCES public.disciplines(id),
  academic_term_id UUID REFERENCES public.academic_terms(id),
  status post_status NOT NULL DEFAULT 'pending',
  pinned BOOLEAN NOT NULL DEFAULT false,
  comments_locked BOOLEAN NOT NULL DEFAULT false,
  event_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  last_approved_revision_id UUID,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) post_revisions
CREATE TABLE public.post_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES public.profiles(id),
  title_snapshot TEXT NOT NULL,
  body_snapshot TEXT NOT NULL,
  status revision_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts
  ADD CONSTRAINT fk_last_approved_revision
  FOREIGN KEY (last_approved_revision_id) REFERENCES public.post_revisions(id);

-- 6) attachments
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- 7) comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8) tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.post_tags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- 9) reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type report_target_type NOT NULL,
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  reason report_reason NOT NULL,
  details TEXT,
  status report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id)
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- Security definer for profile status
CREATE OR REPLACE FUNCTION public.get_profile_status(_user_id UUID)
RETURNS profile_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.profiles WHERE id = _user_id
$$;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- academic_terms
CREATE POLICY "Anyone can view terms" ON public.academic_terms
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert terms" ON public.academic_terms
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update terms" ON public.academic_terms
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete terms" ON public.academic_terms
  FOR DELETE USING (public.is_admin(auth.uid()));

-- disciplines
CREATE POLICY "Anyone can view disciplines" ON public.disciplines
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert disciplines" ON public.disciplines
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update disciplines" ON public.disciplines
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete disciplines" ON public.disciplines
  FOR DELETE USING (public.is_admin(auth.uid()));

-- posts
CREATE POLICY "Public can view approved posts" ON public.posts
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can view own posts" ON public.posts
  FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can view all posts" ON public.posts
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Approved users can create posts" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND public.get_profile_status(auth.uid()) = 'approved'
  );
CREATE POLICY "Authors can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can update any post" ON public.posts
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Authors can delete own pending posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id AND status = 'pending');
CREATE POLICY "Admins can delete any post" ON public.posts
  FOR DELETE USING (public.is_admin(auth.uid()));

-- post_revisions
CREATE POLICY "Authors can view own revisions" ON public.post_revisions
  FOR SELECT USING (auth.uid() = editor_id);
CREATE POLICY "Admins can view all revisions" ON public.post_revisions
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Authors create revisions" ON public.post_revisions
  FOR INSERT WITH CHECK (auth.uid() = editor_id);
CREATE POLICY "Admins update revisions" ON public.post_revisions
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- attachments
CREATE POLICY "Public can view attachments of approved posts" ON public.attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.status = 'approved')
  );
CREATE POLICY "Authors can view own attachments" ON public.attachments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
  );
CREATE POLICY "Admins can view all attachments" ON public.attachments
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Authors can insert attachments" ON public.attachments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
  );
CREATE POLICY "Authors can delete own attachments" ON public.attachments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
  );

-- comments
CREATE POLICY "Public can view visible comments on approved posts" ON public.comments
  FOR SELECT USING (
    hidden = false
    AND EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.status = 'approved')
  );
CREATE POLICY "Authors can view own comments" ON public.comments
  FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can view all comments" ON public.comments
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Approved users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND public.get_profile_status(auth.uid()) = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_id
      AND posts.status = 'approved'
      AND posts.comments_locked = false
    )
  );
CREATE POLICY "Authors can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can update any comment" ON public.comments
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- tags
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON public.tags
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update tags" ON public.tags
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete tags" ON public.tags
  FOR DELETE USING (public.is_admin(auth.uid()));

-- post_tags
CREATE POLICY "Anyone can view post_tags" ON public.post_tags
  FOR SELECT USING (true);
CREATE POLICY "Authors can manage own post tags" ON public.post_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
  );
CREATE POLICY "Authors can delete own post tags" ON public.post_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.posts WHERE posts.id = post_id AND posts.author_id = auth.uid())
  );
CREATE POLICY "Admins can insert post_tags" ON public.post_tags
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete post_tags" ON public.post_tags
  FOR DELETE USING (public.is_admin(auth.uid()));

-- reports
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Storage bucket for attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  false,
  20971520,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
);

-- Storage policies
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments'
    AND auth.role() = 'authenticated'
  );
CREATE POLICY "View attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.attachments a
        JOIN public.posts p ON p.id = a.post_id
        WHERE a.storage_path = name AND p.status = 'approved'
      )
    )
  );
CREATE POLICY "Authors can delete own storage attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Indexes
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_type ON public.posts(type);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_discipline ON public.posts(discipline_id);
CREATE INDEX idx_posts_term ON public.posts(academic_term_id);
CREATE INDEX idx_posts_event_date ON public.posts(event_date);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_attachments_post ON public.attachments(post_id);
CREATE INDEX idx_revisions_post ON public.post_revisions(post_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, matricula, turma_ano, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'matricula', ''),
    COALESCE((NEW.raw_user_meta_data->>'turma_ano')::int, 1),
    'approved'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
