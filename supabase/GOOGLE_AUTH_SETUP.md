# Google Sign-In setup

## Status

| Step | State |
|---|---|
| Android OAuth client | ✅ Already existed (Firebase auto-creates one per registered SHA-1) |
| iOS app + OAuth client | ✅ Created via the Firebase Management API |
| `android/app/google-services.json` | ✅ Refreshed |
| `ios/ChatApp/GoogleService-Info.plist` | ✅ Added |
| `ios/ChatApp/Info.plist` URL scheme | ✅ Added |
| `src/lib/env.ts` client IDs | ✅ Filled in |
| Supabase provider `enabled` / `client_id` / `skip_nonce_check` | ✅ Pushed via `supabase config push` |
| Supabase **Authorized Client IDs** | ❌ Still manual — see below |

## Values in use

| | |
|---|---|
| GCP / Firebase project | `chatty-c09ba` (project number `991714156421`) |
| Package / bundle id | `com.hotea.chatty` (both platforms) |
| Web client (`GOOGLE_WEB_CLIENT_ID`) | `991714156421-0skdc61biqlhb1fnokvs999crcfkj54p.apps.googleusercontent.com` |
| Android client | `991714156421-mg380otqt97otcrccjslh6jisc8qo1pu.apps.googleusercontent.com` |
| iOS client (`GOOGLE_IOS_CLIENT_ID`) | `991714156421-8u7bifao028d2ou41dqmjrpcdhom523t.apps.googleusercontent.com` |

The Cloud Console "Create OAuth client ID" flow for Android will fail with
*"package name and fingerprint are already in use"* if you ever try it again —
that's expected. Firebase already owns that client the moment a SHA-1 is
registered on the Android app; it just isn't listed in that Console page.
Fetch it via `google-services.json` (or the Firebase Management API) instead
of trying to create it there.

## What's left: Authorized Client IDs

Supabase → Authentication → Providers → Google → **Authorized Client IDs**
must include the iOS client id above (comma-separated if you add more later).
Without it, iOS sign-in fails with `Invalid audience` — Android's ID token
has `aud` = the web client (already configured as `client_id`), but iOS's has
`aud` = the iOS client, which nothing currently accepts.

This field has no `config.toml` key — confirmed against Supabase's own
`config.schema.json`, it's Management-API-only (`external_google_additional_client_ids`).
Two ways to finish it:

1. **Dashboard** (simplest): paste the iOS client id into that field, save.
2. **Hand me a Supabase Personal Access Token** and I'll call
   `PATCH /v1/projects/rnkuhxqjpezfykjfiehz/config/auth` directly.

## Release builds

The Android OAuth client above is tied to the **debug** SHA-1
(`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`). Before a
release build, get the release SHA-1 (`keytool -list -v -keystore
<release>.keystore`) and register it the same way — add it to the Firebase
Android app's SHA fingerprints (Firebase console → Project settings → your
app), which will auto-create a second Android OAuth client the same way the
debug one appeared.
