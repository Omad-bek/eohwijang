-- Re-apply the intended access rules for the tables and functions in schema.sql.
-- Safe to run any number of times. Copy this whole file into the Supabase SQL editor,
-- after global-words-json.sql (it grants get_global_words_all, which that file creates).
--
-- The model: the browser holds only the public anon key and never touches a table. RLS is on
-- with no policies (deny all), table grants are revoked, and the only way in is a handful of
-- SECURITY DEFINER functions that each enforce one rule:
--   * a sync vault is read, written or erased only by a caller who sends its exact 100-bit ID
--     (there is no function that lists vaults, so IDs cannot be discovered);
--   * shared vocabulary is readable by anyone and writable only with the admin token, whose
--     SHA-256 is checked inside admin_put_words.
-- There are no Supabase Auth users, so auth.uid()-style policies would have nothing to match;
-- the ID itself is the credential, checked in the function's WHERE clause.

-- 1. Tables: RLS on, no direct access through the API.
alter table public.sync_vaults enable row level security;
alter table public.global_words enable row level security;
alter table public.admin_secrets enable row level security;
revoke all on public.sync_vaults, public.global_words, public.admin_secrets from public, anon, authenticated;

-- 2. These tables are meant to have no policies. Drop any added in the dashboard.
do $$
declare p record;
begin
for p in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('sync_vaults', 'global_words', 'admin_secrets') loop
execute format('drop policy %I on public.%I', p.policyname, p.tablename);
end loop;
end $$;

-- 3. Functions: start from nothing, then allow only what the app calls.
revoke all on function public.pull_vault(text), public.push_vault(text, jsonb, integer), public.delete_vault(text), public.get_global_words(), public.get_global_words_all(), public.is_admin(text), public.admin_check(text), public.admin_put_words(text, jsonb) from public, anon, authenticated;

-- Vocabulary: anyone can read, only the admin token can write (checked inside admin_put_words).
-- Sync vaults: only whoever holds the vault ID can read or write it.
-- is_admin is not granted: it is only called inside other functions.
grant execute on function public.pull_vault(text), public.push_vault(text, jsonb, integer), public.delete_vault(text), public.get_global_words(), public.get_global_words_all(), public.admin_check(text), public.admin_put_words(text, jsonb) to anon, authenticated;

-- 4. Future objects: Supabase grants new public tables and functions to anon by default. Turn
-- that off, so a table or function added later stays closed until it is granted on purpose.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- 5. Check the result (run these separately after the part above succeeds).
-- RLS should be true for all three tables:
--   select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname in ('sync_vaults', 'global_words', 'admin_secrets');
-- No rows expected:
--   select tablename, policyname from pg_policies where schemaname = 'public';
--   select grantee, table_name, privilege_type from information_schema.role_table_grants where table_schema = 'public' and grantee in ('anon', 'authenticated', 'PUBLIC');
-- Only the seven granted functions expected:
--   select routine_name, grantee from information_schema.routine_privileges where routine_schema = 'public' and grantee in ('anon', 'authenticated', 'PUBLIC') order by 1, 2;
