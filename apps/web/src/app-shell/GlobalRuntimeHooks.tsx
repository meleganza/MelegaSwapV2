import { useAccountEventListener } from 'hooks/useAccountEventListener'
import useSentryUser from 'hooks/useSentryUser'
import useThemeCookie from 'hooks/useThemeCookie'
import useUserAgent from 'hooks/useUserAgent'
import { useRouter } from 'next/router'
import { usePollBlockNumber } from 'state/block/hooks'
import { resolveRuntimeProfile } from 'app-runtime/runtimeProfile'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { shouldRunBlockPolling } from './idleHomeChainPolicy'

function BlockPollingRuntime({ refreshInterval }: { refreshInterval: number }) {
  usePollBlockNumber(refreshInterval)
  return null
}

function StandardRuntimeHooks() {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const path = router.pathname
  const profile = resolveRuntimeProfile(path)
  const isTransactionCritical =
    path === '/swap' || path.startsWith('/swap/') || path === '/bridge' || path.startsWith('/bridge/')
  const refreshInterval = isTransactionCritical ? 6000 : path === '/list' || path === '/projects' ? 30000 : 12000

  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  useThemeCookie()
  // Remount on chain change so the previous chain's block poll stops immediately.
  if (!shouldRunBlockPolling(profile, chainId)) return null
  return <BlockPollingRuntime key={chainId} refreshInterval={refreshInterval} />
}

function MiniProgramRuntimeHooks() {
  const { chainId } = useActiveChainId()
  useUserAgent()
  useAccountEventListener()
  useSentryUser()
  if (!shouldRunBlockPolling('transactional', chainId)) return null
  return <BlockPollingRuntime key={chainId} refreshInterval={6000} />
}

/**
 * Non-visual runtime work starts immediately after hydration instead of
 * competing with the first paint and primary navigation for parse time.
 */
export default function GlobalRuntimeHooks({ miniProgram = false }: { miniProgram?: boolean }) {
  return miniProgram ? <MiniProgramRuntimeHooks /> : <StandardRuntimeHooks />
}
