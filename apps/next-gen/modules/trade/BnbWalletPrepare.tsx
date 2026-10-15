import React from 'react'
import { formatUnits } from '../../lib/bscQuote'
import {
  receiptOutcome,
  reviewAction,
  sameUserTx,
  signatureRejected,
  type PublicUserTx,
  type SwapReview,
} from '../../lib/userSwapFlow'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

function provider(): EthereumProvider | null {
  const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum
  if (!ethereum || typeof ethereum.request !== 'function') return null
  return ethereum
}

async function waitForReceipt(ethereum: EthereumProvider, hash: string): Promise<'confirmed' | 'failed' | 'pending'> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const receipt = (await ethereum.request({ method: 'eth_getTransactionReceipt', params: [hash] })) as { status?: string | number } | null
    const outcome = receiptOutcome(receipt)
    if (outcome !== 'pending') return outcome
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  return 'pending'
}

export function BnbWalletPrepare({ sell, buy, amount }: { sell: string; buy: string; amount: string }) {
  const [account, setAccount] = React.useState<string | null>(null)
  const [chainId, setChainId] = React.useState<number | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [review, setReview] = React.useState<SwapReview | null>(null)
  const busy = React.useRef(false)
  // A broadcast remains locked even if receipt polling times out or throws.
  const submitted = React.useRef<string | null>(null)
  const [submittedHash, setSubmittedHash] = React.useState<string | null>(null)

  async function readChain(ethereum: EthereumProvider): Promise<number | null> {
    try {
      const chainHex = (await ethereum.request({ method: 'eth_chainId' })) as string
      return Number(BigInt(chainHex))
    } catch {
      return null
    }
  }

  async function onConnect() {
    const ethereum = provider()
    if (!ethereum) {
      setStatus('NO_WALLET_PROVIDER')
      return
    }
    if (busy.current) return
    if (submitted.current) return
    busy.current = true
    setPending(true)
    try {
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      const nextChain = await readChain(ethereum)
      setAccount(accounts[0] ?? null)
      setChainId(nextChain)
      setStatus(nextChain === 56 ? 'CONNECTED' : 'CHAIN_MISMATCH')
    } catch (error) {
      setStatus(signatureRejected(error) ? 'SIGNATURE_REJECTED' : 'WALLET_REJECTED')
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  async function loadReview(user: string): Promise<SwapReview | null> {
    const response = await fetch('/api/sealed-prepare', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chainId: 56, sell, buy, amount, user, slippageBps: 50 }),
    })
    return (await response.json()) as SwapReview
  }

  async function onReview() {
    if (!account || chainId !== 56 || busy.current || submitted.current) {
      setStatus(chainId == null ? 'WALLET_REQUIRED' : 'CHAIN_MISMATCH')
      return
    }
    busy.current = true
    setPending(true)
    try {
      const next = await loadReview(account)
      setReview(next)
      setStatus(next?.code ?? (next?.ok ? 'READY_FOR_WALLET' : 'UNAVAILABLE'))
    } catch {
      setReview(null)
      setStatus('UNAVAILABLE')
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  async function sendUserTx(tx: PublicUserTx): Promise<string> {
    const ethereum = provider()
    if (!ethereum) throw Object.assign(new Error('NO_WALLET_PROVIDER'), { code: 0 })
    const nextChain = await readChain(ethereum)
    setChainId(nextChain)
    if (nextChain !== 56) throw Object.assign(new Error('CHAIN_MISMATCH'), { code: 0 })
    const hash = (await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ from: account, to: tx.to, data: tx.data, value: tx.value, chainId: '0x38' }],
    })) as string
    if (typeof hash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      throw Object.assign(new Error('SUBMIT_FAILED'), { code: 0 })
    }
    return hash
  }

  async function onApprove() {
    if (!account || !review?.approvalTx || review.unsignedTx || busy.current || submitted.current) return
    busy.current = true
    setPending(true)
    try {
      const shown = review.approvalTx
      const fresh = await loadReview(account)
      if (!fresh || !sameUserTx(shown, fresh.approvalTx) || fresh.unsignedTx) {
        setReview(fresh)
        setStatus('REPLACED')
        return
      }
      const hash = await sendUserTx(shown)
      submitted.current = hash
      setSubmittedHash(hash)
      setReview(null)
      const outcome = await waitForReceipt(provider() as EthereumProvider, hash)
      if (outcome !== 'confirmed') {
        setStatus(outcome === 'failed' ? 'FAILED_RECEIPT' : 'RECEIPT_PENDING')
        return
      }
      const again = await loadReview(account)
      setReview(again)
      if (again?.approvalTx && sameUserTx(shown, again.approvalTx)) {
        setStatus('ALLOWANCE_RACE')
        return
      }
      submitted.current = null
      setSubmittedHash(null)
      setStatus(again?.code ?? (again?.ok ? 'READY_FOR_WALLET' : 'UNAVAILABLE'))
    } catch (error) {
      setStatus(signatureRejected(error) ? 'SIGNATURE_REJECTED' : error instanceof Error ? error.message : 'UNAVAILABLE')
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  async function onConfirm() {
    if (!account || !review?.unsignedTx || review.approvalTx || busy.current || submitted.current) return
    if (reviewAction(review) !== 'confirm') {
      setStatus('GAS_UNAVAILABLE')
      return
    }
    busy.current = true
    setPending(true)
    try {
      const shown = review.unsignedTx
      const fresh = await loadReview(account)
      if (!fresh?.ok || !sameUserTx(shown, fresh.unsignedTx) || fresh.approvalTx || reviewAction(fresh) !== 'confirm') {
        setReview(fresh)
        setStatus(fresh?.code === 'QUOTE_STALE' || fresh?.code === 'QUOTE_EXPIRED' ? fresh.code : 'REPLACED')
        return
      }
      const hash = await sendUserTx(shown)
      submitted.current = hash
      setSubmittedHash(hash)
      setReview(null)
      const outcome = await waitForReceipt(provider() as EthereumProvider, hash)
      setStatus(outcome === 'confirmed' ? `SUBMITTED ${hash}` : outcome === 'failed' ? 'FAILED_RECEIPT' : 'RECEIPT_PENDING')
    } catch (error) {
      setStatus(signatureRejected(error) ? 'SIGNATURE_REJECTED' : error instanceof Error ? error.message : 'UNAVAILABLE')
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  const action = review ? reviewAction(review) : 'blocked'
  return (
    <section className="quote-panel" aria-labelledby="wallet-prepare-title">
      <h2 id="wallet-prepare-title">BNB wallet</h2>
      <p className="muted-copy">Nothing is signed until you press Approve or Sign and send. This page does not sign by itself.</p>
      <button className="primary-action" type="button" onClick={onConnect} disabled={pending || Boolean(submittedHash)}>
        {account ? 'Refresh BNB wallet' : 'Connect BNB wallet'}
      </button>
      <button className="primary-action" type="button" onClick={onReview} disabled={pending || Boolean(submittedHash) || !account || chainId !== 56}>
        Review BNB swap
      </button>
      {review ? (
        <ul className="facts">
          <li>You pay: {review.amountInRaw ? `${formatUnits(review.amountInRaw, 18)} ${sell}` : sell}</li>
          <li>You receive: {review.amountOutRaw ? `${formatUnits(review.amountOutRaw, 18)} ${buy}` : 'not returned'}</li>
          <li>Venue: {review.venueLabel ?? 'not returned'}</li>
          <li>Slippage: {review.slippageBps == null ? 'not returned' : `${(review.slippageBps / 100).toFixed(2)}%`}</li>
          <li>Canonical fee: {review.feeBps == null ? 'not returned' : `${review.feeBps} bps`} {review.feeAmountRaw ? `(${review.feeAmountRaw} raw)` : ''}</li>
          <li>Gas: {review.gasUnits ?? 'not returned'}</li>
          <li>Destination: {review.destination ?? 'not returned'}</li>
        </ul>
      ) : null}
      {action === 'approve' ? (
        <button className="primary-action" type="button" onClick={onApprove} disabled={pending || Boolean(submittedHash)}>
          Approve token in wallet
        </button>
      ) : null}
      {action === 'confirm' ? (
        <button className="primary-action" type="button" onClick={onConfirm} disabled={pending || Boolean(submittedHash)}>
          Sign and send swap
        </button>
      ) : null}
      {submittedHash ? <p role="status">Transaction: <a href={`https://bscscan.com/tx/${submittedHash}`} target="_blank" rel="noreferrer noopener">{submittedHash}</a>. Follow the receipt before starting another swap.</p> : null}
      {status ? (
        <p className="inline-alert" role="status" data-broadcast="false" data-signed="false">
          {status}
          {chainId != null ? ` · chain ${chainId}` : ''}
          {account ? ` · ${account}` : ''}
        </p>
      ) : null}
    </section>
  )
}
