import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import {
  DEFAULT_MARCO_AMOUNT,
  DEFAULT_TBNB_AMOUNT,
  txExplorerUrl,
  addressExplorerUrl,
  type ActionStatus,
  type AddLiquidityStatus,
} from './emergencyWalletActions'
import type { ActionUpdate } from './EmergencyTestnetLiquidityRuntime'

const TESTNET_CHAIN_ID = 97

export type EmergencyDiagnostics = {
  pageRendered: string
  walletStatus: string
  chainStatus: string
  pairStatus: string
  actionStatus: ActionStatus | string
  addLiquidityStatus: AddLiquidityStatus
  lastError: string
  runtimeNote: string
  marcoAmount: string
  tbnbAmount: string
  txPreview?: string
  txHash?: string
  receiptStatus?: string
  pairAddress?: string
  reserves?: string
  lpBalance?: string
}

const DEFAULT_DIAGNOSTICS: EmergencyDiagnostics = {
  pageRendered: 'YES',
  walletStatus: 'pending (post-paint)',
  chainStatus: 'pending (post-paint)',
  pairStatus: 'pending (post-paint)',
  actionStatus: 'connect_wallet',
  addLiquidityStatus: 'idle',
  lastError: 'none',
  runtimeNote: 'static shell loaded',
  marcoAmount: DEFAULT_MARCO_AMOUNT,
  tbnbAmount: DEFAULT_TBNB_AMOUNT,
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
  maxWidth: 640,
  margin: '0 auto',
  background: 'linear-gradient(145deg, #1a1a00 0%, #0d0d00 100%)',
  border: '3px solid #F4C430',
  borderRadius: 12,
  padding: '24px 20px',
  boxShadow: '0 0 40px rgba(244, 196, 48, 0.25)',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 10,
  fontSize: 13,
}

const labelStyle: React.CSSProperties = {
  color: '#F4C430',
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

const inputStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 14,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #F4C430',
  background: '#111',
  color: '#fff8dc',
  width: '100%',
  boxSizing: 'border-box',
}

const panelStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  background: '#111',
  border: '1px solid #555',
  borderRadius: 8,
  fontSize: 12,
  lineHeight: 1.55,
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
  border: '1px solid #F4C430',
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
  background: '#F4C430',
  color: '#0a0a0a',
}

const linkStyle: React.CSSProperties = {
  color: '#ffd966',
  textDecoration: 'underline',
}

type StaticShellProps = {
  diagnostics: EmergencyDiagnostics
  warnings: string[]
  onActionClick?: () => void
  actionLabel?: string
  actionDisabled?: boolean
  amountMarco: string
  amountBnb: string
  onAmountMarcoChange: (v: string) => void
  onAmountBnbChange: (v: string) => void
}

function parsePreview(raw?: string): Record<string, unknown> | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

function EmergencyStaticShell({
  diagnostics,
  warnings,
  onActionClick,
  actionLabel,
  actionDisabled,
  amountMarco,
  amountBnb,
  onAmountMarcoChange,
  onAmountBnbChange,
}: StaticShellProps) {
  const showAmounts =
    diagnostics.actionStatus === 'add_liquidity' ||
    diagnostics.actionStatus === 'create_pair' ||
    diagnostics.actionStatus === 'approve_marco'
  const preview = parsePreview(diagnostics.txPreview)
  const addBusy = ['preparing', 'wallet_open', 'submitted'].includes(diagnostics.addLiquidityStatus)

  return (
    <div id="r745h-emergency-root" style={rootStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#F4C430' }}>Testnet Liquidity</h1>
        <p style={{ margin: '0 0 20px', color: '#ccc', fontSize: 15 }}>MARCO / WBNB — BNB Testnet</p>

        <div style={rowStyle}>
          <span style={labelStyle}>Router</span>
          <span style={monoStyle}>{ADDR.router}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Factory</span>
          <span style={monoStyle}>{ADDR.factory}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>MARCO</span>
          <span style={monoStyle}>{ADDR.marco}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>WBNB</span>
          <span style={monoStyle}>{ADDR.wbnb}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Treasury Intake</span>
          <span style={monoStyle}>{ADDR.treasuryIntake}</span>
        </div>

        {showAmounts && (
          <div style={{ marginTop: 16 }}>
            <div style={rowStyle}>
              <span style={labelStyle}>MARCO amount</span>
              <input
                id="r745k-marco-amount"
                type="text"
                inputMode="decimal"
                value={amountMarco}
                onChange={(e) => onAmountMarcoChange(e.target.value)}
                disabled={addBusy}
                style={inputStyle}
              />
            </div>
            <div style={rowStyle}>
              <span style={labelStyle}>tBNB amount</span>
              <input
                id="r745k-tbnb-amount"
                type="text"
                inputMode="decimal"
                value={amountBnb}
                onChange={(e) => onAmountBnbChange(e.target.value)}
                disabled={addBusy}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {preview && diagnostics.actionStatus === 'add_liquidity' && (
          <div id="r745k-tx-preview" style={panelStyle}>
            <div style={{ color: '#F4C430', marginBottom: 8, fontWeight: 700 }}>Transaction Preview</div>
            <div>
              <strong>MARCO amount wei:</strong> {String(preview.marcoAmountWei)}
            </div>
            <div>
              <strong>tBNB amount wei:</strong> {String(preview.tbnbAmountWei)}
            </div>
            <div>
              <strong>Router:</strong> {String(preview.router)}
            </div>
            <div>
              <strong>Token:</strong> {String(preview.token)}
            </div>
            <div>
              <strong>Recipient:</strong> {String(preview.recipient)}
            </div>
            <div>
              <strong>Deadline:</strong> {String(preview.deadline)}
            </div>
            {preview.gasEstimate != null && (
              <div>
                <strong>Gas estimate:</strong> {String(preview.gasEstimate)}
              </div>
            )}
            {preview.gasLimit != null && (
              <div>
                <strong>Gas limit:</strong> {String(preview.gasLimit)}
              </div>
            )}
          </div>
        )}

        {diagnostics.txHash && (
          <div id="r745k-tx-hash" style={panelStyle}>
            <div style={{ color: '#F4C430', marginBottom: 8, fontWeight: 700 }}>Transaction</div>
            <div style={monoStyle}>{diagnostics.txHash}</div>
            <a href={txExplorerUrl(diagnostics.txHash)} target="_blank" rel="noreferrer" style={linkStyle}>
              View on BscScan
            </a>
          </div>
        )}

        {diagnostics.receiptStatus === 'success' && (
          <div style={successStyle}>Receipt: confirmed (success)</div>
        )}
        {diagnostics.receiptStatus === 'failed' && (
          <div style={failStyle}>Receipt: failed / reverted</div>
        )}

        {(diagnostics.pairAddress || diagnostics.reserves || diagnostics.lpBalance) && (
          <div id="r745k-pair-info" style={panelStyle}>
            <div style={{ color: '#F4C430', marginBottom: 8, fontWeight: 700 }}>Pool State</div>
            {diagnostics.pairAddress && (
              <div>
                <strong>Pair:</strong>{' '}
                <a href={addressExplorerUrl(diagnostics.pairAddress)} target="_blank" rel="noreferrer" style={linkStyle}>
                  {diagnostics.pairAddress}
                </a>
              </div>
            )}
            {diagnostics.reserves && (
              <div>
                <strong>Reserves:</strong> {diagnostics.reserves}
              </div>
            )}
            {diagnostics.lpBalance != null && (
              <div>
                <strong>LP balance:</strong> {diagnostics.lpBalance}
              </div>
            )}
          </div>
        )}

        <button
          id="r745h-action"
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

        {warnings.map((w) => (
          <div key={w} style={warnStyle}>
            {w}
          </div>
        ))}

        <div id="r745h-diagnostics" style={diagStyle}>
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
            <strong>PAIR_STATUS:</strong> {diagnostics.pairStatus}
          </div>
          <div>
            <strong>ACTION_STATUS:</strong> {diagnostics.actionStatus}
          </div>
          <div>
            <strong>ADD_LIQUIDITY_STATUS:</strong> {diagnostics.addLiquidityStatus}
          </div>
          <div>
            <strong>LAST_ERROR:</strong> {diagnostics.lastError}
          </div>
          <div style={{ marginTop: 8, color: '#888' }}>{diagnostics.runtimeNote}</div>
        </div>
      </div>
    </div>
  )
}

const EmergencyRuntime = dynamic(() => import('./EmergencyTestnetLiquidityRuntime'), {
  ssr: false,
  loading: () => null,
})

type EmergencyErrorBoundaryProps = {
  children: ReactNode
  onCrash: (message: string) => void
}

type EmergencyErrorBoundaryState = { crashed: boolean; message: string }

class EmergencyErrorBoundary extends Component<EmergencyErrorBoundaryProps, EmergencyErrorBoundaryState> {
  constructor(props: EmergencyErrorBoundaryProps) {
    super(props)
    this.state = { crashed: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): EmergencyErrorBoundaryState {
    return { crashed: true, message: error?.message ?? 'unknown runtime error' }
  }

  componentDidCatch(error: Error) {
    console.error('[R745H] error', error)
    this.props.onCrash(error?.message ?? 'unknown runtime error')
  }

  render() {
    if (this.state.crashed) return null
    return this.props.children
  }
}

export default function EmergencyTestnetLiquidityPage() {
  const [diagnostics, setDiagnostics] = useState<EmergencyDiagnostics>(DEFAULT_DIAGNOSTICS)
  const [warnings, setWarnings] = useState<string[]>([])
  const [runtimeEnabled, setRuntimeEnabled] = useState(false)
  const [runtimeCrashed, setRuntimeCrashed] = useState(false)
  const [amountMarco, setAmountMarco] = useState(DEFAULT_MARCO_AMOUNT)
  const [amountBnb, setAmountBnb] = useState(DEFAULT_TBNB_AMOUNT)
  const [action, setAction] = useState<ActionUpdate>({
    status: 'connect_wallet',
    label: 'Connect Wallet',
    execute: () => undefined,
    disabled: false,
  })
  const actionRef = useRef(action)
  actionRef.current = action

  useEffect(() => {
    console.log('[R745K] page mounted')
    const id = requestAnimationFrame(() => {
      setRuntimeEnabled(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  if (runtimeCrashed) {
    return (
      <EmergencyStaticShell
        diagnostics={{
          ...DEFAULT_DIAGNOSTICS,
          walletStatus: 'runtime unavailable',
          chainStatus: 'runtime unavailable',
          pairStatus: 'runtime unavailable',
          lastError: diagnostics.lastError,
          runtimeNote: 'Emergency page loaded — runtime unavailable',
        }}
        warnings={['Switch MetaMask to BNB Testnet.', ...warnings]}
        amountMarco={amountMarco}
        amountBnb={amountBnb}
        onAmountMarcoChange={setAmountMarco}
        onAmountBnbChange={setAmountBnb}
      />
    )
  }

  return (
    <>
      <EmergencyStaticShell
        diagnostics={diagnostics}
        warnings={warnings}
        onActionClick={() => actionRef.current.execute()}
        actionLabel={action.label}
        actionDisabled={action.disabled}
        amountMarco={amountMarco}
        amountBnb={amountBnb}
        onAmountMarcoChange={setAmountMarco}
        onAmountBnbChange={setAmountBnb}
      />
      {runtimeEnabled && (
        <EmergencyErrorBoundary
          onCrash={(message) => {
            setRuntimeCrashed(true)
            setDiagnostics((d) => ({
              ...d,
              lastError: message,
              runtimeNote: 'Emergency page loaded — runtime unavailable',
            }))
          }}
        >
          <EmergencyRuntime
            chainIdTarget={TESTNET_CHAIN_ID}
            amountMarco={amountMarco}
            amountBnb={amountBnb}
            onDiagnostics={setDiagnostics}
            onWarnings={setWarnings}
            onActionUpdate={setAction}
          />
        </EmergencyErrorBoundary>
      )}
    </>
  )
}
