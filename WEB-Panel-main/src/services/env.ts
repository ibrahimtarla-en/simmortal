export const getEnv: () => string = () => process.env.NEXT_PUBLIC_APP_ENV ?? 'development';

export const getBaseURL = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:8080';
  }

  if (getEnv() === 'test') {
    return 'https://simmortals-backend-test-19932706600.europe-west4.run.app';
  }

  return 'http://localhost:8080';
};

export const getDomain = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:3000';
  }
  if (getEnv() === 'test') {
    return 'https://beta.simmortals.com';
  }

  return 'https://simmortals.com';
};
