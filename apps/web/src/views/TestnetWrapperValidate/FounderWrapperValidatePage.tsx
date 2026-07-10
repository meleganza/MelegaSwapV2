import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ADDR,
  ROUTES,
  WRAPPER_ADDRESS,
  txExplorerUrl,
  addressExplorerUrl,
  type RouteId,
} from './wrapperValidateConfig'
import type { RouteValidationResult, RouteSwapStatus, LiquidityStatus } from './wrapperValidateActions'
import { computeFeePreview } from './wrapperValidateActions'

export type ValidateDiagnostics = {
  pageRendered: string
  walletStatus: string
  chainStatus: string
  actionStatus: string
  expectedChainId: number
  detectedChainId: number | null
  chainMatch: boolean
  lastError: string
  runtimeNote: string
  routeStatuses: Partial<Record<RouteId, RouteSwapStatus>>
  routeTxHashes: Partial<Record<RouteId, string>>
  routePass: Partial<Record<RouteId, string>>
  routeResults: Partial<Record<RouteId, RouteValidationResult>>
  liquidity: Partial<Record<RouteId, LiquidityStatus>>
  standardSwapBlocked?: string
  validationReport?: string
  validationVerdict?: string
}

export type RouteAction = { label: string; disabled: boolean; execute: () => void }
export type WalletAction = { label: string; disabled: boolean; execute: () => void }

const DEFAULT_DIAGNOSTICS: ValidateDiagnostics = {
  pageRendered: 'YES',
  walletStatus: 'pending (post-paint)',
  chainStatus: 'pending (post-paint)',
  actionStatus: 'connect_wallet',
  expectedChainId: 97,
  detectedChainId: null,
  chainMatch: false,
  lastError: 'none',
  runtimeNote: 'static shell loaded',
  routeStatuses: {},
  routeTxHashes: {},
  routePass: {},
  routeResults: {},
  liquidity: {},
}

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
  maxWidth: 720,
  margin: '0 auto',
  background: 'linear-gradient(145deg, #1a1a00 0%, #0d0d00 100%)',
  border: '3px solid #d4af37',
  borderRadius: 12,
  padding: '24px 20px',
  boxShadow: '0 0 40px rgba(212, 175, 55, 0.25)',
}

const routeCardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  background: '#111',
  border: '1px solid #555',
  borderRadius: 8,
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

const inputStyle: React.CSSProperties = {
  fontFamily: 'ui-monospace, Menlo, monospace',
  fontSize: 14,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d4af37',
  background: '#111',
  color: '#fff8dc',
  width: '100%',
  boxSizing: 'border-box',
}

const panelStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 10,
  background: '#0a0a0a',
  border: '1px solid #444',
  borderRadius: 6,
  fontSize: 11,
  lineHeight: 1.5,
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

const passStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  background: '#0d2b0d',
  border: '1px solid #4caf50',
  color: '#a5d6a7',
  fontSize: 12,
  fontWeight: 700,
}

const failStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  background: '#2b0d0d',
  border: '1px solid #f44336',
  color: '#ef9a9a',
  fontSize: 12,
  fontWeight: 700,
}

const btnStyle: React.CSSProperties = {
  marginTop: 10,
  width: '100%',
  padding: '12px 16px',
  fontSize: 15,
  fontWeight: 700,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  background: '#d4af37',
  color: '#0a0a0a',
}

const linkStyle: React.CSSProperties = { color: '#ffd966', textDecoration: 'underline' }

type ShellProps = {
  diagnostics: ValidateDiagnostics
  amounts: Record<RouteId, string>
  onAmountChange: (routeId: RouteId, value: string) => void
  routeActions: Partial<Record<RouteId, RouteAction>>
  walletAction: WalletAction | null
}

function FounderWrapperValidateShell({
  diagnostics,
  amounts,
  onAmountChange,
  routeActions,
  walletAction,
}: ShellProps) {
  const ready = diagnostics.actionStatus === 'ready'

  return (
    <div id="r746e-validate-root" style={rootStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#d4af37' }}>Wrapper Validate</h1>
        <p style={{ margin: '0 0 16px', color: '#ccc', fontSize: 15 }}>
          Constitutional swap ceremony — BNB Testnet (97)
        </p>

        <div style={warnStyle}>Founder-only. MetaMask signs swaps. Registry is not updated here.</div>

        <div style={{ marginTop: 16 }}>
          <div style={rowStyle}>
            <span style={labelStyle}>Wrapper</span>
            <a href={addressExplorerUrl(WRAPPER_ADDRESS)} target="_blank" rel="noreferrer" style={linkStyle}>
              <span style={monoStyle}>{WRAPPER_ADDRESS}</span>
            </a>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>MARCO</span>
            <span style={monoStyle}>{ADDR.marco}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Treasury Intake</span>
            <span style={monoStyle}>{ADDR.treasuryIntake}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>MARCO/WBNB Pair</span>
            <a href={addressExplorerUrl(ADDR.pairMarcoWbnb)} target="_blank" rel="noreferrer" style={linkStyle}>
              <span style={monoStyle}>{ADDR.pairMarcoWbnb}</span>
            </a>
          </div>
        </div>

        {!ready && walletAction && (
          <button
            type="button"
            style={{
              ...btnStyle,
              marginTop: 20,
              opacity: walletAction.disabled ? 0.55 : 1,
              cursor: walletAction.disabled ? 'not-allowed' : 'pointer',
            }}
            disabled={walletAction.disabled}
            onClick={walletAction.execute}
          >
            {walletAction.label}
          </button>
        )}

        {ROUTES.map((route) => {
          const liq = diagnostics.liquidity[route.id]
          const blocked = liq && !liq.available
          const action = routeActions[route.id]
          const pass = diagnostics.routePass[route.id]
          const txHash = diagnostics.routeTxHashes[route.id]
          const result = diagnostics.routeResults[route.id]
          const busy = ['preparing', 'wallet_open', 'submitted'].includes(
            diagnostics.routeStatuses[route.id] ?? '',
          )
          const preview = computeFeePreview(amounts[route.id], route.expectedFeeBps)

          return (
            <div key={route.id} id={`r746e-route-${route.id}`} style={routeCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <strong style={{ color: '#d4af37', fontSize: 16 }}>{route.title}</strong>
                {pass && (
                  <span style={pass === 'PASS' ? passStyle : failStyle}>{pass}</span>
                )}
              </div>
              <div style={{ color: '#aaa', fontSize: 13, marginBottom: 8 }}>{route.description}</div>
              {blocked && (
                <div style={{ ...warnStyle, marginTop: 8, marginBottom: 8 }}>
                  {liq?.blockerReason ?? 'BLOCKED_STANDARD_SWAP_LIQUIDITY_MISSING'}
                </div>
              )}
              {liq?.available && liq.pairAddress && (
                <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                  Liquidity pair {liq.pairAddress} — r0={liq.reserve0} r1={liq.reserve1}
                </div>
              )}
              <div style={rowStyle}>
                <span style={labelStyle}>{route.inputLabel}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amounts[route.id]}
                  onChange={(e) => onAmountChange(route.id, e.target.value)}
                  disabled={busy}
                  style={inputStyle}
                />
              </div>
              <div style={{ fontSize: 12, color: '#ccc', marginBottom: 8 }}>
                Expected fee: {route.expectedFeeBps} bps ({preview.feeHuman}) · Net: {preview.netHuman}
                {!route.inputIsNative && route.inputToken && (
                  <span> · Approval to wrapper may be required</span>
                )}
              </div>
              {ready && action && (
                <button
                  type="button"
                  style={{
                    ...btnStyle,
                    opacity: action.disabled ? 0.55 : 1,
                    cursor: action.disabled ? 'not-allowed' : 'pointer',
                  }}
                  disabled={action.disabled}
                  onClick={action.execute}
                >
                  {action.label}
                </button>
              )}
              {txHash && (
                <div style={panelStyle}>
                  <strong>Tx:</strong>{' '}
                  <a href={txExplorerUrl(txHash)} target="_blank" rel="noreferrer" style={linkStyle}>
                    {txHash}
                  </a>
                </div>
              )}
              {result && (
                <div style={panelStyle}>
                  <div>
                    <strong>Status:</strong> {diagnostics.routeStatuses[route.id] ?? 'idle'}
                  </div>
                  {result.executionMethod && (
                    <div>
                      <strong>Execution path:</strong> {result.executionMethod}
                    </div>
                  )}
                  {result.revertReason && (
                    <div style={{ color: '#ef9a9a' }}>
                      <strong>Revert:</strong> {result.revertReason}
                    </div>
                  )}
                  {result.treasuryDelta && (
                    <div>
                      <strong>Treasury delta:</strong> {result.treasuryDelta}
                    </div>
                  )}
                  {result.actualFeeBps != null && (
                    <div>
                      <strong>Fee bps:</strong> {result.actualFeeBps} (expected {result.expectedFeeBps})
                    </div>
                  )}
                  {result.failures.length > 0 && (
                    <div style={{ color: '#ef9a9a' }}>
                      <strong>Failures:</strong> {result.failures.join('; ')}
                    </div>
                  )}
                  {result.events.protocolFeeCollected && (
                    <div style={{ marginTop: 6 }}>
                      <strong>ProtocolFeeCollected:</strong>
                      {JSON.stringify(result.events.protocolFeeCollected, null, 2)}
                    </div>
                  )}
                  {result.events.smartRouterSwapRouted && (
                    <div style={{ marginTop: 6 }}>
                      <strong>SmartRouterSwapRouted:</strong>
                      {JSON.stringify(result.events.smartRouterSwapRouted, null, 2)}
                    </div>
                  )}
                  {result.events.treasuryHandoffPrepared && (
                    <div style={{ marginTop: 6 }}>
                      <strong>TreasuryHandoffPrepared:</strong>
                      {JSON.stringify(result.events.treasuryHandoffPrepared, null, 2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {diagnostics.validationReport && (
          <div id="r746e-validation-report" style={{ ...panelStyle, marginTop: 20 }}>
            <div style={{ color: '#d4af37', fontWeight: 700, marginBottom: 8 }}>
              Validation Report — {diagnostics.validationVerdict}
            </div>
            {diagnostics.validationReport}
          </div>
        )}

        <div id="r746e-diagnostics" style={diagStyle}>
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
          {diagnostics.standardSwapBlocked && (
            <div>
              <strong>STANDARD_SWAP_BLOCKER:</strong> {diagnostics.standardSwapBlocked}
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

const FounderRuntime = dynamic(() => import('./FounderWrapperValidateRuntime'), {
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
    console.error('[R746E] error', error)
    this.props.onCrash(error?.message ?? 'unknown runtime error')
  }

  render() {
    if (this.state.crashed) return null
    return this.props.children
  }
}

const defaultAmounts = (): Record<RouteId, string> => ({
  BUY_MARCO: ROUTES.find((r) => r.id === 'BUY_MARCO')!.defaultAmount,
  SELL_MARCO: ROUTES.find((r) => r.id === 'SELL_MARCO')!.defaultAmount,
  STANDARD_SWAP: ROUTES.find((r) => r.id === 'STANDARD_SWAP')!.defaultAmount,
})

export default function FounderWrapperValidatePage() {
  const [diagnostics, setDiagnostics] = useState<ValidateDiagnostics>(DEFAULT_DIAGNOSTICS)
  const [amounts, setAmounts] = useState<Record<RouteId, string>>(defaultAmounts)
  const [runtimeEnabled, setRuntimeEnabled] = useState(false)
  const [runtimeCrashed, setRuntimeCrashed] = useState(false)
  const [routeActions, setRouteActions] = useState<Partial<Record<RouteId, RouteAction>>>({})
  const [walletAction, setWalletAction] = useState<WalletAction | null>(null)

  useEffect(() => {
    console.log('[R746E] page mounted')
    const id = requestAnimationFrame(() => setRuntimeEnabled(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (runtimeCrashed) {
    return (
      <FounderWrapperValidateShell
        diagnostics={{
          ...DEFAULT_DIAGNOSTICS,
          walletStatus: 'runtime unavailable',
          chainStatus: 'runtime unavailable',
          lastError: diagnostics.lastError,
          runtimeNote: 'Wrapper validate page loaded — runtime unavailable',
        }}
        amounts={amounts}
        onAmountChange={(id, v) => setAmounts((a) => ({ ...a, [id]: v }))}
        routeActions={{}}
        walletAction={null}
      />
    )
  }

  return (
    <>
      <FounderWrapperValidateShell
        diagnostics={diagnostics}
        amounts={amounts}
        onAmountChange={(id, v) => setAmounts((a) => ({ ...a, [id]: v }))}
        routeActions={routeActions}
        walletAction={walletAction}
      />
      {runtimeEnabled && (
        <FounderErrorBoundary
          onCrash={(message) => {
            setRuntimeCrashed(true)
            setDiagnostics((d) => ({
              ...d,
              lastError: message,
              runtimeNote: 'Wrapper validate page loaded — runtime unavailable',
            }))
          }}
        >
          <FounderRuntime
            amounts={amounts}
            onDiagnostics={setDiagnostics}
            onRouteActions={setRouteActions}
            onWalletAction={setWalletAction}
          />
        </FounderErrorBoundary>
      )}
    </>
  )
}
