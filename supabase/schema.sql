-- Anonymous Cloud Sync for 어휘장 (Eohwijang).
-- Run once in the Supabase SQL editor. Each vault is keyed by a random 100-bit Sync ID;
-- no accounts, emails or personal data are stored. The table itself is closed to the
-- public API: browsers can only call the three functions below, and each needs the exact ID,
-- so vaults cannot be listed or browsed.

create table if not exists public.sync_vaults (
  id         text primary key check (id ~ '^[0-9A-HJKMNP-TV-Z]{20}$'),
  data       jsonb not null,
  rev        integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.sync_vaults enable row level security;
-- No policies on purpose: direct table access through the API is denied.
revoke all on public.sync_vaults from anon, authenticated;

create or replace function public.pull_vault(p_id text)
returns table (data jsonb, rev integer)
language sql stable security definer set search_path = public
as $$
  select v.data, v.rev from public.sync_vaults v where v.id = p_id;
$$;

-- Optimistic write: succeeds only when the caller saw the latest revision (0 = create).
-- Returns the new revision, or null when another device wrote first (pull, merge, retry).
create or replace function public.push_vault(p_id text, p_data jsonb, p_rev integer)
returns integer
language plpgsql security definer set search_path = public
as $$
declare new_rev integer;
begin
  if pg_column_size(p_data) > 2000000 then
    raise exception 'vault too large';
  end if;
  if p_rev = 0 then
    insert into public.sync_vaults (id, data) values (p_id, p_data)
    on conflict (id) do nothing
    returning rev into new_rev;
  else
    update public.sync_vaults
       set data = p_data, rev = public.sync_vaults.rev + 1, updated_at = now()
     where id = p_id and public.sync_vaults.rev = p_rev
    returning public.sync_vaults.rev into new_rev;
  end if;
  return new_rev;
end;
$$;

create or replace function public.delete_vault(p_id text)
returns void
language sql security definer set search_path = public
as $$
  delete from public.sync_vaults where id = p_id;
$$;

revoke all on function public.pull_vault(text), public.push_vault(text, jsonb, integer), public.delete_vault(text) from public;
grant execute on function public.pull_vault(text), public.push_vault(text, jsonb, integer), public.delete_vault(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Global vocabulary updates (admin only), shown to every learner.
-- Rows override bundled words with the same (book, unit, ko), add new ones (and new
-- books such as 1B), or hide a bundled word with deleted = true. Anyone may read;
-- only a caller holding the admin token may write. The token is never stored, only its
-- SHA-256, so it lives with the author and not in the public app bundle.
--
-- Set or rotate the token (use 32+ random characters):
--   delete from public.admin_secrets;
--   insert into public.admin_secrets (token_hash)
--     values (encode(extensions.digest('YOUR-LONG-RANDOM-TOKEN', 'sha256'), 'hex'));

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_secrets (
  token_hash text primary key
);
alter table public.admin_secrets enable row level security;
revoke all on public.admin_secrets from anon, authenticated;

create table if not exists public.global_words (
  book       text not null check (char_length(book) between 1 and 24 and position('|' in book) = 0),
  unit       text not null check (char_length(unit) between 1 and 40 and position('|' in unit) = 0),
  ko         text not null check (char_length(ko) between 1 and 80),
  uz         text not null default '',
  ru         text not null default '',
  en         text not null default '',
  -- { ko, uz, ru, en }: a sentence using the word, at the book's grammar level.
  example    jsonb check (example is null or (jsonb_typeof(example) = 'object' and octet_length(example::text) <= 2000)),
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (book, unit, ko)
);
alter table public.global_words enable row level security;
revoke all on public.global_words from anon, authenticated;

create or replace function public.get_global_words()
returns table (book text, unit text, ko text, uz text, ru text, en text, deleted boolean, example jsonb)
language sql stable security definer set search_path = public
as $$
  select g.book, g.unit, g.ko, g.uz, g.ru, g.en, g.deleted, g.example from public.global_words g order by g.updated_at, g.book, g.unit;
$$;

create or replace function public.is_admin(p_token text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if exists (select 1 from public.admin_secrets s where s.token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')) then
    return true;
  end if;
  perform pg_sleep(0.7); -- slows down guessing
  return false;
end;
$$;

create or replace function public.admin_check(p_token text)
returns boolean
language sql security definer set search_path = public
as $$ select public.is_admin(p_token); $$;

-- p_words: [{ "book", "unit", "ko", "uz", "ru", "en", "example"?, "deleted"?, "revert"? }]
-- revert = true removes the global row, restoring the bundled word (or dropping an added one).
-- A write without an "example" key keeps the stored example.
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

revoke all on function public.is_admin(text) from public, anon, authenticated;
revoke all on function public.get_global_words(), public.admin_check(text), public.admin_put_words(text, jsonb) from public;
grant execute on function public.get_global_words(), public.admin_check(text), public.admin_put_words(text, jsonb) to anon, authenticated;

-- The whole list as one JSON value: set-returning RPCs are cut at PostgREST's max-rows (1000 on
-- Supabase), a single value is not. The app prefers this one (see global-words-json.sql).
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
