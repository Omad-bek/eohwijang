-- Feedback form → Telegram (run once in the Supabase SQL editor; safe to re-run).
--
-- The send-feedback edge function (supabase/functions/send-feedback) is the only way in. It runs
-- with the service role and calls feedback_submit, which applies every limit and saves the message
-- in one locked transaction, before anything is sent to Telegram. Browsers can't touch either table:
-- RLS is on with no policies, and anon / authenticated have no grants on the tables or functions.
--
-- IP addresses are never stored. feedback_hits keeps only a salted SHA-256 of the IP (the salt is the
-- IP_HASH_SALT function secret) and the time, for rate limiting, and rows older than two days are
-- deleted on every submission. The feedback table holds no IP data at all.

create table if not exists public.feedback (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  category     text not null check (category in ('bug', 'word', 'idea', 'other')),
  message      text not null check (char_length(message) between 10 and 2000),
  contact      text check (contact is null or char_length(contact) <= 100),
  -- { book, unit, lang, version, ua }: where the learner was. Never the Sync ID.
  context      jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object' and octet_length(context::text) <= 1000),
  -- SHA-256 of the normalized message, to drop identical messages within 24 hours.
  message_hash text not null check (message_hash ~ '^[0-9a-f]{64}$'),
  sent         boolean not null default false,
  sent_at      timestamptz,
  -- Why delivery failed, e.g. 'telegram 429' or 'network'. Never message contents.
  send_error   text check (send_error is null or char_length(send_error) <= 100)
);
create index if not exists feedback_created_idx on public.feedback (created_at);
create index if not exists feedback_hash_idx on public.feedback (message_hash, created_at);

create table if not exists public.feedback_hits (
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  at      timestamptz not null default now()
);
create index if not exists feedback_hits_ip_idx on public.feedback_hits (ip_hash, at);
create index if not exists feedback_hits_at_idx on public.feedback_hits (at);

-- Closed to the public API: RLS with no policies, and no grants for browser roles.
alter table public.feedback enable row level security;
alter table public.feedback_hits enable row level security;
revoke all on public.feedback, public.feedback_hits from public, anon, authenticated;
do $$
declare p record;
begin
for p in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('feedback', 'feedback_hits') loop
execute format('drop policy %I on public.%I', p.policyname, p.tablename);
end loop;
end $$;

-- Limits, duplicate check and save in one step. Returns { status: 'ok', id } | { status: 'duplicate' } | { status: 'limited' }.
--   per IP:  3 per 10 minutes, 10 per 24 hours (attempts that passed the captcha, duplicates included)
--   overall: 100 saved messages per 24 hours
create or replace function public.feedback_submit(
  p_ip_hash text, p_message_hash text, p_category text, p_message text, p_contact text, p_context jsonb
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare v_id bigint;
begin
  -- One submission at a time: parallel requests wait here, so none can slip past the counts below.
  perform pg_advisory_xact_lock(hashtext('public.feedback_submit'));

  delete from public.feedback_hits where at < now() - interval '2 days';

  if (select count(*) from public.feedback_hits where ip_hash = p_ip_hash and at > now() - interval '10 minutes') >= 3
     or (select count(*) from public.feedback_hits where ip_hash = p_ip_hash and at > now() - interval '24 hours') >= 10
     or (select count(*) from public.feedback where created_at > now() - interval '24 hours') >= 100 then
    return jsonb_build_object('status', 'limited');
  end if;

  insert into public.feedback_hits (ip_hash) values (p_ip_hash);

  if exists (select 1 from public.feedback where message_hash = p_message_hash and created_at > now() - interval '24 hours') then
    return jsonb_build_object('status', 'duplicate');
  end if;

  insert into public.feedback (category, message, contact, context, message_hash)
  values (p_category, p_message, nullif(p_contact, ''), coalesce(p_context, '{}'::jsonb), p_message_hash)
  returning id into v_id;
  return jsonb_build_object('status', 'ok', 'id', v_id);
end;
$$;

-- Record whether the Telegram message went out. Failed rows stay in the table to read later.
create or replace function public.feedback_mark(p_id bigint, p_sent boolean, p_error text)
returns void
language sql security definer set search_path = public
as $$
  update public.feedback
     set sent = p_sent,
         sent_at = case when p_sent then now() else null end,
         send_error = case when p_sent then null else left(p_error, 100) end
   where id = p_id;
$$;

revoke all on function public.feedback_submit(text, text, text, text, text, jsonb), public.feedback_mark(bigint, boolean, text) from public, anon, authenticated;
grant execute on function public.feedback_submit(text, text, text, text, text, jsonb), public.feedback_mark(bigint, boolean, text) to service_role;

-- Check (run separately): RLS on for both tables, and no browser role can run the functions.
--   select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname in ('feedback', 'feedback_hits');
--   select routine_name, grantee from information_schema.routine_privileges where routine_schema = 'public' and routine_name like 'feedback%' order by 1, 2;
-- Messages that did not reach Telegram:
--   select id, created_at, category, message, contact, send_error from public.feedback where not sent order by id desc;
