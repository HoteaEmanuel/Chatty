import { supabase } from '../lib/supabase';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

// `full_name` lands in raw_user_meta_data, which the public.handle_new_user
// trigger already copies into profiles.full_name (same field Google sign-in
// populates), so no schema change is needed to pick this up.
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data.session;
}
