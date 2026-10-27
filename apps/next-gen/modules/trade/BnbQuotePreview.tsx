import React from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { BNB_QUOTE_TOKENS, formatUnits } from '../../lib/bscQuote'
import type { SealedPreparation } from '../../lib/sealedPrepare'
import type { PortfolioRead } from '../../lib/portfolioRead'
import { readGenerationCurrent } from '../../lib/readGeneration'
import { TokenMark } from '../../components/TokenMark'

const DEFAULT_SLIPPAGE_BPS = 50

function trimAmount(value: string): string {
  const [whole, fraction = ''] = value.split('.')
  const trimmed = fraction.replace(/0+$/, '').slice(0, 8)
  return trimmed ? `${whole}.${trimmed}` : whole
}

function percentOf(raw: string, percent: number): string {
  return trimAmount(formatUnits(((BigInt(raw) * BigInt(percent)) / BigInt(100)).toString(), 18))
}

function displayPreparation(result: SealedPreparation): string {
  return result.amountOutRaw ? formatUnits(result.amountOutRaw, 18) : '0.00'
}

export function QuoteResultView({ result }: { result: SealedPreparation }) {
  if (!result.ok && result.code !== 'ALLOWANCE_SHORT') {
    return <p className="inline-alert" role="status" data-operational="false" data-executable="false">{result.code === 'CHAIN_MISMATCH' ? 'Switch to BNB Chain.' : 'No canonical SmartSwap quote is available.'}</p>
  }
  return (
    <div data-operational="false" data-executable="false" data-broadcast="false" data-signed="false" data-quote="canonical-smartswap">
      <div className="quote-result-main"><small>{result.venueLabel ?? 'SmartSwap V2'}</small><strong>{displayPreparation(result)}</strong></div>
      <details className="advanced-details"><summary>Analytics</summary><ul className="result-list">
        <li>SmartSwap fee: {result.feeBps === null ? 'unavailable' : `${result.feeBps} bps`}</li>
        <li>Fee amount: {result.feeAmountRaw === null ? 'unavailable' : formatUnits(result.feeAmountRaw, 18)}</li>
        <li>Slippage: {result.slippageBps === null ? 'unavailable' : `${result.slippageBps / 100}%`}</li>
        <li>Allowance: {result.code === 'ALLOWANCE_SHORT' ? 'approval required on live execution' : 'sufficient'}</li>
        <li>Unsigned plan prepared: {result.unsignedTx || result.approvalTx ? 'yes' : 'no'}</li>
      </ul></details>
    </div>
  )
}

export default function BnbQuotePreview() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [sell, setSell] = React.useState('WBNB')
  const [buy, setBuy] = React.useState('USDT')
  const [amount, setAmount] = React.useState('0.01')
  const [result, setResult] = React.useState<SealedPreparation | null>(null)
  const [balances, setBalances] = React.useState<PortfolioRead | null>(null)
  const [pending, setPending] = React.useState(false)
  const generation = React.useRef(0)
  const abortRef = React.useRef<AbortController | null>(null)
  const balanceAbortRef = React.useRef<AbortController | null>(null)
  const [copied, setCopied] = React.useState<string | null>(null)

  const sellToken = BNB_QUOTE_TOKENS.find((token) => token.symbol === sell)!
  const buyToken = BNB_QUOTE_TOKENS.find((token) => token.symbol === buy)!
  const sellBalance = balances?.assets.find((asset) => asset.symbol === sell)

  function invalidateQuote() {
    abortRef.current?.abort()
    generation.current += 1
    setResult(null)
    setPending(false)
  }

  React.useEffect(() => {
    invalidateQuote()
    balanceAbortRef.current?.abort()
    setBalances(null)
    if (!isConnected || !address || chain?.id !== 56) return
    const controller = new AbortController()
    balanceAbortRef.current = controller
    fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ address, chainId: chain.id }),
      signal: controller.signal,
    }).then((response) => response.json()).then((body: PortfolioRead) => {
      if (!controller.signal.aborted) setBalances(body)
    }).catch(() => undefined)
    return () => controller.abort()
  }, [address, chain?.id, isConnected])

  function copyContract(symbol: string, tokenAddress: string) {
    navigator.clipboard?.writeText(tokenAddress).then(() => setCopied(symbol)).catch(() => setCopied(null))
  }

  function editQuote(apply: () => void) {
    invalidateQuote()
    apply()
  }

  async function onPreview() {
    if (!address || chain?.id !== 56) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const issued = generation.current + 1
    generation.current = issued
    setResult(null)
    setPending(true)
    try {
      const response = await fetch('/api/sealed-prepare', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: chain.id, sell, buy, amount, user: address, slippageBps: DEFAULT_SLIPPAGE_BPS }),
        signal: controller.signal,
      })
      if (!readGenerationCurrent(issued, generation.current)) return
      setResult((await response.json()) as SealedPreparation)
    } catch {
      if (!readGenerationCurrent(issued, generation.current) || controller.signal.aborted) return
      setResult(null)
    } finally {
      if (readGenerationCurrent(issued, generation.current)) setPending(false)
    }
  }

  const primaryLabel = !isConnected ? 'Connect wallet above' : chain?.id !== 56 ? 'Switch to BNB Chain' : pending ? 'Preparing quote…' : 'Get SmartSwap quote'

  return (
    <section className="quote-panel compact-swap" aria-labelledby="quote-title">
      <h2 id="quote-title" className="sr-only">Swap quote</h2>
      <div className="asset-field interactive-asset">
        <label htmlFor="quote-amount" className="field-label">Sell</label>
        <input id="quote-amount" className="asset-amount" inputMode="decimal" value={amount} onChange={(event) => editQuote(() => setAmount(event.target.value))} aria-label="Amount to sell" />
        <label className="token-select"><TokenMark symbol={sell} address={sellToken.address} /><span className="token-symbol">{sell}</span><span className="token-chevron">⌄</span><span className="sr-only">Sell token</span><select id="quote-sell" value={sell} onChange={(event) => editQuote(() => setSell(event.target.value))}>
          {BNB_QUOTE_TOKENS.filter((token) => token.symbol !== buy).map((token) => <option key={token.symbol} value={token.symbol}>{token.symbol}</option>)}
        </select></label>
        <div className="amount-presets" aria-label="Amount presets">{[25, 50, 75, 100].map((percent) => <button key={percent} type="button" disabled={!sellBalance?.raw} onClick={() => editQuote(() => setAmount(percentOf(sellBalance!.raw!, percent)))}>{percent}%</button>)}</div>
        <div className="token-utilities"><button type="button" onClick={() => copyContract(sellToken.symbol, sellToken.address)}>{copied === sell ? 'Copied' : 'Copy contract'}</button><span className="wallet-balance">{sellBalance?.display === null || sellBalance?.display === undefined ? 'Balance —' : `Balance ${trimAmount(sellBalance.display)}`}</span></div>
      </div>
      <button className="swap-direction" type="button" aria-label="Switch tokens" onClick={() => editQuote(() => { setSell(buy); setBuy(sell) })}>↓</button>
      <div className="asset-field asset-field-output interactive-asset">
        <span className="field-label">Buy</span><strong>{result ? displayPreparation(result) : '0.00'}</strong>
        <label className="token-select token-select-buy"><TokenMark symbol={buy} address={buyToken.address} /><span className="token-symbol">{buy}</span><span className="token-chevron">⌄</span><span className="sr-only">Buy token</span><select id="quote-buy" value={buy} onChange={(event) => editQuote(() => setBuy(event.target.value))}>
          {BNB_QUOTE_TOKENS.filter((token) => token.symbol !== sell).map((token) => <option key={token.symbol} value={token.symbol}>{token.symbol}</option>)}
        </select></label>
        <div className="token-utilities buy-utilities"><button type="button" onClick={() => copyContract(buyToken.symbol, buyToken.address)}>{copied === buy ? 'Copied' : 'Copy contract'}</button></div>
      </div>
      <button className="primary-action" type="button" onClick={onPreview} disabled={pending || !isConnected || chain?.id !== 56}>{primaryLabel}</button>
      <div className="swap-summary" aria-label="Quote summary"><span><small>Route</small><strong>{result?.venueLabel ?? '—'}</strong></span><span><small>Fee</small><strong>{result?.feeBps === null || result?.feeBps === undefined ? '—' : `${result.feeBps} bps`}</strong></span><span><small>Slippage</small><strong>0.5%</strong></span></div>
      {result ? <QuoteResultView result={result} /> : null}
      <p className="action-hint">Founder Preview · Wallet reads enabled · Signing and broadcast disabled</p>
    </section>
  )
}
