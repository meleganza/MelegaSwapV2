import { ErrorBoundary as SErrorBoundary } from '@sentry/nextjs'
import Page from 'components/Layout/Page'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Text, Flex, IconButton, CopyIcon, copyText } from '@pancakeswap/uikit'
import { useCallback, useState } from 'react'

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
      fallback={({ eventId, error }) => (
        <ErrorFallback eventId={eventId} error={error} onRetry={handleOnClick} t={t} />
      )}
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
  const [showDetails, setShowDetails] = useState(false)
  const detail =
    error instanceof Error
      ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
      : String(error ?? 'Unknown error')
  const chainLabel = activeChainLabel()

  return (
    <Page>
      <Flex flexDirection="column" justifyContent="center" alignItems="center" style={{ maxWidth: 520 }}>
        <Text mb="12px">{t('Something went wrong on this page.')}</Text>
        <Text mb="16px" style={{ textAlign: 'center', opacity: 0.85 }}>
          {t('Active network')}: {chainLabel}.{' '}
          {t(
            'Retry or return home. If this surface requires a different LIVE chain, use the network selector — do not assume BSC for every failure.',
          )}
        </Text>
        {eventId ? (
          <Flex flexDirection="column" style={{ textAlign: 'center' }} mb="12px">
            <Text>{t('Error Tracking Id')}</Text>
            <Flex alignItems="center" justifyContent="center">
              <Text>{eventId}</Text>
              <IconButton variant="text" onClick={() => copyText(eventId)}>
                <CopyIcon color="primary" width="24px" />
              </IconButton>
            </Flex>
          </Flex>
        ) : null}
        <Flex style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }} mb="12px">
          <Button onClick={onRetry}>{t('Retry')}</Button>
          <Button variant="secondary" onClick={() => {
            window.location.href = '/'
          }}>
            {t('Return home')}
          </Button>
          <Button variant="text" onClick={() => setShowDetails((v) => !v)}>
            {showDetails ? t('Hide technical details') : t('Technical details')}
          </Button>
        </Flex>
        {showDetails ? (
          <Text
            as="pre"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              maxHeight: 240,
              overflow: 'auto',
              width: '100%',
              padding: 12,
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 8,
            }}
          >
            {detail}
          </Text>
        ) : null}
      </Flex>
    </Page>
  )
}
