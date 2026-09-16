import { ErrorBoundary as SErrorBoundary } from '@sentry/nextjs'
import PremiumErrorScreen from './PremiumErrorScreen'

/**
 * Global route/component failure surface.
 * Visible UI is the Founder-approved friendly screen (centered copy + Home).
 * Tracking ids, stacks, and network-debug copy stay in Sentry / console only.
 */
export function SentryErrorBoundary({ children }) {
  return (
    <SErrorBoundary
      beforeCapture={(scope) => {
        scope.setLevel('fatal')
      }}
      fallback={({ eventId, error }) => {
        if (typeof console !== 'undefined') {
          console.error('[MelegaErrorBoundary]', eventId ?? 'no-event-id', error)
        }
        return <PremiumErrorScreen />
      }}
    >
      {children}
    </SErrorBoundary>
  )
}
