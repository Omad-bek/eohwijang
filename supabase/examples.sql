-- Example sentences for shared vocabulary (run once in the Supabase SQL editor; safe to re-run).
-- Adds global_words.example, returns it from get_global_words, and lets admin_put_words write it.
-- A write without an "example" key keeps the stored one, so single-word edits in the admin panel never erase it.

alter table public.global_words add column if not exists example jsonb
  check (example is null or (jsonb_typeof(example) = 'object' and octet_length(example::text) <= 2000));

-- The return type changes, so the function is recreated rather than replaced.
drop function if exists public.get_global_words();
create function public.get_global_words()
returns table (book text, unit text, ko text, uz text, ru text, en text, deleted boolean, example jsonb)
language sql stable security definer set search_path = public
as $$
  select g.book, g.unit, g.ko, g.uz, g.ru, g.en, g.deleted, g.example from public.global_words g order by g.updated_at, g.book, g.unit;
$$;

-- p_words: [{ "book", "unit", "ko", "uz", "ru", "en", "example"?, "deleted"?, "revert"? }]
create or replace function public.admin_put_words(p_token text, p_words jsonb)
returns integer
language plpgsql security definer set search_path = public
as $$
declare w jsonb; ex jsonb; n integer := 0;
begin
  if not public.is_admin(p_token) then
    raise exception 'forbidden';
  end if;
  if jsonb_typeof(p_words) <> 'array' or jsonb_array_length(p_words) > 2000 then
    raise exception 'bad payload';
  end if;
  for w in select * from jsonb_array_elements(p_words) loop
    if coalesce((w->>'revert')::boolean, false) then
      delete from public.global_words where book = w->>'book' and unit = w->>'unit' and ko = w->>'ko';
    else
      ex := nullif(nullif(w->'example', 'null'::jsonb), '{}'::jsonb);
      insert into public.global_words as g (book, unit, ko, uz, ru, en, example, deleted, updated_at)
      values (trim(w->>'book'), trim(w->>'unit'), trim(w->>'ko'), coalesce(trim(w->>'uz'), ''), coalesce(trim(w->>'ru'), ''),
              coalesce(trim(w->>'en'), ''), ex, coalesce((w->>'deleted')::boolean, false), now())
      on conflict (book, unit, ko) do update
        set uz = excluded.uz, ru = excluded.ru, en = excluded.en, deleted = excluded.deleted, updated_at = now(),
            example = case when w ? 'example' then excluded.example else g.example end;
    end if;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.get_global_words(), public.admin_put_words(text, jsonb) from public, anon, authenticated;
grant execute on function public.get_global_words(), public.admin_put_words(text, jsonb) to anon, authenticated;
