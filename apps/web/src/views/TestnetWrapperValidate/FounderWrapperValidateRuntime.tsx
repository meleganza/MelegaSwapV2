import { useCallback, useEffect, useRef } from 'react'
import type { ValidateDiagnostics, RouteAction, WalletAction } from './FounderWrapperValidatePage'
import {
  VALIDATE_CHAIN_ID,
  type RouteId,
  type RouteValidationResult,
  type RouteSwapStatus,
  checkAllLiquidity,
  connectWallet,
  executeRouteSwap,
  formatEthError,
  extractRevertReason,
  getEthereum,
  isBnbTestnetChain,
  readWalletChain,
  switchToTestnet,
  buildValidationReport,
  type LiquidityStatus,
} from './wrapperValidateActions'
import { ROUTES } from './wrapperValidateConfig'

const LOG = '[R746E]'

type Props = {
  amounts: Record<RouteId, string>
  onDiagnostics: (d: ValidateDiagnostics) => void
  onRouteActions: (actions: Partial<Record<RouteId, RouteAction>>) => void
  onWalletAction: (action: WalletAction | null) => void
}

export default function FounderWrapperValidateRuntime({
  amounts,
  onDiagnostics,
  onRouteActions,
  onWalletAction,
}: Props) {
  const pendingRouteRef = useRef<RouteId | null>(null)
  const resultsRef = useRef<RouteValidationResult[]>([])
  const liquidityRef = useRef<LiquidityStatus[]>([])
  const amountsRef = useRef(amounts)
  amountsRef.current = amounts

  const onDiagnosticsRef = useRef(onDiagnostics)
  const onRouteActionsRef = useRef(onRouteActions)
  const onWalletActionRef = useRef(onWalletAction)
  onDiagnosticsRef.current = onDiagnostics
  onRouteActionsRef.current = onRouteActions
  onWalletActionRef.current = onWalletAction

  const diagnosticsRef = useRef<ValidateDiagnostics>({
    pageRendered: 'YES',
    walletStatus: 'initializing…',
    chainStatus: 'initializing…',
    actionStatus: 'connect_wallet',
    expectedChainId: VALIDATE_CHAIN_ID,
    detectedChainId: null,
    chainMatch: false,
    lastError: 'none',
    runtimeNote: 'runtime loading',
    routeStatuses: {},
    routeTxHashes: {},
    routePass: {},
    routeResults: {},
    liquidity: {},
  })

  const patchDiagnostics = useCallback((partial: Partial<ValidateDiagnostics>) => {
    diagnosticsRef.current = {
      ...diagnosticsRef.current,
      pageRendered: 'YES',
      runtimeNote: 'runtime active',
      ...partial,
    }
    onDiagnosticsRef.current(diagnosticsRef.current)
  }, [])

  const publishActions = useCallback(
    (mode: 'connect_wallet' | 'switch_chain' | 'ready') => {
      const isPending = Boolean(pendingRouteRef.current)

      if (mode !== 'ready') {
        onRouteActionsRef.current({})
        onWalletActionRef.current({
          label: mode === 'switch_chain' ? 'Switch to BNB Testnet' : 'Connect Wallet',
          disabled: isPending,
          execute: async () => {
            const eth = getEthereum()
            if (!eth || pendingRouteRef.current) return
            try {
              if (mode === 'switch_chain') await switchToTestnet(eth)
              else await connectWallet(eth)
              patchDiagnostics({ lastError: 'none' })
            } catch (e: unknown) {
              patchDiagnostics({ lastError: formatEthError(e) })
            }
            await refreshRef.current()
          },
        })
        patchDiagnostics({ actionStatus: mode })
        return
      }

      onWalletActionRef.current(null)
      patchDiagnostics({ actionStatus: 'ready' })

      const actions: Partial<Record<RouteId, RouteAction>> = {}
      for (const route of ROUTES) {
        const liq = liquidityRef.current.find((l) => l.routeId === route.id)
        const blocked = Boolean(liq && !liq.available)
        const busy = pendingRouteRef.current === route.id
        actions[route.id] = {
          label: blocked ? 'Blocked — no liquidity' : busy ? 'Swap pending…' : `Execute ${route.id}`,
          disabled: isPending || blocked,
          execute: async () => {
            const eth = getEthereum()
            if (!eth || pendingRouteRef.current) return
            pendingRouteRef.current = route.id
            patchDiagnostics({
              routeStatuses: { ...diagnosticsRef.current.routeStatuses, [route.id]: 'preparing' },
              lastError: 'none',
            })
            publishActions('ready')
            try {
              const result = await executeRouteSwap(eth, route.id, amountsRef.current[route.id], {
                onStatus: (s: RouteSwapStatus) =>
                  patchDiagnostics({
                    routeStatuses: { ...diagnosticsRef.current.routeStatuses, [route.id]: s },
                  }),
                onTxHash: (hash) =>
                  patchDiagnostics({
                    routeTxHashes: { ...diagnosticsRef.current.routeTxHashes, [route.id]: hash },
                  }),
              })
              resultsRef.current = [...resultsRef.current.filter((r) => r.routeId !== route.id), result]
              const routeResults = { ...diagnosticsRef.current.routeResults, [route.id]: result }
              const report = buildValidationReport(resultsRef.current, liquidityRef.current)
              patchDiagnostics({
                routeResults,
                routePass: {
                  ...diagnosticsRef.current.routePass,
                  [route.id]: result.pass ? 'PASS' : result.blocked ? 'BLOCKED' : 'FAIL',
                },
                validationReport: JSON.stringify(report, null, 2),
                validationVerdict: report.verdict,
                lastError: result.pass ? 'none' : result.failures.join('; '),
              })
            } catch (e: unknown) {
              const revertReason = extractRevertReason(e)
              const msg = revertReason ?? formatEthError(e)
              console.error(`${LOG} swap error`, route.id, msg)
              patchDiagnostics({
                lastError: msg,
                routeStatuses: { ...diagnosticsRef.current.routeStatuses, [route.id]: 'failed' },
                routePass: { ...diagnosticsRef.current.routePass, [route.id]: 'FAIL' },
              })
            } finally {
              pendingRouteRef.current = null
              await refreshRef.current()
            }
          },
        }
      }
      onRouteActionsRef.current(actions)
    },
    [patchDiagnostics],
  )

  const refreshRef = useRef<() => Promise<void>>(async () => {})

  refreshRef.current = async () => {
    if (pendingRouteRef.current) return
    const eth = getEthereum()
    if (!eth) {
      patchDiagnostics({
        walletStatus: 'no injected wallet',
        chainStatus: 'no provider',
        detectedChainId: null,
        chainMatch: false,
      })
      publishActions('connect_wallet')
      return
    }

    try {
      const liquidity = await checkAllLiquidity()
      liquidityRef.current = liquidity
      const liquidityMap: Partial<Record<RouteId, LiquidityStatus>> = {}
      for (const l of liquidity) liquidityMap[l.routeId] = l

      const { account, chainId } = await readWalletChain(eth)
      const chainMatch = isBnbTestnetChain(chainId)
      patchDiagnostics({
        walletStatus: account ? `connected: ${account}` : 'not connected',
        chainStatus: chainMatch
          ? `BNB Testnet (${chainId})`
          : chainId === null
            ? 'no chain detected'
            : `wrong chain (${chainId}) — switch to ${VALIDATE_CHAIN_ID}`,
        expectedChainId: VALIDATE_CHAIN_ID,
        detectedChainId: chainId,
        chainMatch,
        liquidity: liquidityMap,
        standardSwapBlocked: liquidity.find((l) => l.routeId === 'STANDARD_SWAP' && !l.available)
          ? 'BLOCKED_STANDARD_SWAP_LIQUIDITY_MISSING'
          : undefined,
      })

      if (!account) publishActions('connect_wallet')
      else if (!chainMatch) publishActions('switch_chain')
      else publishActions('ready')
    } catch (e: unknown) {
      patchDiagnostics({ lastError: formatEthError(e) })
    }
  }

  useEffect(() => {
    console.log(`${LOG} page mounted`)
    refreshRef.current()
    const eth = getEthereum()
    const onChange = () => refreshRef.current()
    eth?.on?.('accountsChanged', onChange)
    eth?.on?.('chainChanged', onChange)
    return () => {
      eth?.removeListener?.('accountsChanged', onChange)
      eth?.removeListener?.('chainChanged', onChange)
    }
  }, [publishActions])

  useEffect(() => {
    if (!pendingRouteRef.current) refreshRef.current()
  }, [amounts])

  return null
}
