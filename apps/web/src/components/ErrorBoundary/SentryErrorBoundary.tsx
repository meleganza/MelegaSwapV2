import { ErrorBoundary as SErrorBoundary } from '@sentry/nextjs'
import { useTranslation } from '@pancakeswap/localization'
import { useCallback } from 'react'
import PremiumErrorScreen from './PremiumErrorScreen'

// PremiumErrorScreen owns the visible Retry, Return home, Technical details and Error Tracking Id controls.

function activeChainLabel(): string {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage?.getItem('wagmi.store') : null
    if (raw) {
      const parsed = JSON.parse(raw)
      const chainId = parsed?.state?.data?.chain?.id ?? parsed?.state?.chainId
      if (typeof chainId === 'number') return `Chain ${chainId}`
    }
  } catch {
    /* ignore */
  }
  return 'current network'
}

export function SentryErrorBoundary({ children }) {
  const { t } = useTranslation()
  const handleOnClick = useCallback(() => window.location.reload(), [])
  return (
    <SErrorBoundary
      beforeCapture={(scope) => {
        scope.setLevel('fatal')
      }}
      fallback={({ eventId, error }) => <ErrorFallback eventId={eventId} error={error} onRetry={handleOnClick} t={t} />}
    >
      {children}
    </SErrorBoundary>
  )
}

function ErrorFallback({
  eventId,
  error,
  onRetry,
  t,
}: {
  eventId?: string
  error: unknown
  onRetry: () => void
  t: (key: string) => string
}) {
  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
      : String(error ?? 'Unknown error')
  const chainLabel = activeChainLabel()

  return (
    <PremiumErrorScreen
      code="Route interrupted"
      title={t('Something went wrong on this page.')}
      message={`${t('Active network')}: ${chainLabel}. ${t(
        'Retry or return home. If this surface requires a different LIVE chain, use the network selector — do not assume BSC for every failure.',
      )}`}
      trackingId={eventId}
      details={detail}
      onRetry={onRetry}
    />
  )
}
