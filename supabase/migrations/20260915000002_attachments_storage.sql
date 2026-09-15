-- Storage bucket backing public.attachments.
--
-- Path convention: <user_id>/<conversation_id>/<uuid>.<ext>
-- The first path segment is the owner's uid, which is what the policies below
-- check -- so a user can only read or write inside their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,                -- private: reads go through signed URLs
  10485760,             -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do nothing;

-- file_size_limit and allowed_mime_types above are enforced server-side, so a
-- tampered client cannot fill the bucket with video.

create policy attachments_read_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy attachments_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy attachments_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy attachments_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Files uploaded but never attached to a sent message. Schedule with pg_cron
-- once the app is in production:
--   select cron.schedule('purge-orphan-attachments', '0 4 * * *',
--                        $$ select public.purge_orphan_attachments() $$);
create or replace function public.purge_orphan_attachments(older_than interval default '24 hours')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  with doomed as (
    delete from public.attachments
     where message_id is null
       and created_at < now() - older_than
    returning bucket_id, storage_path
  )
  delete from storage.objects o
   using doomed d
   where o.bucket_id = d.bucket_id
     and o.name = d.storage_path;

  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke execute on function public.purge_orphan_attachments(interval) from anon, authenticated;
