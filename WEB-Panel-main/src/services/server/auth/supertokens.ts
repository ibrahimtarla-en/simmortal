import { getAuthorisationURLWithQueryParamsAndSetState } from 'supertokens-web-js/recipe/thirdparty';
import { getDomain } from '@/services/env';
import {
  signOut,
  signIn,
  signUp,
  sendPasswordResetEmail,
} from 'supertokens-web-js/recipe/emailpassword';
import { sendVerificationEmail } from 'supertokens-web-js/recipe/emailverification';

export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe: boolean = false,
) {
  const result = await signIn({
    formFields: [
      {
        id: 'email',
        value: email,
      },
      {
        id: 'password',
        value: password,
      },
    ],
  });
  if (result.status === 'OK') {
    // Logged in successfully
    if (!rememberMe) {
      // Move tokens to sessionStorage to ensure they disappear on browser close
    }
    // ...redirect to dashboard or refresh UI...
  }
  return result;
}

export async function signUpWithEmailPassword({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return await signUp({
    formFields: [
      {
        id: 'email',
        value: email,
      },
      {
        id: 'password',
        value: password,
      },
      {
        id: 'firstName',
        value: firstName,
      },
      {
        id: 'lastName',
        value: lastName,
      },
    ],
  });
}

export async function sendEmailPasswordVerificationEmail() {
  const res = await sendVerificationEmail();
  return res;
}

export async function sendEmailPasswordResetEmail(email: string) {
  const result = await sendPasswordResetEmail({
    formFields: [
      {
        id: 'email',
        value: email,
      },
    ],
  });
  return result;
}

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
