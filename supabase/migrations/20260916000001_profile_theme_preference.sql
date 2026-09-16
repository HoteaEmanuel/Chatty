-- Persists the user's explicit light/dark override so it survives a
-- reinstall or a new device. `null` means "follow system", same as before
-- this column existed.

alter table public.profiles
  add column theme_preference text check (theme_preference in ('light', 'dark'));
