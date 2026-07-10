import { useCallback, useEffect, useRef } from 'react'
import type { WrapperDeployDiagnostics } from './FounderWrapperDeployPage'
import { WRAPPER_DEPLOY_CHAIN_ID } from './wrapperDeployConfig'
import {
  type DeployStatus,
  buildConstructorPreview,
  connectWallet,
  deployWrapperWithWallet,
  formatEthError,
  getEthereum,
  isBnbTestnetChain,
  loadCreationArtifact,
  readWalletChain,
  switchToTestnet,
} from './wrapperDeployActions'

const LOG = '[R746D]'

export type ActionStatus = 'connect_wallet' | 'switch_chain' | 'deploy_wrapper'

export type ActionUpdate = {
  status: ActionStatus
  label: string
  execute: () => void
  disabled: boolean
}

type Props = {
  onDiagnostics: (d: WrapperDeployDiagnostics) => void
  onActionUpdate: (action: ActionUpdate) => void
}

export default function FounderWrapperDeployRuntime({ onDiagnostics, onActionUpdate }: Props) {
  const pendingRef = useRef(false)
  const onDiagnosticsRef = useRef(onDiagnostics)
  const onActionUpdateRef = useRef(onActionUpdate)
  onDiagnosticsRef.current = onDiagnostics
  onActionUpdateRef.current = onActionUpdate

  const diagnosticsRef = useRef<WrapperDeployDiagnostics>({
    pageRendered: 'YES',
    walletStatus: 'initializing…',
    chainStatus: 'initializing…',
    deployStatus: 'idle',
    actionStatus: 'connect_wallet',
    expectedChainId: WRAPPER_DEPLOY_CHAIN_ID,
    detectedChainId: null,
    chainMatch: false,
    lastError: 'none',
    runtimeNote: 'runtime loading',
  })

  const patchDiagnostics = useCallback((partial: Partial<WrapperDeployDiagnostics>) => {
    diagnosticsRef.current = {
      ...diagnosticsRef.current,
      pageRendered: 'YES',
      runtimeNote: 'runtime active',
      ...partial,
    }
    onDiagnosticsRef.current(diagnosticsRef.current)
  }, [])

  const publishAction = useCallback(
    (mode: ActionStatus) => {
      const isPending = pendingRef.current
      const deployBusy = ['preparing', 'wallet_open', 'submitted'].includes(diagnosticsRef.current.deployStatus)

      let label = 'Connect Wallet'
      let execute = async () => {
        const eth = getEthereum()
        if (!eth || pendingRef.current) return
        pendingRef.current = true
        try {
          await connectWallet(eth)
          patchDiagnostics({ lastError: 'none' })
        } catch (e: unknown) {
          patchDiagnostics({ lastError: formatEthError(e) })
        } finally {
          pendingRef.current = false
          await refreshRef.current()
        }
      }
      let disabled = isPending || deployBusy

      if (mode === 'switch_chain') {
        label = isPending ? 'Switching…' : 'Switch to BNB Testnet'
        execute = async () => {
          const eth = getEthereum()
          if (!eth || pendingRef.current) return
          pendingRef.current = true
          try {
            await switchToTestnet(eth)
            patchDiagnostics({ lastError: 'none' })
          } catch (e: unknown) {
            patchDiagnostics({ lastError: formatEthError(e) })
          } finally {
            pendingRef.current = false
            await refreshRef.current()
          }
        }
      }

      if (mode === 'deploy_wrapper') {
        label = isPending
          ? 'Deploying…'
          : deployBusy
            ? 'Deploy Pending…'
            : 'Deploy Wrapper'
        execute = async () => {
          const eth = getEthereum()
          if (!eth || pendingRef.current || deployBusy) return
          pendingRef.current = true
          patchDiagnostics({
            deployStatus: 'preparing',
            lastError: 'none',
            actionStatus: 'deploy_wrapper',
            wrapperAddress: undefined,
            txHash: undefined,
            receiptStatus: undefined,
            gasUsed: undefined,
            failureReason: undefined,
            verification: undefined,
            verificationPass: undefined,
          })
          publishAction('deploy_wrapper')
          try {
            await deployWrapperWithWallet(eth, {
              onStatus: (s: DeployStatus) => patchDiagnostics({ deployStatus: s }),
              onGasPreview: (estimate, limit) =>
                patchDiagnostics({ gasEstimate: estimate, gasLimit: limit }),
              onTxHash: (hash) => patchDiagnostics({ txHash: hash, deployStatus: 'submitted' }),
              onReceipt: (receipt) => {
                patchDiagnostics({
                  receiptStatus: receipt.success ? 'success' : 'failed',
                  gasUsed: receipt.gasUsed ?? undefined,
                  failureReason: receipt.failureReason ?? undefined,
                  wrapperAddress: receipt.success ? receipt.contractAddress ?? undefined : undefined,
                })
              },
              onVerification: (v) =>
                patchDiagnostics({
                  verification: JSON.stringify(v, null, 2),
                  verificationPass: v.pass ? 'YES' : 'NO',
                }),
            })
            patchDiagnostics({ lastError: 'none' })
          } catch (e: unknown) {
            const msg = formatEthError(e)
            console.error(`${LOG} deploy error`, msg)
            const receiptOk = diagnosticsRef.current.receiptStatus === 'success'
            patchDiagnostics({
              lastError: msg,
              deployStatus: diagnosticsRef.current.deployStatus === 'verified' ? 'verified' : 'failed',
              failureReason: receiptOk ? msg : diagnosticsRef.current.failureReason ?? msg,
              receiptStatus: receiptOk ? 'success' : diagnosticsRef.current.receiptStatus ?? 'failed',
              wrapperAddress: receiptOk ? diagnosticsRef.current.wrapperAddress : undefined,
            })
          } finally {
            pendingRef.current = false
            await refreshRef.current()
          }
        }
        disabled = isPending || deployBusy
      }

      onActionUpdateRef.current({ status: mode, label, execute, disabled })
      patchDiagnostics({ actionStatus: mode })
    },
    [patchDiagnostics],
  )

  const refreshRef = useRef<() => Promise<void>>(async () => {})

  refreshRef.current = async () => {
    if (pendingRef.current) return
    const eth = getEthereum()
    if (!eth) {
      patchDiagnostics({
        walletStatus: 'no injected wallet',
        chainStatus: 'no provider',
        detectedChainId: null,
        chainMatch: false,
        expectedChainId: WRAPPER_DEPLOY_CHAIN_ID,
      })
      publishAction('connect_wallet')
      return
    }

    try {
      const { account, chainId } = await readWalletChain(eth)
      const chainMatch = isBnbTestnetChain(chainId)
      const walletStatus = account ? `connected: ${account}` : 'not connected'
      const chainStatus =
        chainId === null
          ? 'no chain detected'
          : chainMatch
            ? `BNB Testnet (${chainId})`
            : `wrong chain (${chainId}) — switch to ${WRAPPER_DEPLOY_CHAIN_ID}`

      patchDiagnostics({
        walletStatus,
        chainStatus,
        expectedChainId: WRAPPER_DEPLOY_CHAIN_ID,
        detectedChainId: chainId,
        chainMatch,
      })

      if (!account) publishAction('connect_wallet')
      else if (!chainMatch) publishAction('switch_chain')
      else publishAction('deploy_wrapper')
    } catch (e: unknown) {
      patchDiagnostics({ lastError: formatEthError(e) })
    }
  }

  useEffect(() => {
    console.log(`${LOG} page mounted`)
    ;(async () => {
      try {
        const artifact = await loadCreationArtifact()
        const preview = buildConstructorPreview(artifact)
        patchDiagnostics({
          constructorPreview: JSON.stringify(
            {
              underlyingRouter: preview.underlyingRouter,
              treasuryIntake: preview.treasuryIntake,
              marcoToken: preview.marcoToken,
              pricingRefHash: preview.pricingRefHash,
              treasuryPolicyRefHash: preview.treasuryPolicyRefHash,
              owner: preview.owner,
              bytecodeHash: preview.bytecodeHash,
              deployDataLength: preview.deployDataLength,
            },
            null,
            2,
          ),
        })
      } catch (e: unknown) {
        patchDiagnostics({ lastError: formatEthError(e) })
      }
      await refreshRef.current()
    })()

    const eth = getEthereum()
    const onChange = () => refreshRef.current()
    eth?.on?.('accountsChanged', onChange)
    eth?.on?.('chainChanged', onChange)
    return () => {
      eth?.removeListener?.('accountsChanged', onChange)
      eth?.removeListener?.('chainChanged', onChange)
    }
  }, [patchDiagnostics, publishAction])

  return null
}
