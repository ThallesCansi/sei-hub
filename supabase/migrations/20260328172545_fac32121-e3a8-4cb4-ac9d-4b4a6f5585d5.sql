
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IS NULL OR NOT NEW.email LIKE '%@ilum.cnpem.br' THEN
    RAISE EXCEPTION 'Apenas e-mails com domínio @ilum.cnpem.br são permitidos.';
  END IF;
  RETURN NEW;
END;
$$;
