-- Chat schema: profiles, conversations, messages, attachments.
--
-- Note: `auth.users` is created and owned by Supabase Auth. We never define or
-- alter it. `public.profiles` mirrors the parts of it the app needs to render,
-- and is filled in by a trigger when a user first signs in.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Google returns the display name under `name` and the picture under `picture`;
-- other providers use `full_name` / `avatar_url`. Accept either.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  title           text not null default 'New chat',
  model           text not null default 'claude-opus-5',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  archived_at     timestamptz
);

-- Target for the composite foreign keys below: makes it impossible for a child
-- row to claim a user_id that does not own its conversation.
create unique index conversations_id_user_key
  on public.conversations (id, user_id);

-- Drives the conversation list: most recently active first, archived hidden.
create index conversations_user_recent_idx
  on public.conversations (user_id, last_message_at desc)
  where archived_at is null;

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

create type public.message_role   as enum ('user', 'assistant');
create type public.message_status as enum ('streaming', 'complete', 'error', 'cancelled');

-- `created_at` cannot order messages: now() is transaction time, so a user
-- message and the assistant placeholder inserted in the same transaction get
-- byte-identical timestamps and the reply can sort above the question. A
-- sequence gives a total order that is always correct, and doubles as the
-- pagination cursor.
create sequence public.message_seq;

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id         uuid not null,
  seq             bigint not null default nextval('public.message_seq'),
  role            public.message_role   not null,
  content         text not null default '',
  status          public.message_status not null default 'complete',
  error           text,
  model           text,
  input_tokens    integer,
  output_tokens   integer,
  stop_reason     text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz,
  foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade
);

create unique index messages_conv_seq_key
  on public.messages (conversation_id, seq);

-- Reading a conversation: newest first, paginated on seq.
create index messages_conv_page_idx
  on public.messages (conversation_id, seq desc);

-- Title the conversation from its first user message, and keep the list sorted.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations c
     set title = case
                   when c.title = 'New chat' and new.role = 'user'
                   then left(trim(regexp_replace(new.content, '\s+', ' ', 'g')), 80)
                   else c.title
                 end,
         last_message_at = now(),
         updated_at      = now()
   where c.id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------------------------------------------------------------------------
-- attachments
--
-- Files live in Supabase Storage; this table is the metadata index over them.
-- We store bucket + path, never a URL: the bucket is private, so URLs must be
-- signed and signed URLs expire. The client calls createSignedUrl() at render
-- time. Storing a path also survives changing bucket, domain, or CDN.
--
-- `message_id` is nullable so a file can be uploaded while the user is still
-- typing; the send call links it to the message it was attached to.
-- ---------------------------------------------------------------------------

create type public.attachment_kind as enum ('image', 'document');

create table public.attachments (
  id              uuid primary key default gen_random_uuid(),
  message_id      uuid references public.messages (id) on delete cascade,
  conversation_id uuid not null,
  user_id         uuid not null,
  bucket_id       text not null default 'attachments',
  storage_path    text not null unique,
  kind            public.attachment_kind not null,
  mime_type       text not null,
  size_bytes      integer not null check (size_bytes > 0),
  file_name       text,
  width           integer,
  height          integer,
  page_count      integer,
  created_at      timestamptz not null default now(),
  foreign key (conversation_id, user_id)
    references public.conversations (id, user_id) on delete cascade
);

-- Supports the embedded read: messages.select('*, attachments(*)')
create index attachments_message_idx
  on public.attachments (message_id);

-- Uploads that were never sent, for periodic cleanup.
create index attachments_orphan_idx
  on public.attachments (created_at)
  where message_id is null;

-- ---------------------------------------------------------------------------
-- Row level security
--
-- `(select auth.uid())` rather than a bare `auth.uid()`: the subquery form is
-- hoisted into an InitPlan and evaluated once per statement instead of once per
-- row. `to authenticated` lets anonymous requests short-circuit entirely.
-- ---------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.attachments   enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy conversations_all_own on public.conversations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy messages_all_own on public.messages
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy attachments_all_own on public.attachments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
