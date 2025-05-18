import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
  '/admin(.*)',
  '/pricing(.*)',
  '/api/humanize(.*)'  // Add humanize API route to protected routes
])

// Add share routes to public paths
const isPublicPath = createRouteMatcher([
  '/',
  '/share/(.*)',
  '/api/chat/share/(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicPath(req)) return
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}