export type EmailVerificationResult = 'success' | 'error' | 'invalid';

export interface GoogleAuthUserInfo {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  hd?: string;
}
