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
