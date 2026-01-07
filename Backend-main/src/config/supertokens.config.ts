import { ProviderInput } from 'supertokens-node/lib/build/recipe/thirdparty/types';
import { env, getEnv } from './env';
import { SuperTokensModuleOptions } from 'supertokens-nestjs/dist/supertokens.types';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import Session from 'supertokens-node/recipe/session';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import UserRoles from 'supertokens-node/recipe/userroles';
import {
  createPasswordResetEmail,
  createVerificationEmail,
  createWelcomeEmail,
} from 'src/util/mail';
import { getMailAdapter } from 'src/mail/mailAdapter';
import { UserMetadataRecord } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';

export const getBaseURL = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:8080';
  }

  if (getEnv() === 'test') {
    return 'https://simmortals-backend-test-19932706600.europe-west4.run.app';
  }

  return 'http://localhost:8080';
};

export const getWebsiteDomain = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:3000';
  }

  if (getEnv() === 'test') {
    return 'https://simmortals-web-test-19932706600.europe-west4.run.app';
  }

  return 'https://simmortals.com';
};

export const appInfo = {
  appName: 'Simmortals',
  apiDomain: getBaseURL(),
  websiteDomain: getWebsiteDomain(),
  websiteBasePath: '/auth',
  apiBasePath: 'api/auth',
};

export const providers: ProviderInput[] = [
  {
    config: {
      thirdPartyId: 'google',
      clients: [
        {
          clientId: env.supertokens.googleClientId,
          clientSecret: env.supertokens.googleClientSecret,
        },
      ],
    },
  },
];

export const supertokensConfig: (userService: UserService) => SuperTokensModuleOptions = (
  userService: UserService,
) => ({
  framework: 'express',
  supertokens: {
    connectionURI: env.supertokens.connectionURI,
    apiKey: env.supertokens.apiKey,
  },
  appInfo,
  recipeList: [
    EmailPassword.init({
      signUpFeature: {
        formFields: [{ id: 'firstName' }, { id: 'lastName' }],
      },
      emailDelivery: {
        override: (orig) => ({
          ...orig,
          sendEmail: async (input) => {
            if (input.type === 'PASSWORD_RESET') {
              const { html, subject } = createPasswordResetEmail(
                input.user.email,
                input.passwordResetLink,
                input.userContext?.locale as string | undefined,
              );
              await getMailAdapter().sendPasswordReset(input.user.email, html, subject);
              return;
            }
            return orig.sendEmail(input);
          },
        }),
      },
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            generatePasswordResetTokenPOST: async function (input) {
              const locale = input.options.req.getHeaderValue('x-user-locale') ?? 'en';
              input.userContext = { ...input.userContext, locale };
              const response = await originalImplementation.generatePasswordResetTokenPOST!(input);

              return response;
            },
            signUpPOST: async function (input) {
              // Call the original implementation
              const response = await originalImplementation.signUpPOST!(input);
              // If signup was successful, send verification email
              if (response.status === 'OK') {
                const { user } = response;
                await userService.ensureUserExists(user.id);
                const locale = input.options.req.getHeaderValue('x-user-locale') ?? 'en';
                await EmailVerification.sendEmailVerificationEmail(
                  user.tenantIds[0],
                  user.id,
                  user.loginMethods[0].recipeUserId,
                  user.loginMethods[0].email,
                  { locale },
                );
                const firstName = input.formFields.find((f) => f.id === 'firstName')
                  ?.value as string;
                const lastName = input.formFields.find((f) => f.id === 'lastName')?.value as string;
                await UserMetadata.updateUserMetadata(user.id, {
                  firstName,
                  lastName,
                });
              }
              return response;
            },
            signInPOST: async function (input) {
              const res = await originalImplementation.signInPOST!(input);
              if (res.status === 'OK') {
                await userService.ensureUserExists(res.user.id);
              }
              return res;
            },
          };
        },
      },
    }),
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: 'google',
              clients: [
                {
                  clientId: env.supertokens.googleClientId,
                  clientSecret: env.supertokens.googleClientSecret,
                  scope: ['openid', 'email', 'profile'],
                },
              ],
            },
          },
        ],
      },
      override: {
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            signInUp: async (input) => {
              const response = await originalImplementation.signInUp(input);

              if (response.status === 'OK') {
                await userService.ensureUserExists(response.user.id);
                const provider = input.thirdPartyId;

                // Google
                if (provider === 'google') {
                  const googleAccessToken: string | undefined =
                    typeof response.oAuthTokens?.access_token === 'string'
                      ? response.oAuthTokens.access_token
                      : undefined;
                  if (googleAccessToken) {
                    const metadata = await getGoogleMetadata(googleAccessToken);
                    if (metadata) {
                      void userService.ensureThirdPartyUserInfo(response.user.id, {
                        firstName: metadata.given_name,
                        lastName: metadata.family_name,
                      });
                    }
                  }
                }
              }
              return response;
            },
          };
        },
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            signInUpPOST: async function (input) {
              const res = await originalImplementation.signInUpPOST!(input);
              if (res.status === 'OK') {
                await userService.ensureUserExists(res.user.id);
                if (res.createdNewRecipeUser) {
                  try {
                    const locale = input.options.req.getHeaderValue('x-user-locale');
                    const name = await userService.getUser(res.user.id).then((u) => {
                      return `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
                    });
                    const { html, subject } = createWelcomeEmail(name, locale);
                    await getMailAdapter().sendWelcomeEmail(res.user.emails[0], html, subject);
                  } catch {
                    console.error('Failed to send welcome email');
                  }
                }
              }
              return res;
            },
          };
        },
      },
    }),
    EmailVerification.init({
      mode: 'OPTIONAL',
      emailDelivery: {
        override: (orig) => ({
          ...orig,
          sendEmail: async (input) => {
            const metadata = await UserMetadata.getUserMetadata(input.user.id);
            const firstName = (metadata.metadata as UserMetadataRecord)?.firstName ?? '';
            const locale = (input.userContext?.locale as string) ?? 'en';
            const { html, subject } = createVerificationEmail(
              firstName,
              input.emailVerifyLink,
              locale,
            );
            await getMailAdapter().sendVerification(input.user.email, html, subject);
          },
        }),
      },
      override: {
        apis: (originalImplementation) => {
          return {
            ...originalImplementation,
            generateEmailVerifyTokenPOST: async function (input) {
              const locale = input.options.req.getHeaderValue('x-user-locale') ?? 'en';
              input.userContext = { ...input.userContext, locale };
              const response = await originalImplementation.generateEmailVerifyTokenPOST!(input);

              return response;
            },
            verifyEmailPOST: async function (input) {
              const response = await originalImplementation.verifyEmailPOST!(input);
              if (response.status === 'OK') {
                try {
                  const locale = input.options.req.getHeaderValue('x-user-locale');
                  const name = await userService
                    .getUser(response.user.recipeUserId.getAsString())
                    .then((u) => {
                      return `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
                    });
                  const { html, subject } = createWelcomeEmail(name, locale);
                  await getMailAdapter().sendWelcomeEmail(response.user.email, html, subject);
                } catch {
                  console.error('Failed to send welcome email');
                }
              }
              return response;
            },
          };
        },
      },
    }),
    Session.init({
      cookieSameSite: 'lax',
      cookieSecure: env.general.nodeEnv !== 'development',
      getTokenTransferMethod: () => 'any',
    }),
    UserMetadata.init(),
    UserRoles.init(),
  ],
});

async function getGoogleMetadata(accessToken: string): Promise<GoogleUserMetadata | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as GoogleUserMetadata;
}

export interface GoogleUserMetadata {
  picture?: string;
  name?: string;
  email?: string;
  given_name?: string;
  family_name: string;
}
