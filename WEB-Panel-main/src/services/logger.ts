'use server';

export async function logErrorToServer(
  error: string,
  context?: string,
  stack?: string,
  additionalInfo?: Record<string, unknown>,
) {
  console.error('[Frontend Error]', {
    message: error,
    context,
    stack,
    additionalInfo,
    timestamp: new Date().toISOString(),
  });
}
