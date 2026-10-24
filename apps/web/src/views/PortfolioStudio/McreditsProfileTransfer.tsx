import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useSigner } from 'wagmi'
import { getActiveMarcoConnectSdk } from 'components/MarcoWidgets/MarcoConnect'
import {
  buildDexMcreditsBalanceMessage,
  buildDexMcreditsTransferMessage,
  type DexTransferDirection,
} from 'lib/mcredits/profileTransferMessage'
import { Btn, Muted, Row, px } from './theme'

const Panel = styled.div`
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid ${px.goldLine};
  border-radius: 12px;
  background: rgba(242, 200, 76, 0.035);
`

const Amount = styled.input`
  min-width: 0;
  width: min(220px, 100%);
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 9px;
  background: #0c0c0c;
  color: #fff;
  font: inherit;
`

type Pending = {
  direction: DexTransferDirection
  amountMinor: string
  externalReference: string
}

export function McreditsProfileTransfer() {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const [direction, setDirection] = useState<DexTransferDirection>('PASSPORT_TO_APP')
  const [amount, setAmount] = useState('')
  const [balanceMinor, setBalanceMinor] = useState<string | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const amountMinor = useMemo(() => /^[1-9]\d{0,11}$/.test(amount.trim()) ? `${amount.trim()}00` : null, [amount])

  const refreshBalance = useCallback(async () => {
    if (!address || !signer) return
    const issuedAt = new Date().toISOString()
    const signature = await signer.signMessage(buildDexMcreditsBalanceMessage(address, issuedAt))
    const query = new URLSearchParams({ wallet: address, issuedAt, signature })
    const response = await fetch(`/api/mcredits/profile-transfer?${query}`)
    const payload = await response.json().catch(() => null)
    if (response.ok && payload?.ok) setBalanceMinor(payload.profile?.balanceMinor ?? '0')
  }, [address, signer])

  useEffect(() => { setBalanceMinor(null) }, [address])

  async function execute(operation: Pending) {
    if (!address || !signer) throw new Error('Connect the DEX profile wallet first.')
    const sdk = getActiveMarcoConnectSdk()
    if (!sdk?.authorizeMCreditsTransfer) throw new Error('Update MARCO Passport to authorize profile transfers.')
    const authorization = await sdk.authorizeMCreditsTransfer({
      surface: 'melega_dex', direction: operation.direction, amountMinor: operation.amountMinor,
    })
    if (!authorization.ok || !authorization.mcreditsTransferAuthorization || !authorization.passportSubject) {
      throw new Error(authorization.error?.message || 'MARCO Passport did not authorize the transfer.')
    }
    const issuedAt = new Date().toISOString()
    const signable = {
      wallet: address, direction: operation.direction, amountMinor: operation.amountMinor,
      externalReference: operation.externalReference, passportSubject: authorization.passportSubject, issuedAt,
    }
    const signature = await signer.signMessage(buildDexMcreditsTransferMessage(signable))
    const response = await fetch('/api/mcredits/profile-transfer', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...signable, signature, customerAuthorization: authorization.mcreditsTransferAuthorization,
      }),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || !result?.ok) {
      if (result?.gate === 'PASSPORT_TRANSFER_UNREACHABLE' || result?.gate === 'LOCAL_CREDIT_PENDING_RETRY') {
        setPending(operation)
      } else {
        setPending(null)
      }
      throw new Error(result?.gate || 'Transfer not completed.')
    }
    setPending(null)
    setAmount('')
    if (typeof result.balanceMinor === 'string') setBalanceMinor(result.balanceMinor)
    setMessage(result.duplicate ? 'Transfer already completed; profile reconciled.' : 'Transfer completed.')
  }

  async function run(operation: Pending) {
    setBusy(true)
    setMessage('')
    try { await execute(operation) } catch (error) {
      const reason = error instanceof Error ? error.message : 'Transfer not completed.'
      if (!['PASSPORT_TRANSFER_UNREACHABLE', 'LOCAL_CREDIT_PENDING_RETRY', 'LOCAL_REVERSAL_PENDING_RETRY'].includes(reason)) {
        setPending(null)
      }
      setMessage(reason)
    } finally { setBusy(false) }
  }

  function start() {
    if (!amountMinor) return
    const operation = { direction, amountMinor, externalReference: `dex:${crypto.randomUUID()}` }
    setPending(operation)
    run(operation)
  }

  const balance = balanceMinor == null ? '—' : (Number(balanceMinor) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })
  return (
    <Panel data-testid="dex-mcredits-profile-transfer">
      <Row>
        <strong>DEX profile Mcredits</strong>
        <span data-testid="dex-mcredits-profile-balance">{balance} Mcredits</span>
        <Btn as="button" type="button" $ghost disabled={busy || !address || !signer} onClick={() => refreshBalance().catch(() => setMessage('Balance proof was not completed.'))}>
          Load balance
        </Btn>
      </Row>
      <Muted>Move numeric Mcredits between this wallet profile and MARCO Passport. Every transfer requires both Passport consent and this wallet signature.</Muted>
      <Row>
        <Btn as="button" type="button" $primary={direction === 'PASSPORT_TO_APP'} disabled={busy || Boolean(pending)} onClick={() => setDirection('PASSPORT_TO_APP')}>
          Passport → DEX
        </Btn>
        <Btn as="button" type="button" $primary={direction === 'APP_TO_PASSPORT'} disabled={busy || Boolean(pending)} onClick={() => setDirection('APP_TO_PASSPORT')}>
          DEX → Passport
        </Btn>
      </Row>
      <Row>
        <Amount aria-label="Whole Mcredits amount" inputMode="numeric" value={amount} disabled={busy || Boolean(pending)} onChange={(event) => setAmount(event.target.value)} placeholder="Whole Mcredits" />
        <Btn as="button" type="button" $primary disabled={busy || !amountMinor || Boolean(pending) || !address} onClick={start}>
          {busy ? 'Working…' : 'Authorize transfer'}
        </Btn>
      </Row>
      {pending ? <Btn as="button" type="button" $ghost disabled={busy} onClick={() => run(pending)}>Retry same transfer</Btn> : null}
      {message ? <Muted role="status">{message}</Muted> : null}
    </Panel>
  )
}
