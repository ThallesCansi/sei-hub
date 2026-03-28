
-- Update handle_new_user to extract matricula from email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, matricula, turma_ano, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (SELECT (regexp_matches(NEW.email, '(\d+)@'))[1]),
      COALESCE(NEW.raw_user_meta_data->>'matricula', '')
    ),
    COALESCE((NEW.raw_user_meta_data->>'turma_ano')::int, 2024),
    'approved'
  );
  RETURN NEW;
END;
$function$;

-- Make attachments bucket public so files can be viewed
UPDATE storage.buckets SET public = true WHERE id = 'attachments';
