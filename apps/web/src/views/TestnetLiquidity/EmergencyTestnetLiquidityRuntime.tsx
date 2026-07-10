import { useCallback, useEffect, useRef, useState } from 'react'
import type { EmergencyDiagnostics } from './EmergencyTestnetLiquidityPage'
import {
  ACTION_LABELS,
  type ActionStatus,
  addLiquidityWithFlow,
  approveMarco,
  connectWallet,
  createPair,
  deriveActionStatus,
  getEthereum,
  parseAmounts,
  readMarcoAllowance,
  readPairSnapshot,
  readWalletChain,
  switchToTestnet,
  buildAddLiquidityPreview,
  estimateGas,
  capGasLimit,
  buildAddLiquidityTx,
  formatEthError,
} from './emergencyWalletActions'

const LOG = '[R745K]'

export type ActionUpdate = {
  status: ActionStatus
  label: string
  execute: () => void
  disabled: boolean
}

type Props = {
  chainIdTarget: number
  amountMarco: string
  amountBnb: string
  onDiagnostics: (d: EmergencyDiagnostics) => void
  onWarnings: (w: string[]) => void
  onActionUpdate: (action: ActionUpdate) => void
}

export default function EmergencyTestnetLiquidityRuntime({
  chainIdTarget,
  amountMarco,
  amountBnb,
  onDiagnostics,
  onWarnings,
  onActionUpdate,
}: Props) {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastErrorRef = useRef('none')
  const pendingRef = useRef(false)
  const addLiquidityBusyRef = useRef(false)
  const onDiagnosticsRef = useRef(onDiagnostics)
  const onWarningsRef = useRef(onWarnings)
  const onActionUpdateRef = useRef(onActionUpdate)
  onDiagnosticsRef.current = onDiagnostics
  onWarningsRef.current = onWarnings
  onActionUpdateRef.current = onActionUpdate

  const amountsRef = useRef({ marco: amountMarco, bnb: amountBnb })
  amountsRef.current = { marco: amountMarco, bnb: amountBnb }

  const stateRef = useRef({
    account: null as string | null,
    chainId: null as number | null,
    pairExists: false,
    allowanceSufficient: false,
    actionStatus: 'connect_wallet' as ActionStatus,
  })

  const diagnosticsRef = useRef<EmergencyDiagnostics>({
    pageRendered: 'YES',
    walletStatus: 'initializing…',
    chainStatus: 'initializing…',
    pairStatus: 'initializing…',
    actionStatus: 'connect_wallet',
    addLiquidityStatus: 'idle',
    lastError: 'none',
    runtimeNote: 'runtime loading',
    marcoAmount: amountMarco,
    tbnbAmount: amountBnb,
  })

  const patchDiagnostics = useCallback((partial: Partial<EmergencyDiagnostics>) => {
    diagnosticsRef.current = {
      ...diagnosticsRef.current,
      pageRendered: 'YES',
      runtimeNote: 'runtime active',
      marcoAmount: amountsRef.current.marco,
      tbnbAmount: amountsRef.current.bnb,
      ...partial,
    }
    onDiagnosticsRef.current(diagnosticsRef.current)
  }, [])

  const publishAction = useCallback((status: ActionStatus) => {
    stateRef.current.actionStatus = status
    const isPending = pendingRef.current
    const label = isPending
      ? status === 'approve_marco'
        ? 'Approving MARCO…'
        : status === 'create_pair'
          ? 'Creating Pair…'
          : status === 'add_liquidity'
            ? 'Adding Liquidity…'
            : status === 'switch_chain'
              ? 'Switching…'
              : 'Connecting…'
      : ACTION_LABELS[status]

    patchDiagnostics({ actionStatus: status })

    const execute = async () => {
      const eth = getEthereum()
      if (!eth || pendingRef.current) return
      pendingRef.current = true
      publishAction(status)
      try {
        const { account } = stateRef.current
        const amounts = parseAmounts(amountsRef.current.marco, amountsRef.current.bnb)

        if (status === 'connect_wallet') {
          await connectWallet(eth)
        } else if (status === 'switch_chain') {
          await switchToTestnet(eth)
        } else if (status === 'approve_marco' && account) {
          await approveMarco(eth, account)
        } else if (status === 'create_pair' && account) {
          await createPair(eth, account)
        } else if (status === 'add_liquidity' && account) {
          addLiquidityBusyRef.current = true
          await addLiquidityWithFlow(eth, account, amounts, {
            onStatus: (s) => patchDiagnostics({ addLiquidityStatus: s }),
            onPreview: (preview) => {
              patchDiagnostics({
                txPreview: JSON.stringify(
                  {
                    marcoAmountWei: preview.marcoAmountWei,
                    tbnbAmountWei: preview.tbnbAmountWei,
                    router: preview.router,
                    token: preview.token,
                    recipient: preview.recipient,
                    deadline: preview.deadline,
                    gasEstimate: preview.gasEstimate,
                    gasLimit: preview.gasLimit,
                  },
                  null,
                  0,
                ),
              })
            },
            onTxHash: (hash) => patchDiagnostics({ txHash: hash, addLiquidityStatus: 'submitted' }),
            onReceipt: (success) =>
              patchDiagnostics({ receiptStatus: success ? 'success' : 'failed' }),
            onPairSnapshot: (snap) => {
              patchDiagnostics({
                pairAddress: snap.pairAddress ?? undefined,
                reserves:
                  snap.reserve0 && snap.reserve1
                    ? `r0=${snap.reserve0} r1=${snap.reserve1} (token0=${snap.token0})`
                    : undefined,
                lpBalance: snap.lpBalance ?? undefined,
                pairStatus: snap.exists ? `pair exists: ${snap.pairAddress}` : diagnosticsRef.current.pairStatus,
              })
            },
          })
          addLiquidityBusyRef.current = false
          patchDiagnostics({ addLiquidityStatus: 'confirmed' })
        }
        lastErrorRef.current = 'none'
        patchDiagnostics({ lastError: 'none' })
      } catch (e: unknown) {
        const msg = formatEthError(e)
        lastErrorRef.current = msg
        console.error(`${LOG} error`, msg)
        if (status === 'add_liquidity') {
          addLiquidityBusyRef.current = false
          patchDiagnostics({ addLiquidityStatus: 'failed', lastError: msg })
        } else {
          patchDiagnostics({ lastError: msg })
        }
      } finally {
        pendingRef.current = false
        publishAction(stateRef.current.actionStatus)
      }
      await refreshAllRef.current()
    }

    const disabled = isPending || (status === 'add_liquidity' && addLiquidityBusyRef.current)
    onActionUpdateRef.current({ status, label, execute, disabled })
    console.log(`${LOG} action status`, status)
  }, [patchDiagnostics])

  const refreshAllRef = useRef<() => Promise<void>>(async () => {})

  refreshAllRef.current = async () => {
    if (addLiquidityBusyRef.current) return

    const eth = getEthereum()
    if (!eth) {
      stateRef.current = { ...stateRef.current, account: null, chainId: null, allowanceSufficient: false }
      onWarningsRef.current([])
      patchDiagnostics({ walletStatus: 'no injected wallet', chainStatus: 'no provider' })
      publishAction('connect_wallet')
      return
    }

    try {
      const { account, chainId } = await readWalletChain(eth)
      const snapshot = await readPairSnapshot(account)
      const pairExists = snapshot.exists
      const amounts = parseAmounts(amountsRef.current.marco, amountsRef.current.bnb)
      let allowanceSufficient = false

      if (account && chainId === chainIdTarget) {
        allowanceSufficient = await readMarcoAllowance(eth, account, amounts.marcoWei)
      }

      stateRef.current = { account, chainId, pairExists, allowanceSufficient, actionStatus: stateRef.current.actionStatus }

      const walletStatus = account ? `connected: ${account}` : 'not connected'
      const chainStatus =
        chainId === null
          ? 'no chain detected'
          : chainId === chainIdTarget
            ? `BNB Testnet (${chainId})`
            : `wrong chain (${chainId}) — switch to ${chainIdTarget}`
      const pairStatus = pairExists
        ? `pair exists: ${snapshot.pairAddress}`
        : 'pair not created (0x0)'

      console.log(`${LOG} wallet status`, walletStatus)
      console.log(`${LOG} chain status`, chainStatus)
      console.log(`${LOG} pair status`, pairStatus)

      const warnings: string[] = []
      if (chainId !== null && chainId !== chainIdTarget) {
        warnings.push('Switch MetaMask to BNB Testnet.')
      }
      onWarningsRef.current(warnings)

      const partial: Partial<EmergencyDiagnostics> = {
        walletStatus,
        chainStatus,
        pairStatus,
        lastError: lastErrorRef.current,
        marcoAmount: amountsRef.current.marco,
        tbnbAmount: amountsRef.current.bnb,
      }

      if (snapshot.exists) {
        partial.pairAddress = snapshot.pairAddress ?? undefined
        partial.reserves =
          snapshot.reserve0 && snapshot.reserve1
            ? `r0=${snapshot.reserve0} r1=${snapshot.reserve1}`
            : undefined
        partial.lpBalance = snapshot.lpBalance ?? undefined
      }

      if (account && chainId === chainIdTarget && pairExists && !pendingRef.current) {
        const preview = buildAddLiquidityPreview(account, amounts)
        try {
          const txBase = buildAddLiquidityTx(account, amounts, preview.deadline)
          const estimated = await estimateGas(eth, txBase)
          const gasLimit = capGasLimit(estimated)
          partial.txPreview = JSON.stringify(
            {
              marcoAmountWei: preview.marcoAmountWei,
              tbnbAmountWei: preview.tbnbAmountWei,
              router: preview.router,
              token: preview.token,
              recipient: preview.recipient,
              deadline: preview.deadline,
              gasEstimate: estimated.toString(),
              gasLimit,
            },
            null,
            0,
          )
        } catch {
          partial.txPreview = JSON.stringify(
            {
              marcoAmountWei: preview.marcoAmountWei,
              tbnbAmountWei: preview.tbnbAmountWei,
              router: preview.router,
              token: preview.token,
              recipient: preview.recipient,
              deadline: preview.deadline,
              gasEstimate: null,
              gasLimit: null,
            },
            null,
            0,
          )
        }
      }

      patchDiagnostics(partial)

      if (!pendingRef.current) {
        publishAction(
          deriveActionStatus({
            account,
            chainId,
            pairExists,
            allowanceSufficient,
            addLiquidityLocked: addLiquidityBusyRef.current,
          }),
        )
      }
    } catch (e: unknown) {
      const msg = formatEthError(e)
      lastErrorRef.current = msg
      console.error(`${LOG} error`, msg)
      patchDiagnostics({ lastError: msg })
    }
  }

  useEffect(() => {
    console.log(`${LOG} page mounted`)
    refreshAllRef.current()
    pollRef.current = setInterval(() => refreshAllRef.current(), 12_000)
    const eth = getEthereum()
    const onChange = () => refreshAllRef.current()
    eth?.on?.('accountsChanged', onChange)
    eth?.on?.('chainChanged', onChange)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      eth?.removeListener?.('accountsChanged', onChange)
      eth?.removeListener?.('chainChanged', onChange)
    }
  }, [chainIdTarget])

  useEffect(() => {
    if (!pendingRef.current) refreshAllRef.current()
  }, [amountMarco, amountBnb])

  return null
}
