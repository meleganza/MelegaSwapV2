import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { useAccount, useNetwork } from 'wagmi'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { typography } from 'design-system/melega'
import { MARCO_BRIDGE_PROGRESS, bridgeRecoveryMessage } from 'lib/marco-bridge/lifecycle'
import { planMarcoBridgeRoute } from 'lib/marco-bridge/routePolicy'
import { marcoBridgeService } from 'lib/marco-bridge/service'
import type { MarcoBridgeNetworkId, MarcoBridgeTracking } from 'lib/marco-bridge/types'
import {
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_PUBLIC_ACTIVATION,
  wave1ActivationBlockers,
} from 'lib/marco-bridge/wave1Registry'
import { isValidMarcoDestination, requiresExplicitDestination, validateBridgeAmount } from 'lib/marco-bridge/validation'

declare global {
  interface Window {
    solana?: {
      connect: () => Promise<{ publicKey?: { toString: () => string } }>
      publicKey?: { toString: () => string }
    }
  }
}

const Page = styled.section<{ $embedded?: boolean }>`
  min-height: 70vh;
  padding: 26px 22px 56px;
  color: #f5f5f5;
  font-family: ${typography.fontFamily.body};
  background: radial-gradient(circle at 78% 8%, rgba(244, 196, 48, 0.08), transparent 28%), #050606;
  @media (max-width: 767px) {
    padding: 16px 12px 40px;
  }

  ${({ $embedded }) =>
    $embedded
      ? `
    min-height: 0;
    padding: 0;
    background: transparent;
  `
      : ''}
`
const Shell = styled.div`
  width: min(1120px, 100%);
  margin: 0 auto;
`
const Hero = styled.header<{ $embedded?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
  margin-bottom: 18px;
  h1 {
    margin: 0;
    font-size: clamp(34px, 5vw, 58px);
    line-height: 1;
    letter-spacing: -0.045em;
  }
  p {
    margin: 10px 0 0;
    color: rgba(255, 255, 255, 0.58);
    font-size: 15px;
  }
  @media (max-width: 700px) {
    align-items: start;
    flex-direction: column;
  }

  ${({ $embedded }) => ($embedded ? 'display: none;' : '')}
`
const Available = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`
const NetworkPill = styled.span`
  min-height: 30px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.76);
  font-size: 11px;
  font-weight: 720;
`
const Workspace = styled.section<{ $embedded?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(310px, 0.85fr);
  gap: 14px;
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
  ${({ $embedded }) => ($embedded ? 'grid-template-columns: minmax(0, 1fr);' : '')}
`
const Card = styled.div<{ $embedded?: boolean }>`
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(18, 18, 18, 0.98), rgba(8, 9, 9, 0.98));
  padding: 18px;
  ${({ $embedded }) =>
    $embedded
      ? `
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;

    & + & {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
  `
      : ''}
`
const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  strong {
    font-size: 19px;
  }
  span {
    color: #f4c430;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }
`
const NetworkGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 42px 1fr;
  align-items: end;
  gap: 10px;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`
const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  > span {
    color: rgba(255, 255, 255, 0.48);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  select,
  input {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    border-radius: 11px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #141617;
    color: #fff;
    padding: 0 12px;
    font: 650 14px ${typography.fontFamily.body};
    outline: none;
  }
  select:focus,
  input:focus {
    border-color: rgba(244, 196, 48, 0.5);
    box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.08);
  }
`
const SwapNetworks = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(244, 196, 48, 0.3);
  background: rgba(244, 196, 48, 0.08);
  color: #f4c430;
  cursor: pointer;
  @media (max-width: 560px) {
    transform: rotate(90deg);
    justify-self: center;
  }
`
const WalletLine = styled.div`
  margin-top: 9px;
  min-height: 34px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.025);
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  strong {
    color: rgba(255, 255, 255, 0.86);
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const ConnectSolana = styled.button`
  border: 0;
  background: transparent;
  color: #f4c430;
  font: 750 11px ${typography.fontFamily.body};
  cursor: pointer;
`
const AmountRow = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 84px;
  gap: 8px;
`
const Max = styled.button`
  border: 1px solid rgba(244, 196, 48, 0.34);
  border-radius: 11px;
  color: #f4c430;
  background: rgba(244, 196, 48, 0.07);
  font-weight: 780;
  cursor: pointer;
`
const Summary = styled.div`
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
`
const SummaryCell = styled.div`
  min-height: 65px;
  padding: 11px 12px;
  background: #101111;
  span {
    display: block;
    color: rgba(255, 255, 255, 0.42);
    font-size: 10px;
    font-weight: 760;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  strong {
    display: block;
    margin-top: 5px;
    font-size: 13px;
    line-height: 1.3;
  }
`
const Notice = styled.div<{ $danger?: boolean }>`
  margin-top: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid ${({ $danger }) => ($danger ? 'rgba(255,89,100,.28)' : 'rgba(244,196,48,.22)')};
  background: ${({ $danger }) => ($danger ? 'rgba(255,89,100,.06)' : 'rgba(244,196,48,.055)')};
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  line-height: 1.45;
`
const Primary = styled.button`
  width: 100%;
  min-height: 50px;
  margin-top: 14px;
  border: 0;
  border-radius: 12px;
  background: #f4c430;
  color: #090909;
  font: 800 14px ${typography.fontFamily.body};
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.38);
  }
`
const Review = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
`
const ReviewRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  strong {
    color: #f3f3f3;
    text-align: right;
    overflow-wrap: anywhere;
  }
`
const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  li {
    min-height: 34px;
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(255, 255, 255, 0.52);
    font-size: 12px;
  }
  i {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    color: #f4c430;
    font-style: normal;
    font-size: 10px;
  }
`
const Advanced = styled.details`
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 11px;
  summary {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
  }
  ul {
    padding-left: 18px;
    line-height: 1.6;
  }
`

const networkEntries = Object.values(MARCO_WAVE1_NETWORKS)
const short = (value?: string) => (value ? `${value.slice(0, 7)}…${value.slice(-5)}` : 'Not connected')

export const MarcoBridgePanel: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const [from, setFrom] = useState<MarcoBridgeNetworkId>('bnb')
  const [to, setTo] = useState<MarcoBridgeNetworkId>('base')
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [solanaWallet, setSolanaWallet] = useState('')
  const [review, setReview] = useState(false)
  const [tracking, setTracking] = useState<MarcoBridgeTracking>({ status: 'idle' })
  const [error, setError] = useState('')
  const fromNetwork = MARCO_WAVE1_NETWORKS[from]
  const toNetwork = MARCO_WAVE1_NETWORKS[to]
  const sourceWallet = fromNetwork.walletFamily === 'evm' ? address ?? '' : solanaWallet
  const sameFamily = !requiresExplicitDestination(fromNetwork.walletFamily, toNetwork.walletFamily)
  const resolvedDestination = destination || (sameFamily ? sourceWallet : '')
  const route = useMemo(() => planMarcoBridgeRoute(from, to), [from, to])
  const validDestination = isValidMarcoDestination(resolvedDestination, toNetwork.walletFamily)
  const validAmount = validateBridgeAmount(amount)
  const sourceNetworkCorrect = fromNetwork.walletFamily === 'solana' || chain?.id === fromNetwork.chainId
  const canReview = Boolean(sourceWallet && validDestination && validAmount && route.kind === 'direct')
  const routeText =
    route.kind === 'direct'
      ? `${fromNetwork.shortLabel} → ${toNetwork.shortLabel}`
      : route.kind === 'via-bnb'
      ? `${fromNetwork.shortLabel} → BNB → ${toNetwork.shortLabel}`
      : 'Select two different networks'

  const connectSolana = async () => {
    setError('')
    try {
      const response = await window.solana?.connect()
      const next = response?.publicKey?.toString() ?? window.solana?.publicKey?.toString() ?? ''
      if (!next) throw new Error('No compatible Solana wallet was detected.')
      setSolanaWallet(next)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Solana wallet connection was rejected.')
    }
  }

  const openReview = () => {
    setError('')
    if (!sourceNetworkCorrect && fromNetwork.chainId && canSwitch) {
      void switchNetworkAsync(fromNetwork.chainId)
      return
    }
    if (!canReview) return
    setReview(true)
    setTracking({ status: 'review' })
  }

  const confirmBridge = async () => {
    setError('')
    try {
      const request = { from, to, amount, sourceWallet, destinationWallet: resolvedDestination }
      const quote = await marcoBridgeService.quote(request)
      setTracking({ status: 'confirming' })
      setTracking(await marcoBridgeService.submit(request, quote))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Bridge is currently unavailable.')
      setTracking({ status: 'action-required' })
    }
  }

  const cta = !sourceWallet
    ? fromNetwork.walletFamily === 'solana'
      ? 'CONNECT SOLANA WALLET'
      : 'CONNECT WALLET'
    : !sourceNetworkCorrect
    ? 'SWITCH NETWORK'
    : !amount
    ? 'ENTER AMOUNT'
    : !validDestination
    ? 'CONFIRM DESTINATION WALLET'
    : route.kind === 'via-bnb'
    ? 'BRIDGE TO BNB FIRST'
    : route.kind === 'same-network'
    ? 'CHOOSE ANOTHER NETWORK'
    : 'REVIEW BRIDGE'

  return (
    <Page
      $embedded={embedded}
      data-testid="marco-wave1-bridge"
      data-embedded={embedded ? 'true' : 'false'}
      data-public-activation={MARCO_WAVE1_PUBLIC_ACTIVATION.enabled ? 'enabled' : 'disabled'}
    >
      <Shell>
        <Hero $embedded={embedded}>
          <div>
            <h1>Bridge MARCO</h1>
            <p>Move MARCO across certified networks. One route, one tracked delivery.</p>
          </div>
          <Available aria-label="Available on">
            {networkEntries.map((network) => (
              <NetworkPill key={network.id}>{network.label}</NetworkPill>
            ))}
          </Available>
        </Hero>
        <Workspace $embedded={embedded}>
          <Card $embedded={embedded}>
            <NetworkGrid>
              <Field>
                <span>From</span>
                <select
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value as MarcoBridgeNetworkId)
                    setDestination('')
                    setReview(false)
                  }}
                >
                  {networkEntries.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </Field>
              <SwapNetworks
                type="button"
                aria-label="Swap networks"
                onClick={() => {
                  setFrom(to)
                  setTo(from)
                  setDestination('')
                  setReview(false)
                }}
              >
                ⇄
              </SwapNetworks>
              <Field>
                <span>To</span>
                <select
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value as MarcoBridgeNetworkId)
                    setDestination('')
                    setReview(false)
                  }}
                >
                  {networkEntries.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </Field>
            </NetworkGrid>
            <WalletLine>
              <span>Source wallet</span>
              <strong>{short(sourceWallet)}</strong>
              {fromNetwork.walletFamily === 'solana' ? (
                <ConnectSolana type="button" onClick={connectSolana}>
                  Connect
                </ConnectSolana>
              ) : null}
            </WalletLine>
            <Field style={{ marginTop: 12 }}>
              <span>Destination wallet</span>
              <input
                aria-label="Destination wallet"
                value={resolvedDestination}
                readOnly={sameFamily && Boolean(sourceWallet) && !destination}
                placeholder={toNetwork.walletFamily === 'evm' ? '0x…' : 'Solana address'}
                onChange={(event) => setDestination(event.target.value)}
              />
            </Field>
            <AmountRow>
              <Field>
                <span>Amount</span>
                <input
                  inputMode="decimal"
                  aria-label="MARCO amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.0 MARCO"
                />
              </Field>
              <Max type="button" disabled>
                MAX
              </Max>
            </AmountRow>
            <Summary>
              <SummaryCell>
                <span>You receive</span>
                <strong>{validAmount ? `${amount} MARCO` : '—'}</strong>
              </SummaryCell>
              <SummaryCell>
                <span>Fees</span>
                <strong>Calculated before signing</strong>
              </SummaryCell>
              <SummaryCell>
                <span>Delivery</span>
                <strong>Estimated with live quote</strong>
              </SummaryCell>
              <SummaryCell>
                <span>Route</span>
                <strong>{routeText}</strong>
              </SummaryCell>
            </Summary>
            {route.kind === 'via-bnb' ? (
              <Notice>
                Direct delivery is not certified for this pair. Complete the first transfer to BNB, then start the
                second transfer from BNB.
              </Notice>
            ) : null}
            {error ? (
              <Notice $danger role="alert">
                {error}
              </Notice>
            ) : null}
            {!sourceWallet && fromNetwork.walletFamily === 'evm' ? (
              <ConnectWalletButton width="100%" mt="14px">
                CONNECT WALLET
              </ConnectWalletButton>
            ) : (
              <Primary
                type="button"
                disabled={!canReview && sourceNetworkCorrect}
                onClick={fromNetwork.walletFamily === 'solana' && !sourceWallet ? connectSolana : openReview}
              >
                {cta}
              </Primary>
            )}
          </Card>
          <Card $embedded={embedded}>
            <CardHead>
              <strong>{review ? 'Review bridge' : 'Delivery status'}</strong>
              <span>{tracking.status === 'delivered' ? 'DELIVERED' : 'TRACKED'}</span>
            </CardHead>
            {review ? (
              <Review>
                <ReviewRow>
                  <span>You bridge</span>
                  <strong>{amount} MARCO</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>From</span>
                  <strong>{fromNetwork.label}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>From wallet</span>
                  <strong>{sourceWallet}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>To</span>
                  <strong>{toNetwork.label}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>Receive wallet</span>
                  <strong>{resolvedDestination}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>Expected receive</span>
                  <strong>Live quote required</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>Estimated fee</span>
                  <strong>Live quote required</strong>
                </ReviewRow>
                <Notice>
                  Review is available. Bridge submission remains safely locked until Wave‑1 public activation.
                </Notice>
                <Primary
                  type="button"
                  disabled={!MARCO_WAVE1_PUBLIC_ACTIVATION.enabled || route.kind !== 'direct' || !route.enabled}
                  onClick={confirmBridge}
                >
                  {MARCO_WAVE1_PUBLIC_ACTIVATION.enabled && route.kind === 'direct' && route.enabled
                    ? 'CONFIRM & BRIDGE'
                    : 'ACTIVATION PENDING'}
                </Primary>
              </Review>
            ) : (
              <>
                <Steps>
                  {MARCO_BRIDGE_PROGRESS.map((step, index) => (
                    <li key={step.status}>
                      <i>{index + 1}</i>
                      {step.label}
                    </li>
                  ))}
                </Steps>
                <Notice>{bridgeRecoveryMessage(tracking)}</Notice>
              </>
            )}
            <Advanced>
              <summary>Advanced details</summary>
              <ul>
                <li>Source transaction: {tracking.sourceTx ?? '—'}</li>
                <li>Transfer GUID: {tracking.guid ?? '—'}</li>
                <li>Destination transaction: {tracking.destinationTx ?? '—'}</li>
                <li>Activation blockers: {wave1ActivationBlockers().join(' · ')}</li>
              </ul>
            </Advanced>
            {!embedded ? (
              <Link
                href="/@marco/"
                style={{
                  display: 'inline-block',
                  marginTop: 14,
                  color: '#f4c430',
                  fontSize: 12,
                  textDecoration: 'none',
                }}
              >
                Back to MARCO project page →
              </Link>
            ) : null}
          </Card>
        </Workspace>
      </Shell>
    </Page>
  )
}

export const MarcoBridgeWorkspace: React.FC = () => <MarcoBridgePanel />

export default MarcoBridgeWorkspace
