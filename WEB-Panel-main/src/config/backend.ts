import SessionNode from 'supertokens-node/recipe/session';
import UserRoles from 'supertokens-node/recipe/userroles';
import UserMetadata from 'supertokens-node/recipe/usermetadata';
import { appInfo } from './appInfo';
import { TypeInput } from 'supertokens-node/types';
import SuperTokens from 'supertokens-node';
import { exists } from '@/utils/exists';
import Dashboard from 'supertokens-node/recipe/dashboard';

export const backendConfig = (): TypeInput | null => {
  const connectionURI = process.env.SUPERTOKENS_CONNECTION_URI;
  const apiKey = process.env.SUPERTOKENS_API_KEY;
  if (!exists(connectionURI)) {
    return null;
  }

  return {
    supertokens: {
      connectionURI,
      apiKey,
    },
    appInfo,
    recipeList: [
      SessionNode.init(),
      UserRoles.init(),
      UserMetadata.init(),
      ...(process.env.NODE_ENV === 'development' ? [Dashboard.init()] : []),
    ],
    isInServerlessEnv: true,
    framework: 'custom',
  };
};

let initialized = false;

export function ensureSuperTokensInit() {
  const config = backendConfig();
  if (!initialized && config) {
    SuperTokens.init(config);
    initialized = true;
  }
}
