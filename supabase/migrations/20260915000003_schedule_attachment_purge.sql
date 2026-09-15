-- Schedules the purge_orphan_attachments() function defined in
-- 20260915000002_attachments_storage.sql, which was left unscheduled there.
-- Runs daily at 04:00 UTC to clean up uploads that were never attached to a
-- sent message.
select cron.schedule('purge-orphan-attachments', '0 4 * * *',
                     $$ select public.purge_orphan_attachments() $$);
