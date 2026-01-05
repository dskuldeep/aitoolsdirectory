import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const hostname = req.headers.get('host')
    const url = req.nextUrl.clone()

    // Redirect fly.dev to main domain
    if (hostname === 'aitoolsdirectory.fly.dev') {
      url.host = 'agitracker.io'
      url.protocol = 'https'
      return NextResponse.redirect(url, 301)
    }

    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

    if (isAdminRoute) {
      if (!token) {
        console.log('[Middleware] No token found, redirecting to signin')
        const signInUrl = new URL('/auth/signin', req.url)
        signInUrl.searchParams.set('callbackUrl', '/admin')
        return NextResponse.redirect(signInUrl)
      }

      const role = (token as any)?.role
      console.log('[Middleware] Admin route access check:', {
        role,
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        tokenId: token ? (token as any).id : undefined,
        url: req.url,
        // Log full token in production too for debugging
        fullToken: token
      })
      if (role !== 'admin' && role !== 'editor') {
        console.log('[Middleware] Insufficient role, redirecting to home. Role was:', role)
        return NextResponse.redirect(new URL('/', req.url))
      }
      console.log('[Middleware] Admin access granted, proceeding to page')
    }

    // Security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://static.cloudflareinsights.com;"
    )

    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // For admin routes, just check if token exists
        // The actual role check happens in the middleware function after JWT callback runs
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        if (isAdminRoute) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

