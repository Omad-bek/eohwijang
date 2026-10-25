-- Every shared word in one response (run once in the Supabase SQL editor; safe to re-run).
--
-- PostgREST cuts any set-returning RPC at its max-rows setting (1000 on Supabase), so
-- get_global_words() silently dropped rows once global_words grew past 1000. This function
-- returns a single JSON value instead, which max-rows does not apply to, together with the
-- row count so the app can check that nothing went missing. The order matches
-- get_global_words(), so stage boundaries do not move.
--
-- The app calls this first and falls back to paging through get_global_words() while this
-- function does not exist yet. Run harden.sql after this file.

create or replace function public.get_global_words_all()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'total', count(*),
    'words', coalesce(
      jsonb_agg(
        jsonb_build_object('book', g.book, 'unit', g.unit, 'ko', g.ko, 'uz', g.uz, 'ru', g.ru, 'en', g.en, 'deleted', g.deleted, 'example', g.example)
        order by g.updated_at, g.book, g.unit
      ),
      '[]'::jsonb
    )
  )
  from public.global_words g;
$$;

revoke all on function public.get_global_words_all() from public, anon, authenticated;
grant execute on function public.get_global_words_all() to anon, authenticated;

-- Check (should print the same number twice):
--   select count(*), jsonb_array_length(public.get_global_words_all()->'words') from public.global_words;
