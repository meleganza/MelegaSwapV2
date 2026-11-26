import React from 'react'
import { useAccount } from 'wagmi'
import { readSandboxReceipt, reviewSandbox, submitSandbox, switchEarnSandbox, type SandboxWallet } from '../../lib/earnSandbox'
import type { EarnSimulationInput, EarnTransaction } from '../../lib/earnAction'
import { signatureRejected } from '../../lib/userSwapFlow'

const messages: Record<string, string> = {
  SIMULATED: 'Simulation passed. Your wallet was not charged.',
  INVALID_INPUT: 'Enter a valid wallet address and amount.',
  MARKET_UNAVAILABLE: 'This market is unavailable for this operation.',
  INSUFFICIENT_BALANCE: 'Your wallet balance is too low.',
  INSUFFICIENT_POSITION: 'Your position is smaller than this amount.',
  APPROVAL_REQUIRED: 'The contract does not have enough allowance for this amount.',
  SIMULATION_UNAVAILABLE: 'The operation could not be simulated. Try again later.',
}

export default function EarnSimulation({ sandboxUrl }: { sandboxUrl?: string | null }) {
  const { address, connector } = useAccount()
  const [review, setReview] = React.useState<{ input: EarnSimulationInput; transaction: EarnTransaction; label: string }>()
  const [hash, setHash] = React.useState<string>()
  const [receiptPending, setReceiptPending] = React.useState(false)
  const busy = React.useRef(false)
  const receiptKey = sandboxUrl ? 'evo-earn-pending:' + sandboxUrl : null

  React.useEffect(() => {
    if (!receiptKey) return
    const saved = sessionStorage.getItem(receiptKey)
    if (saved && /^0x[0-9a-f]{64}$/i.test(saved)) {
      setHash(saved)
      setReceiptPending(true)
    }
  }, [receiptKey])

  async function wallet(): Promise<SandboxWallet> {
    const provider = await connector?.getProvider()
    if (!provider?.request || !address) throw new Error('Connect your wallet in the header first.')
    return provider
  }

  async function run(operation: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setMessage('')
    try {
      await operation()
    } catch (error) {
      setMessage(signatureRejected(error) ? 'Request declined in your wallet.' : error instanceof Error ? error.message : 'Wallet unavailable.')
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  async function checkReceipt(transactionHash: string) {
    const result = await readSandboxReceipt(await wallet(), transactionHash)
    if (result !== 'pending') {
      setReceiptPending(false)
      if (receiptKey) sessionStorage.removeItem(receiptKey)
    }
    setMessage(result === 'confirmed' ? 'Test transaction confirmed.' : result === 'failed' ? 'Test transaction failed.' : 'Test transaction pending.')
  }
  const [message, setMessage] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [market, setMarket] = React.useState('marco')
  const [action, setAction] = React.useState('deposit')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (sandboxUrl) {
      if (receiptPending) return
      await run(async () => {
        setReview(undefined)
        setHash(undefined)
        const provider = await wallet()
        await switchEarnSandbox(provider, sandboxUrl)
        const input = { market, action, amount: data.get('amount') }
        const result = await reviewSandbox(provider, address!, input)
        if (!result.transaction) {
          setMessage(messages[result.code] ?? messages.SIMULATION_UNAVAILABLE)
          return
        }
        const label = result.code === 'APPROVAL_REQUIRED' ? 'Approve test tokens' : action === 'deposit' ? 'Confirm test deposit' : 'Confirm test withdrawal'
        setReview({ transaction: result.transaction, input, label })
      })
      return
    }
    setPending(true)
    setMessage('')
    try {
      const response = await fetch('/api/earn-simulate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chainId: 56, market, action, account: address ?? data.get('account'), amount: data.get('amount') }),
      })
      const result = await response.json()
      setMessage(messages[result.code] ?? messages.SIMULATION_UNAVAILABLE)
    } catch {
      setMessage(messages.SIMULATION_UNAVAILABLE)
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="earn-card earn-simulation" aria-labelledby="earn-simulation-title">
      <h3 id="earn-simulation-title">{sandboxUrl ? 'Operate on the Earn Sandbox' : 'Simulate on BNB Chain'}</h3>
      <p>{sandboxUrl ? 'Use test tokens to deposit or withdraw on the isolated network.' : 'Check a deposit or withdrawal with your wallet. This preview only simulates transactions.'}</p>
      <form onSubmit={submit} onChange={() => { setMessage(''); setReview(undefined) }}>
        <fieldset disabled={pending || receiptPending} className="earn-simulation-fields">
          <label>Opportunity
            <select value={market} onChange={(event) => setMarket(event.target.value)}>
              <option value="marco">MARCO staking</option>
              <option value="beefy">ETH / WBNB vault</option>
            </select>
          </label>
          <label>Action
            <select value={action} onChange={(event) => setAction(event.target.value)}>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </select>
          </label>
          {!sandboxUrl && <label>Wallet address
            {address ? <input value={address} readOnly /> : <input name="account" required autoComplete="off" spellCheck={false} placeholder="0x…" />}
          </label>}
          <label>{market === 'beefy' ? (action === 'withdraw' ? 'Vault shares' : 'LP token amount') : 'MARCO amount'}
            <input name="amount" inputMode="decimal" required placeholder="0.0" />
          </label>
          <button className="card-action" type="submit">{sandboxUrl ? 'Review test operation' : pending ? 'Simulating…' : 'Simulate'}</button>
        </fieldset>
      </form>
      {review && <div>
        <p>{String(review.input.amount)} · {market === 'marco' ? 'MARCO staking' : 'ETH / WBNB vault'} · Test network</p>
        <button className="card-action" type="button" disabled={pending || receiptPending} onClick={() => run(async () => {
          setReview(undefined)
          const transactionHash = await submitSandbox(await wallet(), review.transaction, review.input)
          setHash(transactionHash)
          setReceiptPending(true)
          if (receiptKey) sessionStorage.setItem(receiptKey, transactionHash)
          await checkReceipt(transactionHash)
        })}>{review.label}</button>
      </div>}
      {hash && <div>
        <p style={{ overflowWrap: 'anywhere' }}>{hash}</p>
        {receiptPending && <button className="card-action" type="button" disabled={pending} onClick={() => run(() => checkReceipt(hash))}>Check receipt</button>}
      </div>}
      <div role="status" aria-busy={pending}>{pending ? 'Waiting for the wallet or network…' : message}</div>
    </section>
  )
}
