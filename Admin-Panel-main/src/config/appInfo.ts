import { getDomain } from '@/services/env';

export const appInfo = {
  appName: 'Simmortals Dashboard',
  apiDomain: getDomain(),
  websiteDomain: getDomain(),
  apiBasePath: '/api/auth',
  websiteBasePath: '/auth',
};
