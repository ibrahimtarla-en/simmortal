import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getDomain, getEnv } from './services/env';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Check if we're on the correct domain (skip for development)
  if (getEnv() !== 'development') {
    const host = request.headers.get('host');
    const expectedDomain = getDomain();
    const expectedHost = expectedDomain.replace(/^https?:\/\//, '');

    if (host && host !== expectedHost) {
      // Redirect to the correct domain with the same path and search params
      const url = new URL(request.url);
      const redirectUrl = `${expectedDomain}${url.pathname}${url.search}`;
      return NextResponse.redirect(redirectUrl, 308); // 308 = Permanent Redirect
    }
  }

  // Run the intl middleware first
  const response = intlMiddleware(request);

  // Add the full URL as a custom header
  response.headers.set('x-url', request.url);

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
