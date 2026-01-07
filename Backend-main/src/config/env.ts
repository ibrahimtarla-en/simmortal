export function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value !== null && value !== undefined) {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable ${key} is not defined!`);
}

export const env = {
  general: {
    port: '8080',
    nodeEnv: requireEnv('ENV', 'development'),
  },
  pg: {
    host: requireEnv('POSTGRES_HOST'),
    port: parseInt(requireEnv('POSTGRES_PORT', '5432'), 10),
    username: requireEnv('POSTGRES_USER'),
    password: requireEnv('POSTGRES_PASSWORD'),
    database: requireEnv('POSTGRES_DATABASE', 'postgres'),
  },
  supertokens: {
    connectionURI: requireEnv('SUPERTOKENS_CONNECTION_URI'),
    googleClientId: requireEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    apiKey: requireEnv('SUPERTOKENS_API_KEY'),
  },
  storage: {
    privateKey: requireEnv('GCLOUD_STORAGE_PKEY'),
  },
  twilio: {
    accountSid: requireEnv('TWILIO_ACCOUNT_SID'),
    authToken: requireEnv('TWILIO_AUTH_TOKEN'),
    serviceSid: requireEnv('TWILIO_SERVICE_SID'),
  },
  mail: {
    googleClientId: requireEnv('MAILER_GOOGLE_CLIENT_ID'),
    googleClientSecret: requireEnv('MAILER_GOOGLE_CLIENT_SECRET'),
    googleRefreshToken: requireEnv('MAILER_GOOGLE_REFRESH_TOKEN'),
  },
  stripe: {
    secretKey: requireEnv('STRIPE_SECRET_KEY'),
  },
  googleGenAI: {
    apiKey: requireEnv('GOOGLE_GEN_AI_API_KEY'),
  },
  goEnhanceAI: {
    apiKey: requireEnv('GO_ENHANCE_API_KEY'),
  },
  elevenLabs: {
    apiKey: requireEnv('ELEVEN_LABS_API_KEY'),
  },
  heyGen: {
    apiKey: requireEnv('HEYGEN_API_KEY'),
  },
};

export const getEnv: () => string = () => env.general.nodeEnv ?? 'development';

export const getBaseURL = () => {
  if (getEnv() === 'development') {
    return 'http://localhost:8080';
  }
  if (getEnv() === 'test') {
    return 'https://simmortals-backend-test-19932706600.europe-west4.run.app';
  }

  return 'https://simmortals-backend-19932706600.europe-west4.run.app';
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
