import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../lib/env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (err) {
    if (
      isErrorWithCode(err) &&
      err.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      throw new GoogleSignInCancelledError();
    }
    throw err;
  }

  if (!isSuccessResponse(response)) {
    throw new GoogleSignInCancelledError();
  }

  // idToken is nullable on the sign-in response itself; getTokens() always
  // returns one once a session exists.
  const idToken =
    response.data.idToken ?? (await GoogleSignin.getTokens()).idToken;

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;

  return data.session;
}
