CREATE OR REPLACE FUNCTION public.admin_master_email()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT 'wendelb29@gmail.com'::text;
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) = 'wendelb29@gmail.com'
ON CONFLICT DO NOTHING;