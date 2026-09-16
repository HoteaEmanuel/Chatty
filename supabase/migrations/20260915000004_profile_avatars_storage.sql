-- Storage bucket backing profiles.avatar_url.
--
-- Path convention: <user_id> (no subfolder, no extension) - one object per
-- user, overwritten via upsert on every re-pick. Unlike `attachments`, this
-- bucket is public: the client reads `avatar_url` straight into an <Image>
-- with no signed-URL step, so the object must be servable without auth.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profiles',
  'profiles',
  true,                 -- public: served straight from getPublicUrl()
  10485760,             -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object name is the user's own uid (see buildAttachmentPath-style convention
-- in useAttachmentUpload, but flat here - no folder segments to check via
-- storage.foldername()), so policies compare `name` directly.

create policy profiles_avatar_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profiles'
    and name = (select auth.uid())::text
  );

create policy profiles_avatar_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profiles'
    and name = (select auth.uid())::text
  );

-- Needed alongside insert: `upsert: true` on the client can resolve to an
-- UPDATE when the object already exists, which insert alone won't cover.
create policy profiles_avatar_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profiles'
    and name = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profiles'
    and name = (select auth.uid())::text
  );

create policy profiles_avatar_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profiles'
    and name = (select auth.uid())::text
  );
