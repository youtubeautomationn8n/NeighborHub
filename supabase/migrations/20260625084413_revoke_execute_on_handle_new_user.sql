-- Revoke execute on handle_new_user from anon and authenticated
-- This function should only be called by the database trigger, not via REST API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;