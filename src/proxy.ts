import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './lib/i18n';

/**
 * Proxy (Middleware) for i18n routing
 * 
 * Next.js 16 uses "proxy" instead of "middleware" file convention.
 * Handles:
 * - Redirecting root path to default locale
 * - Validating locale in URL
 * - Setting locale in request headers for server components
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If root path, redirect to default locale
  if (pathname === '/') {
    const locale = getLocale(request) || defaultLocale;
    return NextResponse.redirect(
      new URL(`/${locale}`, request.url)
    );
  }

  // If pathname doesn't have a locale, add default locale
  if (!pathnameHasLocale) {
    const locale = getLocale(request) || defaultLocale;
    // Preserve query string if present
    const searchParams = request.nextUrl.searchParams.toString();
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    if (searchParams) {
      newUrl.search = searchParams;
    }
    return NextResponse.redirect(newUrl);
  }

  // Extract locale from pathname
  const pathnameLocale = pathname.split('/')[1] as Locale;
  
  // Validate locale
  if (!locales.includes(pathnameLocale)) {
    const searchParams = request.nextUrl.searchParams.toString();
    const newUrl = new URL(`/${defaultLocale}${pathname.replace(`/${pathnameLocale}`, '') || '/'}`, request.url);
    if (searchParams) {
      newUrl.search = searchParams;
    }
    return NextResponse.redirect(newUrl);
  }

  // Set locale in request header for server components (optional, since we use params now)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', pathnameLocale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Get locale from request (cookie, header, or accept-language)
 */
function getLocale(request: NextRequest): Locale | null {
  // Check cookie first
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Check accept-language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    for (const locale of locales) {
      if (acceptLanguage.includes(locale)) {
        return locale;
      }
    }
  }

  return null;
}

export const config = {
  // Match all pathnames except:
  // - api routes
  // - _next (Next.js internals)
  // - static files (images, etc.)
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

