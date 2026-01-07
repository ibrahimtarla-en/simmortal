import EmailPasswordWebJs from 'supertokens-web-js/recipe/emailpassword';
import SessionWebJs from 'supertokens-web-js/recipe/session';
import EmailVerificationJS from 'supertokens-web-js/recipe/emailverification';
import ThirdPartyJS from 'supertokens-web-js/recipe/thirdparty';
import { appInfo } from './appInfo';
import { SuperTokensConfig } from 'supertokens-web-js/types';

export const frontendConfig = (): SuperTokensConfig => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyJS.init(),
      EmailPasswordWebJs.init(),
      SessionWebJs.init(),
      EmailVerificationJS.init(),
    ],
  };
};
