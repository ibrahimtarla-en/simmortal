export const getEnv: () => string = () => process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

export const getBaseURL = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:8080';
  }

  if (getEnv() === 'test') {
    return 'https://simmortals-backend-test-19932706600.europe-west4.run.app';
  }

  return 'https://simmortals-backend-19932706600.europe-west4.run.app';
};

export const getWebsiteDomain = () => {
  if (getEnv() === 'development') {
    return 'https://simmortals-web-test-19932706600.europe-west4.run.app';
  }
  if (getEnv() === 'test') {
    return 'https://beta.simmortals.com';
  }

  return 'https://simmortals.com';
};

export const getDomain = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:3000';
  }
  if (getEnv() === 'test') {
    return 'https://admin.beta.simmortals.com';
  }

  return 'https://admin.simmortals.com';
};
