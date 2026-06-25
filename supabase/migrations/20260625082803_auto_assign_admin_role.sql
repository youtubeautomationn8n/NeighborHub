-- Auto-assign admin role to a specific email address
-- When someone signs up with the admin email, they automatically get the 'admin' role
-- and a profile is auto-created if it doesn't exist

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_email text := 'neighborhub.admin@gmail.com';
  user_role text := 'user';
BEGIN
  -- Check if the new user's email matches the admin email
  IF NEW.email = admin_email THEN
    user_role := 'admin';
  END IF;

  -- Insert profile if it doesn't already exist
  INSERT INTO public.profiles (id, name, role, neighborhood_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role,
    COALESCE((NEW.raw_user_meta_data->>'neighborhood_id')::uuid, NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET role = CASE 
    WHEN profiles.role = 'admin' THEN 'admin'  -- don't downgrade existing admins
    ELSE user_role
  END;

  RETURN NEW;
END;
$$;

-- Drop old trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also update existing profiles: if someone with the admin email already exists, make them admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'neighborhub.admin@gmail.com'
);
