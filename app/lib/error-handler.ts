export function initializeErrorHandling() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Only initialize Sentry in production
    require('@sentry/nextjs');
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault()
    })

    window.addEventListener('error', (event) => {
      console.error('Runtime error:', event.error)
      event.preventDefault()
    })
  }
} 