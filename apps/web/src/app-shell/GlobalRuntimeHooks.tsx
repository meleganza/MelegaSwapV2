import { useAccountEventListener } from 'hooks/useAccountEventListener'
import useSentryUser from 'hooks/useSentryUser'
import useThemeCookie from 'hooks/useThemeCookie'
import useUserAgent from 'hooks/useUserAgent'
import { useRouter } from 'next/router'
import { usePollBlockNumber } from 'state/block/hooks'

function BlockPollingRuntime({ refreshInterval }: { refreshInterval: number }) {
  usePollBlockNumber(refreshInterval)
  return null
}

function StandardRuntimeHooks() {
  const router = useRouter()
  const path = router.pathname
  const needsBlockPolling =
    path === '/' ||
    [
      '/swap',
      '/liquidity',
      '/farms',
      '/pools',
      '/list',
      '/projects',
      '/project-hq',
      '/token',
      '/bridge',
      '/portfolio',
    ].some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
  const isTransactionCritical =
    path === '/swap' || path.startsWith('/swap/') || path === '/bridge' || path.startsWith('/bridge/')
  const refreshInterval = isTransactionCritical ? 6000 : path === '/list' || path === '/projects' ? 30000 : 12000

  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  useThemeCookie()
  return needsBlockPolling ? <BlockPollingRuntime refreshInterval={refreshInterval} /> : null
}

function MiniProgramRuntimeHooks() {
  usePollBlockNumber(6000)
  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  return null
}

/**
 * Non-visual runtime work starts immediately after hydration instead of
 * competing with the first paint and primary navigation for parse time.
 */
export default function GlobalRuntimeHooks({ miniProgram = false }: { miniProgram?: boolean }) {
  return miniProgram ? <MiniProgramRuntimeHooks /> : <StandardRuntimeHooks />
}
