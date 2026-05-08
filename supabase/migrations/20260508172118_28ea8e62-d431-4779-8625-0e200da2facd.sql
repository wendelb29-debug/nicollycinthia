-- Configurable admin master email (avoids hardcoding everywhere)
CREATE OR REPLACE FUNCTION public.admin_master_email()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT 'admin@nicollycinthia.com'::text;
$$;

-- Replace handle_new_user to auto-promote the master admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean := lower(NEW.email) = lower(public.admin_master_email());
BEGIN
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',
             CASE WHEN v_is_admin THEN 'Administradora Master'
                  ELSE split_part(NEW.email, '@', 1) END),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );

  IF v_is_admin THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client')
      ON CONFLICT DO NOTHING;
    INSERT INTO public.clients (user_id, status) VALUES (NEW.id, 'pending')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- If the admin email already signed up, promote it now (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
WHERE lower(u.email) = lower(public.admin_master_email())
ON CONFLICT DO NOTHING;