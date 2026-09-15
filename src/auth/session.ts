import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';

export async function signOut() {
  await supabase.auth.signOut();
  try {
    // No-op if the session was never a Google sign-in.
    await GoogleSignin.signOut();
  } catch {}
}
