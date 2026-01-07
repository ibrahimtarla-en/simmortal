import {
  getAuthorisationURLWithQueryParamsAndSetState,
  signOut,
} from 'supertokens-web-js/recipe/thirdparty';
import { getDomain } from '@/services/env';

export async function loginWithGoogle() {
  const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
    thirdPartyId: 'google',
    frontendRedirectURI: `${getDomain()}/auth/callback/google`,
  });

  window.location.assign(authUrl);
}

export async function logout() {
  await signOut();
  window.location.assign('/');
}
