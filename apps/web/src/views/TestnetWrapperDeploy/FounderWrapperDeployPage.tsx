import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { addressExplorerUrl, txExplorerUrl } from './wrapperDeployConfig'
import type { DeployStatus } from './wrapperDeployActions'
import type { ActionUpdate } from './FounderWrapperDeployRuntime'

export type WrapperDeployDiagnostics = {
  pageRendered: string
  walletStatus: string
  chainStatus: string
  deployStatus: DeployStatus
  actionStatus: string
  expectedChainId: number
  detectedChainId: number | null
  chainMatch: boolean
  lastError: string
  runtimeNote: string
  constructorPreview?: string
  gasEstimate?: string
  gasLimit?: string
  txHash?: string
  receiptStatus?: string
  gasUsed?: string
  failureReason?: string
  wrapperAddress?: string
  verification?: string
  verificationPass?: string
}

const DEFAULT_DIAGNOSTICS: WrapperDeployDiagnostics = {
  pageRendered: 'YES',
  walletStatus: 'pending (post-paint)',
  chainStatus: 'pending (post-paint)',
  deployStatus: 'idle',
  actionStatus: 'connect_wallet',
  expectedChainId: 97,
  detectedChainId: null,
  chainMatch: false,
  lastError: 'none',
  runtimeNote: 'static shell loaded',
}

const ADDR = BSC_TESTNET_ADDRESSES

const rootStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 999999,
  overflow: 'auto',
  background: '#0f0f0f',
  color: '#f5f5f5',
  fontFamily: 'Inter, system-ui, sans-serif',
  padding: '24px 16px 48px',
}

const cardStyle: React.CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  background: 'linear-gradient(145deg, #1a1a00 0%, #0d0d00 100%)',
  border: '3px solid #d4af37',
  borderRadius: 12,
  padding: '24px 20px',
  boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 10,
  fontSize: 13,
}

const labelStyle: React.CSSProperties = {
  color: '#d4af37',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 12,
  wordBreak: 'break-all',
  color: '#fff8dc',
}

const panelStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#111',
  border: '1px solid #555',
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.55,
  whiteSpace: 'pre-wrap',
}

const diagStyle: React.CSSProperties = {
  marginTop: 20,
  padding: 14,
  background: '#000',
  border: '1px solid #444',
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.6,
}

const warnStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#3d2800',
  border: '1px solid #d4af37',
  borderRadius: 8,
  color: '#ffd966',
  fontSize: 14,
}

const successStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#0d2b0d',
  border: '1px solid #4caf50',
  borderRadius: 8,
  color: '#a5d6a7',
  fontSize: 14,
}

const failStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#2b0d0d',
  border: '1px solid #f44336',
  borderRadius: 8,
  color: '#ef9a9a',
  fontSize: 14,
}

const btnStyle: React.CSSProperties = {
  marginTop: 20,
  width: '100%',
  padding: '16px 20px',
  fontSize: 17,
  fontWeight: 700,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  background: '#d4af37',
  color: '#0a0a0a',
}

const linkStyle: React.CSSProperties = {
  color: '#ffd966',
  textDecoration: 'underline',
}

function parsePreview(raw?: string): Record<string, unknown> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

type ShellProps = {
  diagnostics: WrapperDeployDiagnostics
  onActionClick?: () => void
  actionLabel?: string
  actionDisabled?: boolean
}

function FounderWrapperDeployShell({ diagnostics, onActionClick, actionLabel, actionDisabled }: ShellProps) {
  const preview = parsePreview(diagnostics.constructorPreview)
  const deployBusy = ['preparing', 'wallet_open', 'submitted'].includes(diagnostics.deployStatus)

  return (
    <div id="r746b-wrapper-deploy-root" style={rootStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#d4af37' }}>Wrapper Deploy</h1>
        <p style={{ margin: '0 0 20px', color: '#ccc', fontSize: 15 }}>
          MelegaSmartRouterWrapper — BNB Testnet (97) founder ceremony
        </p>

        <div style={warnStyle}>
          Founder-only temporary page. MetaMask signs deploy. Registry and frontend routing are not updated here.
        </div>

        {preview && (
          <div id="r746b-constructor-preview" style={panelStyle}>
            <div style={{ color: '#d4af37', marginBottom: 8, fontWeight: 700 }}>Constructor Preview</div>
            <div>
              <strong>underlyingRouter:</strong> {String(preview.underlyingRouter)}
            </div>
            <div>
              <strong>treasuryIntake:</strong> {String(preview.treasuryIntake)}
            </div>
            <div>
              <strong>marcoToken:</strong> {String(preview.marcoToken)}
            </div>
            <div>
              <strong>pricingRefHash:</strong> {String(preview.pricingRefHash)}
            </div>
            <div>
              <strong>treasuryPolicyRefHash:</strong> {String(preview.treasuryPolicyRefHash)}
            </div>
            <div>
              <strong>owner:</strong> {String(preview.owner)}
            </div>
            <div>
              <strong>bytecodeHash:</strong> {String(preview.bytecodeHash)}
            </div>
            <div>
              <strong>deployDataLength:</strong> {String(preview.deployDataLength)} chars
            </div>
            {diagnostics.gasEstimate && (
              <div>
                <strong>gasEstimate:</strong> {diagnostics.gasEstimate}
              </div>
            )}
            {diagnostics.gasLimit && (
              <div>
                <strong>gasLimit:</strong> {diagnostics.gasLimit}
              </div>
            )}
          </div>
        )}

        {diagnostics.txHash && (
          <div id="r746b-tx-hash" style={panelStyle}>
            <div style={{ color: '#d4af37', marginBottom: 8, fontWeight: 700 }}>Deploy Transaction</div>
            <div style={monoStyle}>{diagnostics.txHash}</div>
            <a href={txExplorerUrl(diagnostics.txHash)} target="_blank" rel="noreferrer" style={linkStyle}>
              View on BscScan Testnet
            </a>
          </div>
        )}

        {diagnostics.wrapperAddress && diagnostics.receiptStatus === 'success' && (
          <div id="r746b-wrapper-address" style={panelStyle}>
            <div style={{ color: '#d4af37', marginBottom: 8, fontWeight: 700 }}>Wrapper Address (confirmed)</div>
            <div style={monoStyle}>{diagnostics.wrapperAddress}</div>
            <a
              href={addressExplorerUrl(diagnostics.wrapperAddress)}
              target="_blank"
              rel="noreferrer"
              style={linkStyle}
            >
              View contract on BscScan Testnet
            </a>
          </div>
        )}

        {diagnostics.receiptStatus === 'success' && (
          <div style={successStyle}>
            Receipt: confirmed (success)
            {diagnostics.gasUsed ? ` — gasUsed ${diagnostics.gasUsed}` : ''}
          </div>
        )}
        {diagnostics.receiptStatus === 'failed' && (
          <div style={failStyle}>
            Deployment reverted
            {diagnostics.failureReason ? ` — ${diagnostics.failureReason}` : ''}
          </div>
        )}

        {diagnostics.verification && diagnostics.receiptStatus === 'success' && (
          <div id="r746b-verification" style={panelStyle}>
            <div style={{ color: '#d4af37', marginBottom: 8, fontWeight: 700 }}>
              Immutable Verification {diagnostics.verificationPass === 'YES' ? '✓ PASS' : ''}
            </div>
            {diagnostics.verification}
          </div>
        )}

        <button
          id="r746b-action"
          type="button"
          style={{
            ...btnStyle,
            opacity: actionDisabled ? 0.55 : 1,
            cursor: actionDisabled ? 'not-allowed' : 'pointer',
          }}
          onClick={onActionClick}
          disabled={actionDisabled}
        >
          {actionLabel ?? 'Connect Wallet'}
        </button>

        {deployBusy && (
          <div style={{ ...warnStyle, marginTop: 12 }}>Deploy in progress — confirm in MetaMask and wait for receipt.</div>
        )}

        <div style={rowStyle}>
          <span style={labelStyle}>Explorer</span>
          <span style={monoStyle}>{ADDR.explorer}</span>
        </div>

        <div id="r746b-diagnostics" style={diagStyle}>
          <div>
            <strong>PAGE_RENDERED:</strong> {diagnostics.pageRendered}
          </div>
          <div>
            <strong>WALLET_STATUS:</strong> {diagnostics.walletStatus}
          </div>
          <div>
            <strong>CHAIN_STATUS:</strong> {diagnostics.chainStatus}
          </div>
          <div>
            <strong>EXPECTED_CHAIN_ID:</strong> {diagnostics.expectedChainId}
          </div>
          <div>
            <strong>DETECTED_CHAIN_ID:</strong>{' '}
            {diagnostics.detectedChainId === null ? 'null' : diagnostics.detectedChainId}
          </div>
          <div>
            <strong>CHAIN_MATCH:</strong> {String(diagnostics.chainMatch)}
          </div>
          <div>
            <strong>ACTION_STATUS:</strong> {diagnostics.actionStatus}
          </div>
          <div>
            <strong>DEPLOY_STATUS:</strong> {diagnostics.deployStatus}
          </div>
          <div>
            <strong>RECEIPT_STATUS:</strong> {diagnostics.receiptStatus ?? 'none'}
          </div>
          {diagnostics.gasUsed && (
            <div>
              <strong>GAS_USED:</strong> {diagnostics.gasUsed}
            </div>
          )}
          {diagnostics.failureReason && (
            <div>
              <strong>FAILURE_REASON:</strong> {diagnostics.failureReason}
            </div>
          )}
          <div>
            <strong>LAST_ERROR:</strong> {diagnostics.lastError}
          </div>
          <div style={{ marginTop: 8, color: '#888' }}>{diagnostics.runtimeNote}</div>
        </div>
      </div>
    </div>
  )
}

const FounderRuntime = dynamic(() => import('./FounderWrapperDeployRuntime'), {
  ssr: false,
  loading: () => null,
})

type BoundaryProps = { children: ReactNode; onCrash: (message: string) => void }
type BoundaryState = { crashed: boolean; message: string }

class FounderErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props)
    this.state = { crashed: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { crashed: true, message: error?.message ?? 'unknown runtime error' }
  }

  componentDidCatch(error: Error) {
    console.error('[R746B] error', error)
    this.props.onCrash(error?.message ?? 'unknown runtime error')
  }

  render() {
    if (this.state.crashed) return null
    return this.props.children
  }
}

export default function FounderWrapperDeployPage() {
  const [diagnostics, setDiagnostics] = useState<WrapperDeployDiagnostics>(DEFAULT_DIAGNOSTICS)
  const [runtimeEnabled, setRuntimeEnabled] = useState(false)
  const [runtimeCrashed, setRuntimeCrashed] = useState(false)
  const [action, setAction] = useState<ActionUpdate>({
    status: 'connect_wallet',
    label: 'Connect Wallet',
    execute: () => undefined,
    disabled: false,
  })
  const actionRef = useRef(action)
  actionRef.current = action

  useEffect(() => {
    console.log('[R746C] page mounted')
    const id = requestAnimationFrame(() => setRuntimeEnabled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (runtimeCrashed) {
    return (
      <FounderWrapperDeployShell
        diagnostics={{
          ...DEFAULT_DIAGNOSTICS,
          walletStatus: 'runtime unavailable',
          chainStatus: 'runtime unavailable',
          lastError: diagnostics.lastError,
          runtimeNote: 'Wrapper deploy page loaded — runtime unavailable',
        }}
      />
    )
  }

  return (
    <>
      <FounderWrapperDeployShell
        diagnostics={diagnostics}
        onActionClick={() => actionRef.current.execute()}
        actionLabel={action.label}
        actionDisabled={action.disabled}
      />
      {runtimeEnabled && (
        <FounderErrorBoundary
          onCrash={(message) => {
            setRuntimeCrashed(true)
            setDiagnostics((d) => ({
              ...d,
              lastError: message,
              runtimeNote: 'Wrapper deploy page loaded — runtime unavailable',
            }))
          }}
        >
          <FounderRuntime onDiagnostics={setDiagnostics} onActionUpdate={setAction} />
        </FounderErrorBoundary>
      )}
    </>
  )
}
