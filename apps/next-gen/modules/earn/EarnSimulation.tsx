import React from 'react'
import { useAccount } from 'wagmi'

const messages: Record<string, string> = {
  SIMULATED: 'Simulation passed. Your wallet was not charged.',
  INVALID_INPUT: 'Enter a valid wallet address and amount.',
  MARKET_UNAVAILABLE: 'This market is unavailable for this operation.',
  INSUFFICIENT_BALANCE: 'Your wallet balance is too low.',
  INSUFFICIENT_POSITION: 'Your position is smaller than this amount.',
  APPROVAL_REQUIRED: 'The contract does not have enough allowance for this amount.',
  SIMULATION_UNAVAILABLE: 'The operation could not be simulated. Try again later.',
}

export default function EarnSimulation() {
  const { address } = useAccount()
  const [message, setMessage] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [market, setMarket] = React.useState('marco')
  const [action, setAction] = React.useState('deposit')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
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
      <h3 id="earn-simulation-title">Simulate on BNB Chain</h3>
      <p>Check a deposit or withdrawal with your wallet. This preview only simulates transactions.</p>
      <form onSubmit={submit} onChange={() => setMessage('')}>
        <fieldset disabled={pending} className="earn-simulation-fields">
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
          <label>Wallet address
            {address ? <input value={address} readOnly /> : <input name="account" required autoComplete="off" spellCheck={false} placeholder="0x…" />}
          </label>
          <label>{market === 'beefy' ? (action === 'withdraw' ? 'Vault shares' : 'LP token amount') : 'MARCO amount'}
            <input name="amount" inputMode="decimal" required placeholder="0.0" />
          </label>
          <button className="card-action" type="submit">{pending ? 'Simulating…' : 'Simulate'}</button>
        </fieldset>
      </form>
      <div role="status">{message}</div>
    </section>
  )
}
