import EmailPasswordWebJs from 'supertokens-web-js/recipe/emailpassword';
import SessionWebJs from 'supertokens-web-js/recipe/session';
import EmailVerificationJS from 'supertokens-web-js/recipe/emailverification';
import ThirdPartyJS from 'supertokens-web-js/recipe/thirdparty';
import { appInfo } from './appInfo';
import { SuperTokensConfig } from 'supertokens-web-js/types';
import { CookieKey, getCookieValue } from '@/utils/cookie';

export const frontendConfig = (): SuperTokensConfig => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyJS.init({
        preAPIHook: async (context) => {
          const locale = getCookieValue(CookieKey.NEXT_LOCALE) || 'en';

          return {
            ...context,
            requestInit: {
              ...(context.requestInit || {}),
              headers: {
                ...(context.requestInit?.headers || {}),
                'x-user-locale': locale,
              },
            },
          };
        },
      }),
      EmailPasswordWebJs.init({
        preAPIHook: async (context) => {
          const locale = getCookieValue(CookieKey.NEXT_LOCALE) || 'en';

          return {
            ...context,
            requestInit: {
              ...(context.requestInit || {}),
              headers: {
                ...(context.requestInit?.headers || {}),
                'x-user-locale': locale,
              },
            },
          };
        },
      }),
      SessionWebJs.init(),
      EmailVerificationJS.init({
        preAPIHook: async (context) => {
          const locale = getCookieValue(CookieKey.NEXT_LOCALE) || 'en';

          return {
            ...context,
            requestInit: {
              ...(context.requestInit || {}),
              headers: {
                ...(context.requestInit?.headers || {}),
                'x-user-locale': locale,
              },
            },
          };
        },
      }),
    ],
  };
};
