import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  normalizeClaimChainId,
  normalizeClaimContractInput,
  sanitizeClaimDisplayName,
} from './claimProjectIntent'

type Detected = {
  contract: string
  chainId: number
  name: string
  symbol: string
  logo?: string
  website?: string
}

/**
 * Controlled claim surface used when the full List workspace cannot mount.
 * No publish/signature path here — only identity + wallet connect.
 */
export const ClaimProjectFallback: React.FC = () => {
  const router = useRouter()
  const rawContract = typeof router.query.contract === 'string' ? router.query.contract : ''
  const contract = normalizeClaimContractInput(rawContract)
  const chainId = normalizeClaimChainId(router.query.chain)
  const [detected, setDetected] = useState<Detected | null>(null)
  const [reason, setReason] = useState<string | null>(
    contract.ok ? null : rawContract ? 'This contract address is not valid.' : 'Paste a BNB token contract to continue.',
  )
  const [loading, setLoading] = useState(contract.ok)

  useEffect(() => {
    if (!contract.ok) return
    let cancelled = false
    setLoading(true)
    void fetch('/api/registry/projects/onboard', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract: contract.address, chainId }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => null)
        if (cancelled) return
        if (!response.ok || !payload?.ok) {
          setReason(payload?.reason || 'This contract is not claimable from this link.')
          setDetected({
            contract: contract.address,
            chainId,
            name: '',
            symbol: '',
          })
          return
        }
        const symbol = payload.dex?.symbol || payload.onChain?.symbol || ''
        const sanitized = sanitizeClaimDisplayName(payload.dex?.name || payload.onChain?.name, symbol)
        setDetected({
          contract: contract.address,
          chainId,
          name: sanitized.name,
          symbol,
          logo: payload.dex?.logo || undefined,
          website: sanitized.websiteFromName || payload.dex?.website || undefined,
        })
        setReason(null)
      })
      .catch(() => {
        if (!cancelled) setReason('Token detection is unavailable right now. The claim stayed on List.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [chainId, contract.ok, contract.ok ? contract.address : ''])

  return (
    <div
      data-testid="claim-project-inline-error"
      data-claim-fallback="true"
      role="status"
      style={{
        padding: 24,
        color: '#f5f5f5',
        background: '#111',
        borderRadius: 16,
        minHeight: 200,
      }}
    >
      <strong>{detected?.name || detected?.symbol || 'Claim Project'}</strong>
      <p style={{ color: 'rgba(255,255,255,0.62)', marginTop: 8 }}>
        {loading
          ? 'Detecting token identity…'
          : reason ||
            'Connect the contract owner or original deployer wallet to continue inside List.'}
      </p>
      {contract.ok ? (
        <p style={{ color: '#f2c84c', marginTop: 8, wordBreak: 'break-all' }}>{contract.address}</p>
      ) : null}
      {detected?.symbol ? (
        <p style={{ marginTop: 8 }}>
          Ticker <strong>${detected.symbol}</strong>
        </p>
      ) : null}
      <div style={{ marginTop: 16 }}>
        <ConnectWalletButton scale="md">Connect wallet</ConnectWalletButton>
      </div>
    </div>
  )
}

export default ClaimProjectFallback
