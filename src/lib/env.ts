// Project URL and publishable key are not secrets — they're meant to ship in
// the client. Every request they make is still enforced by the RLS policies
// in supabase/migrations/. The real secret (ANTHROPIC_API_KEY) only ever
// lives in the Edge Function, never here.
export const SUPABASE_URL = 'https://rnkuhxqjpezfykjfiehz.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_xhK8_1k9G4ldBMfXtyo1cA_1k119r94';
export const GOOGLE_WEB_CLIENT_ID =
  '991714156421-0skdc61biqlhb1fnokvs999crcfkj54p.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID =
  '991714156421-8u7bifao028d2ou41dqmjrpcdhom523t.apps.googleusercontent.com';
