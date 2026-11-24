import React, { startTransition, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { typography } from 'design-system/melega'
import {
  applyBridgeRouteSelection,
  BRIDGE_COPY,
  isCompletedDelivery,
  layerZeroScanTxUrl,
  liveQuoteBlockReason,
  marcoBridgeStepStates,
  resolveQuoteCta,
  resolveSubmitCta,
  shouldShowCompletedDeliveryCard,
  sourceSubmissionLocksControls,
  type MarcoBridgeSubmissionPhase,
} from 'lib/marco-bridge/bridgeActionState'
import { CANONICAL_BNB_SOLANA_GATE } from 'lib/marco-bridge/canonicalBnbSolanaGate'
import { resolveRouteExecution } from 'lib/marco-bridge/executableRoutes'
import { MARCO_BRIDGE_PROGRESS, bridgeRecoveryMessage } from 'lib/marco-bridge/lifecycle'
import {
  BNB_GAS_PRICE_FALLBACK_WEI,
  resolveNativeFundsBlockReason,
  type NativeFundsReadState,
} from 'lib/marco-bridge/nativeFunds'
import { planMarcoBridgeRoute } from 'lib/marco-bridge/routePolicy'
import { POLYGON_CHAIN_ID, ensurePolygonWalletNetwork } from 'lib/marco-bridge/polygonChain'
import { ARC_CHAIN_ID, ensureArcWalletNetwork } from 'lib/marco-bridge/arcChain'
import { bindInjectedSignerAfterNetworkSwitch } from 'lib/marco-bridge/injectedSigner'
import { ROBINHOOD_CHAIN_ID, ensureRobinhoodWalletNetwork } from 'lib/marco-bridge/robinhoodChain'
import { marcoBridgeApiPath } from 'lib/marco-bridge/marcoBridgeApiPath'
import { marcoBridgeService, prepareSolanaMarcoBridge } from 'lib/marco-bridge/service'
import type { CanonicalMmnRouteState } from 'lib/marco-bridge/routeAuthority'
import type { MarcoBridgeNetworkId, MarcoBridgeQuote, MarcoBridgeTracking } from 'lib/marco-bridge/types'
import {
  readConnectedSolanaAddress,
  readErc20Allowance,
  solanaWalletConnectionLabel,
  submitMarcoApprovalFromWallet,
  submitMarcoBridgeFromWallet,
  type SolanaInjectedWallet,
  type WalletSubmitSigner,
} from 'lib/marco-bridge/walletSubmit'
import {
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_PUBLIC_ACTIVATION,
  localRouteActivationEnabled,
  wave1ActivationBlockers,
} from 'lib/marco-bridge/wave1Registry'
import {
  isValidMarcoDestination,
  parseBridgeAmount,
  requiresExplicitDestination,
  validateBridgeAmount,
} from 'lib/marco-bridge/validation'

declare global {
  interface Window {
    solana?: SolanaInjectedWallet & {
      connect: () => Promise<{ publicKey?: { toString: () => string } }>
    }
  }
}

type BridgeEthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

const Page = styled.section<{ $embedded?: boolean }>`
  min-height: 70vh;
  padding: 26px 22px 56px;
  color: #171817;
  font-family: ${typography.fontFamily.body};
  background: #F7F6F2;
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
const cinematicDrift = keyframes`
  0%, 100% { transform: scale(1.045) translate3d(0, 0, 0); }
  50% { transform: scale(1.085) translate3d(-1.2%, -0.8%, 0); }
`
const HeroArtwork = styled.img`
  position: absolute;
  z-index: -3;
  inset: -4%;
  width: 108%;
  height: 108%;
  object-fit: cover;
  object-position: center;
  animation: ${cinematicDrift} 18s ease-in-out infinite;
  will-change: transform;

  @media (max-width: 700px) {
    object-position: 66% center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scale(1.045);
  }
`
const HeroVeil = styled.div`
  position: absolute;
  z-index: -2;
  inset: 0;
  background: linear-gradient(90deg, rgba(4, 5, 5, 0.98) 0%, rgba(4, 5, 5, 0.82) 34%, rgba(4, 5, 5, 0.16) 72%),
    linear-gradient(0deg, rgba(4, 5, 5, 0.78) 0%, transparent 48%);

  @media (max-width: 700px) {
    background: linear-gradient(0deg, rgba(4, 5, 5, 0.98) 0%, rgba(4, 5, 5, 0.38) 70%, rgba(4, 5, 5, 0.18) 100%);
  }
`
const Available = styled.div`
  position: relative;
  z-index: 1;
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
  border: 1px solid #EFEDE6;
  border-radius: 20px;
  background: #FFFFFF;
  padding: 10px;
  .sr-only-bridge {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
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
      border-top: 1px solid #E5E2D9;
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
const Field = styled.label`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  > span {
    color: #72736E;
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
    border-radius: 12px;
    border: 1px solid #E5E2D9;
    background: #F1F0EB;
    color: #171817;
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
const WalletLine = styled.div`
  margin-top: 9px;
  min-height: 34px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 9px;
  background: #F7F6F2;
  color: #72736E;
  font-size: 11px;
  strong {
    color: #171817;
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
const Notice = styled.div<{ $danger?: boolean }>`
  margin-top: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid ${({ $danger }) => ($danger ? 'rgba(255,89,100,.28)' : 'rgba(244,196,48,.22)')};
  background: ${({ $danger }) => ($danger ? 'rgba(255,89,100,.06)' : 'rgba(244,196,48,.055)')};
  color: #72736E;
  font-size: 12px;
  line-height: 1.45;
  a {
    color: #f4c430;
  }
`
const TransactionLink = styled.a`
  min-width: 0;
  margin-top: 12px;
  padding: 11px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  overflow: hidden;
  border: 1px solid rgba(244, 196, 48, 0.22);
  border-radius: 10px;
  background: rgba(244, 196, 48, 0.055);
  text-decoration: none;
  transition: border-color 140ms ease, background 140ms ease;

  > span {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  small {
    color: rgba(255, 255, 255, 0.48);
    font-size: 10px;
    font-weight: 760;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  strong {
    overflow: hidden;
    color: rgba(255, 255, 255, 0.84);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  b {
    flex: 0 0 auto;
    color: #f4c430;
    font-size: 11px;
    font-weight: 780;
  }
  &:hover {
    border-color: rgba(244, 196, 48, 0.45);
    background: rgba(244, 196, 48, 0.09);
  }

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
`
const Primary = styled.button`
  width: 100%;
  min-height: 50px;
  margin-top: 14px;
  border: 0;
  border-radius: 12px;
  background: #F3C928;
  color: #171817;
  font: 800 14px ${typography.fontFamily.body};
  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
    background: #F1F0EB;
    color: #72736E;
  }
`

/* ---- R035B: approved Pearl Bridge mockup (presentation only) ---- */
const EvoTabs = styled.div`
  display: flex;
  gap: 6px;
  padding: 4px;
  margin: 0 0 14px;
  border-radius: 999px;
  background: #F1F0EB !important;
  width: 100%;
  max-width: 480px;
  > a {
    flex: 1 1 0;
    justify-content: center;
  }
`
const EvoTab = styled(Link)<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  text-decoration: none;
  font: 600 16px ${typography.fontFamily.body};
  color: ${({ $active }) => ($active ? '#171817' : '#72736E')};
  background: ${({ $active }) => ($active ? '#FFFFFF' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 -2px 0 #F3C928, 0 2px 8px rgba(23,24,23,.05)' : 'none')};
`
const TabGlyph = styled.svg`
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
`
const EvoPanel = styled.div`
  border-radius: 16px;
  background: #F7F6F2;
  padding: 14px 16px 16px;
  & + & {
    margin-top: 6px;
  }
`
const EvoPanelHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #72736E;
  font-size: 13px;
  font-weight: 500;
`
const EvoPanelBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
const EvoChip = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(23, 24, 23, 0.04);
  cursor: pointer;
  flex: 0 0 auto;
  max-width: 70%;
  select {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    font-size: 16px;
  }
  &:focus-within {
    box-shadow: 0 0 0 3px rgba(243, 201, 40, 0.35);
  }
`
const EvoTokenIcon = styled.span`
  position: relative;
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  > img {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: block;
  }
`
const EvoBadge = styled.span`
  position: absolute;
  right: -4px;
  bottom: -4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  background: #FFFFFF;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 700;
  img {
    width: 100%;
    height: 100%;
    display: block;
  }
`
const EvoChainBadge: React.FC<{ network: { chainId: number | null; shortLabel: string } }> = ({ network }) => (
  <EvoBadge aria-hidden>
    {network.chainId ? (
      <img src={`/images/chains/${network.chainId}.png`} alt="" />
    ) : (
      <span>{network.shortLabel.slice(0, 3).toUpperCase()}</span>
    )}
  </EvoBadge>
)
const EvoChipText = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  strong {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 17px;
    font-weight: 700;
    color: #171817;
  }
  small {
    margin-top: 2px;
    font-size: 13px;
    color: #72736E;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`
const EvoChevron = styled.i`
  width: 7px;
  height: 7px;
  margin-top: -4px;
  border-right: 2px solid #171817;
  border-bottom: 2px solid #171817;
  transform: rotate(45deg);
`
const EvoAmount = styled.label`
  flex: 1 1 auto;
  min-width: 0;
  text-align: right;
  input,
  output {
    width: 100%;
    height: auto !important;
    padding: 0 !important;
    border: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    text-align: right;
    font: 600 34px/1.1 ${typography.fontFamily.body};
    color: #171817;
    outline: none;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  input::placeholder {
    color: #8E8F89;
  }
  output {
    color: #8E8F89;
  }
`
const EvoFlip = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin: -20px auto;
  border: 4px solid #FFFFFF;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 4px 14px rgba(23, 24, 23, 0.08);
  cursor: pointer;
  svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: #E9B10F;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`
const EvoLinkButton = styled.button`
  margin: 10px 0 0;
  padding: 0;
  border: 0;
  background: none;
  color: #72736E;
  font: 500 12px ${typography.fontFamily.body};
  text-decoration: underline;
  cursor: pointer;
`
const EvoInfoRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr);
  margin-top: 14px;
  padding: 12px 6px;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid #EFEDE6;
`
const EvoInfoCell = styled.div`
  display: flex;
  gap: 6px;
  align-items: flex-start;
  padding: 0 6px;
  min-width: 0;
  & + & {
    border-left: 1px solid #EFEDE6;
  }
  svg {
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    fill: none;
    stroke: #171817;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  span {
    display: block;
    font-size: 12px;
    color: #72736E;
  }
  strong {
    display: block;
    margin-top: 2px;
    font-size: 13px;
    font-weight: 600;
    color: #171817;
    overflow-wrap: anywhere;
  }
`
const EvoRoutePill = styled.strong<{ $ok?: boolean }>`
  display: inline-block !important;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ $ok }) => ($ok ? '#E7F5EC' : '#F1F0EB')};
  color: ${({ $ok }) => ($ok ? '#21865A' : '#72736E')} !important;
  font-size: 11px !important;
  white-space: nowrap;
`
const EvoConnect = styled.div`
  button {
    height: 52px !important;
    border-radius: 14px !important;
    background: #F3C928 !important;
    color: #171817 !important;
    font-size: 17px !important;
    font-weight: 600 !important;
    text-transform: none !important;
    box-shadow: none !important;
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
  color: #72736E;
  font-size: 12px;
  strong {
    color: #171817;
    text-align: right;
    overflow-wrap: anywhere;
  }
`
const stepPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(244, 196, 48, 0.35); }
  50% { box-shadow: 0 0 0 6px rgba(244, 196, 48, 0); }
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
    color: #72736E;
    font-size: 12px;
  }
  li[data-state='completed'] {
    color: rgba(244, 196, 48, 0.92);
  }
  li[data-state='current'] {
    color: #171817;
  }
  i {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #F1F0EB;
    color: #f4c430;
    font-style: normal;
    font-size: 10px;
  }
  li[data-state='current'] i {
    animation: ${stepPulse} 1.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    li[data-state='current'] i {
      animation: none;
    }
  }
`
const Advanced = styled.details`
  margin-top: 12px;
  color: #72736E;
  font-size: 11px;
  summary {
    cursor: pointer;
    color: #171817;
  }
  ul {
    padding-left: 18px;
    line-height: 1.6;
  }
  li {
    overflow-wrap: anywhere;
  }
`

const networkEntries = Object.values(MARCO_WAVE1_NETWORKS)
const short = (value?: string) => (value ? `${value.slice(0, 7)}…${value.slice(-5)}` : 'Not connected')

export const MarcoBridgePanel: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { address } = useAccount();
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const [from, setFrom] = useState<MarcoBridgeNetworkId>('bnb')
  const [to, setTo] = useState<MarcoBridgeNetworkId>('robinhood')
  const [submitting, setSubmitting] = useState(false)
  const [submissionPhase, setSubmissionPhase] = useState<MarcoBridgeSubmissionPhase>('idle')
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [showCustomDestination, setShowCustomDestination] = useState(false)
  const [solanaWallet, setSolanaWallet] = useState('')
  const [review, setReview] = useState(false)
  const [quote, setQuote] = useState<MarcoBridgeQuote | null>(null)
  const [preparedSolanaTransaction, setPreparedSolanaTransaction] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [routeAuthority, setRouteAuthority] = useState<CanonicalMmnRouteState | null>(null)
  const [routeAuthorityError, setRouteAuthorityError] = useState('')
  const [tracking, setTracking] = useState<MarcoBridgeTracking>({ status: 'idle' })
  const [error, setError] = useState('')
  const [allowanceLD, setAllowanceLD] = useState<string | null>(null)
  const [nativeBalanceWei, setNativeBalanceWei] = useState<string | null>(null)
  const [gasPriceWei, setGasPriceWei] = useState<string | null>(null)
  const [nativeReadState, setNativeReadState] = useState<NativeFundsReadState>('idle')
  const fromNetwork = MARCO_WAVE1_NETWORKS[from]
  const toNetwork = MARCO_WAVE1_NETWORKS[to]
  const sourceWallet = fromNetwork.walletFamily === 'evm' ? address ?? '' : solanaWallet
  const sameFamily = !requiresExplicitDestination(fromNetwork.walletFamily, toNetwork.walletFamily)
  const resolvedDestination = destination || (sameFamily ? sourceWallet : '')
  const route = useMemo(() => planMarcoBridgeRoute(from, to), [from, to])
  const validDestination = isValidMarcoDestination(resolvedDestination, toNetwork.walletFamily)
  const validAmount = validateBridgeAmount(amount, fromNetwork.tokenDecimals)
  const sourceNetworkCorrect = fromNetwork.walletFamily === 'solana' || chain?.id === fromNetwork.chainId
  const canReview = Boolean(sourceWallet && validDestination && validAmount && route.kind === 'direct')
  const routeExecution = resolveRouteExecution(from, to, routeAuthority, quote)
  const executable = routeExecution.executable
  const executionBlockers = routeExecution.blockers
  const solanaPaused = Boolean(
    routeAuthority?.networks.find((network) => network.id === 'solana')?.paused ??
      MARCO_WAVE1_NETWORKS.solana.protectivePaused,
  )
  const parsedAmount = parseBridgeAmount(amount, fromNetwork.tokenDecimals)
  const approvalRequired = Boolean(
    from === 'bnb' && parsedAmount && (allowanceLD == null || BigNumber.from(allowanceLD).lt(parsedAmount.amountLD)),
  )
  const sourceLocked = sourceSubmissionLocksControls(tracking)
  const completedDelivery = isCompletedDelivery(tracking)
  const showCompletedDelivery = shouldShowCompletedDeliveryCard(tracking)
  const quoteCta = resolveQuoteCta({ hasLiveQuote: Boolean(quote?.live), sourceSubmitted: sourceLocked })
  const nativeBlockReason = resolveNativeFundsBlockReason({
    from,
    quoteLive: Boolean(quote?.live),
    nativeFeeWei: quote?.nativeFeeWei,
    readState: nativeReadState,
    balanceWei: nativeBalanceWei,
    gasPriceWei,
    approvalRequired,
  })
  const submitCta = resolveSubmitCta({
    from,
    to,
    connectedChainId: chain?.id,
    executable,
    approvalRequired,
    submitting,
    submissionPhase,
    quote,
    tracking,
    nativeBlockReason,
  })
  const stepStates = marcoBridgeStepStates(tracking)
  const routeText =
    route.kind === 'direct'
      ? `${fromNetwork.shortLabel} → ${toNetwork.shortLabel}`
      : route.kind === 'via-bnb'
      ? `${fromNetwork.shortLabel} → BNB → ${toNetwork.shortLabel}`
      : 'Select two different networks'

  useEffect(() => {
    const existing = typeof window !== 'undefined' ? readConnectedSolanaAddress(window.solana) : ''
    if (existing) setSolanaWallet(existing)
  }, [])

  useEffect(() => {
    let cancelled = false
    let secondFrame = 0
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        void fetch(marcoBridgeApiPath('/api/marco-bridge/route-state'), { cache: 'no-store' })
          .then(async (response) => {
            const payload = (await response.json()) as CanonicalMmnRouteState & { message?: string }
            if (!response.ok) throw new Error(payload.message || 'Canonical route authority is unavailable.')
            if (!cancelled) {
              startTransition(() => setRouteAuthority(payload))
            }
          })
          .catch((cause) => {
            if (!cancelled) {
              startTransition(() =>
                setRouteAuthorityError(cause instanceof Error ? cause.message : 'Route authority unavailable.'),
              )
            }
          })
      })
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(firstFrame)
      if (secondFrame) window.cancelAnimationFrame(secondFrame)
    }
  }, [])

  const resetQuote = () => {
    setQuote(null)
    setPreparedSolanaTransaction('')
    setQuoteLoading(false)
    setReview(false)
  }

  const applyRouteChange = (nextFrom: MarcoBridgeNetworkId, nextTo: MarcoBridgeNetworkId) => {
    const next = applyBridgeRouteSelection({ tracking, nextFrom, nextTo })
    setFrom(next.from)
    setTo(next.to)
    setDestination(next.destination)
    setQuote(next.quote)
    setPreparedSolanaTransaction('')
    setQuoteLoading(next.quoteLoading)
    setReview(next.review)
    if (next.resetCompletedTransfer) {
      setAllowanceLD(next.allowanceLD)
      setNativeBalanceWei(next.nativeBalanceWei)
      setGasPriceWei(next.gasPriceWei)
      setNativeReadState(next.nativeReadState)
      setError(next.error)
      setSubmitting(next.submitting)
      setSubmissionPhase(next.submissionPhase)
      setTracking(next.tracking)
    }
  }

  useEffect(() => {
    setQuote(null)
    setPreparedSolanaTransaction('')
    setQuoteLoading(false)
    setReview(false)
    setAllowanceLD(null)
  }, [sourceWallet])

  useEffect(() => {
    if (!signer?.provider || from !== 'bnb' || !sourceWallet) {
      setNativeBalanceWei(null)
      setGasPriceWei(null)
      setNativeReadState(from === 'bnb' && sourceWallet ? 'unavailable' : 'idle')
      return
    }
    let cancelled = false
    setNativeReadState('loading')
    void Promise.all([
      signer.provider.getBalance(sourceWallet),
      signer.provider.getGasPrice().catch(() => BNB_GAS_PRICE_FALLBACK_WEI),
    ])
      .then(([balance, gasPrice]) => {
        if (!cancelled) {
          setNativeBalanceWei(BigNumber.from(balance).toString())
          setGasPriceWei(BigNumber.from(gasPrice).toString())
          setNativeReadState('ready')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNativeBalanceWei(null)
          setGasPriceWei(null)
          setNativeReadState('unavailable')
        }
      })
    return () => {
      cancelled = true
    }
  }, [signer, from, sourceWallet, quote?.quotedAt, quote?.nativeFeeWei])

  useEffect(() => {
    if (!signer || from !== 'bnb' || !sourceWallet || !quote?.live) {
      return
    }
    let cancelled = false
    void readErc20Allowance({
      token: CANONICAL_BNB_SOLANA_GATE.token,
      owner: sourceWallet,
      spender: CANONICAL_BNB_SOLANA_GATE.oftAdapter,
      provider: {
        call: (tx) => {
          if (!signer.provider) return Promise.reject(new Error('Wallet provider is unavailable.'))
          return signer.provider.call(tx)
        },
      },
    })
      .then((next) => {
        if (!cancelled) setAllowanceLD(next)
      })
      .catch(() => {
        if (!cancelled) setAllowanceLD('0')
      })
    return () => {
      cancelled = true
    }
  }, [signer, from, sourceWallet, quote?.live, quote?.quotedAt])

  useEffect(() => {
    if (!tracking.sourceTx || tracking.status === 'delivered' || tracking.status === 'source-failed') return
    const timer = window.setInterval(() => {
      void fetch(marcoBridgeApiPath(`/api/marco-bridge/track?sourceTx=${tracking.sourceTx}`), { cache: 'no-store' })
        .then(async (response) => {
          if (response.ok) setTracking((await response.json()) as MarcoBridgeTracking)
        })
        .catch(() => undefined)
    }, 8000)
    return () => window.clearInterval(timer)
  }, [tracking.sourceTx, tracking.status])

  const connectSolana = async () => {
    setError('')
    try {
      const response = await window.solana?.connect()
      const next = response?.publicKey?.toString() ?? window.solana?.publicKey?.toString() ?? ''
      if (!next) throw new Error('No compatible Solana wallet was detected.')
      setSolanaWallet(next)
      resetQuote()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Solana wallet connection was rejected.')
    }
  }

  const openReview = async () => {
    setError('')
    if (sourceLocked) return
    if (!sourceNetworkCorrect && fromNetwork.chainId && canSwitch) {
      void switchNetworkAsync(fromNetwork.chainId)
      return
    }
    if (!canReview) return
    setQuoteLoading(true)
    setQuote(null)
    try {
      const request = { from, to, amount, sourceWallet, destinationWallet: resolvedDestination }
      const prepared = fromNetwork.walletFamily === 'solana' ? await prepareSolanaMarcoBridge(request) : null
      const nextQuote = prepared?.quote ?? (await marcoBridgeService.quote(request))
      setPreparedSolanaTransaction(prepared?.serializedTransaction ?? '')
      setQuote(nextQuote)
      setReview(true)
      setTracking({ status: 'review' })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Live quote is currently unavailable.')
      setTracking({ status: 'action-required' })
    } finally {
      setQuoteLoading(false)
    }
  }

  const confirmSubmit = async () => {
    setError('')
    if (!canReview || sourceLocked) return
    let authority = routeAuthority
    if (!authority) {
      try {
        const response = await fetch(marcoBridgeApiPath('/api/marco-bridge/route-state'), { cache: 'no-store' })
        const payload = (await response.json()) as CanonicalMmnRouteState & { message?: string }
        if (!response.ok) throw new Error(payload.message || 'Canonical route authority is unavailable.')
        authority = payload
        setRouteAuthority(payload)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Canonical route authority is unavailable.')
        return
      }
    }
    if (!authority) {
      setError('Canonical route authority is unavailable.')
      return
    }
    const submitExecution = resolveRouteExecution(from, to, authority, quote)
    if (!submitExecution.executable) {
      setError(submitExecution.blockers[0] || 'This route is not publicly executable.')
      return
    }
    const quoteReason = liveQuoteBlockReason(quote)
    if (quoteReason && submitCta.label !== BRIDGE_COPY.switchToBnb) {
      setError(quoteReason)
      return
    }
    const ethereum = window.ethereum as unknown as BridgeEthereumProvider | undefined
    let submitSigner: WalletSubmitSigner | undefined = signer ?? undefined
    if (fromNetwork.chainId === ROBINHOOD_CHAIN_ID && ethereum) {
      try {
        await ensureRobinhoodWalletNetwork(ethereum)
        submitSigner = await bindInjectedSignerAfterNetworkSwitch(ethereum, ROBINHOOD_CHAIN_ID)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Add Robinhood Chain 4663 in the wallet.')
        return
      }
    }
    if (fromNetwork.chainId === ARC_CHAIN_ID && ethereum) {
      try {
        await ensureArcWalletNetwork(ethereum)
        submitSigner = await bindInjectedSignerAfterNetworkSwitch(ethereum, ARC_CHAIN_ID)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Add Arc Mainnet (chain 5042, native USDC) in the wallet.')
        return
      }
    }
    if (fromNetwork.chainId === POLYGON_CHAIN_ID && ethereum) {
      try {
        await ensurePolygonWalletNetwork(ethereum)
        submitSigner = await bindInjectedSignerAfterNetworkSwitch(ethereum, POLYGON_CHAIN_ID)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Add Polygon (chain 137, native POL) in the wallet.')
        return
      }
    }
    const reboundAfterSourceSwitch =
      Boolean(ethereum && submitSigner) &&
      (fromNetwork.chainId === POLYGON_CHAIN_ID ||
        fromNetwork.chainId === ARC_CHAIN_ID ||
        fromNetwork.chainId === ROBINHOOD_CHAIN_ID)
    if (!sourceNetworkCorrect && fromNetwork.chainId && canSwitch && !reboundAfterSourceSwitch) {
      void switchNetworkAsync(fromNetwork.chainId)
      return
    }
    if (fromNetwork.walletFamily !== 'solana' && !submitSigner) {
      setError('Connect the source wallet to sign the unsigned bridge transactions.')
      return
    }
    if (fromNetwork.walletFamily === 'solana') {
      const connected = readConnectedSolanaAddress(window.solana) || solanaWallet
      if (!connected) {
        setError('Connect the Solana wallet to sign the bridge send.')
        return
      }
      if (!preparedSolanaTransaction) {
        setError('Refresh the live quote to prepare and simulate the Solana transaction before signing.')
        return
      }
    }
    setSubmitting(true)
    setSubmissionPhase(approvalRequired ? 'approving' : 'confirming-wallet')
    try {
      const request = { from, to, amount, sourceWallet, destinationWallet: resolvedDestination }
      const nextQuote =
        fromNetwork.walletFamily === 'solana' && quote?.live ? quote : await marcoBridgeService.quote(request)
      setQuote(nextQuote)
      if (approvalRequired) {
        if (!signer) throw new Error('Connect the source wallet to sign the unsigned bridge transactions.')
        await submitMarcoApprovalFromWallet({
          request,
          authority,
          signer,
          allowanceLD: allowanceLD ?? '0',
        })
        if (!signer.provider) throw new Error('Wallet provider is unavailable.')
        const nextAllowance = await readErc20Allowance({
          token: CANONICAL_BNB_SOLANA_GATE.token,
          owner: sourceWallet,
          spender: CANONICAL_BNB_SOLANA_GATE.oftAdapter,
          provider: { call: (tx) => signer.provider!.call(tx) },
        })
        setAllowanceLD(nextAllowance)
        return
      }
      const nextTracking = await submitMarcoBridgeFromWallet({
        request,
        authority,
        signer: submitSigner,
        ethereum,
        allowanceLD: allowanceLD ?? '0',
        solanaWallet: fromNetwork.walletFamily === 'solana' ? window.solana : undefined,
        preparedSolanaTransaction: fromNetwork.walletFamily === 'solana' ? preparedSolanaTransaction : undefined,
        requestQuote: async () => nextQuote,
      })
      setTracking(nextTracking)
      setReview(true)
      if (nextTracking.sourceTx) {
        const tracked = await fetch(marcoBridgeApiPath(`/api/marco-bridge/track?sourceTx=${nextTracking.sourceTx}`), {
          cache: 'no-store',
        })
        if (tracked.ok) setTracking((await tracked.json()) as MarcoBridgeTracking)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Bridge submission failed.')
      setTracking((current) => (sourceSubmissionLocksControls(current) ? current : { status: 'action-required' }))
    } finally {
      setSubmitting(false)
      setSubmissionPhase('idle')
    }
  }

  const cta = !sourceWallet
    ? fromNetwork.walletFamily === 'solana'
      ? 'CONNECT SOLANA WALLET'
      : 'CONNECT WALLET'
    : !sourceNetworkCorrect
    ? from === 'bnb'
      ? BRIDGE_COPY.switchToBnb
      : 'SWITCH NETWORK'
    : !amount
    ? 'ENTER AMOUNT'
    : !validDestination
    ? 'CONFIRM DESTINATION WALLET'
    : route.kind === 'via-bnb'
    ? 'BRIDGE TO BNB FIRST'
    : route.kind === 'same-network'
    ? 'CHOOSE ANOTHER NETWORK'
    : quoteLoading
    ? 'FETCHING LIVE QUOTE'
    : quoteCta.label

  return (
    <Page
      $embedded={embedded}
      data-testid="marco-wave1-bridge"
      data-embedded={embedded ? 'true' : 'false'}
      data-public-activation={localRouteActivationEnabled(from, to) ? 'enabled' : 'disabled'}
      data-route-authority={routeAuthority ? 'canonical-live' : routeAuthorityError ? 'unavailable' : 'loading'}
      data-live-quote={quote?.live ? 'available' : 'unavailable'}
      data-solana-paused={solanaPaused ? 'true' : 'false'}
      data-route-executable={executable ? 'true' : 'false'}
      data-canonical-bnb-solana={from === 'bnb' && to === 'solana' ? 'true' : 'false'}
      data-quote-cta={quoteCta.label}
      data-submit-cta={submitCta.label}
      data-source-locked={sourceLocked ? 'true' : 'false'}
      data-native-block={nativeBlockReason ?? ''}
      data-native-read={nativeReadState}
      data-submission-phase={submissionPhase}
    >
      <Shell>
        {!embedded ? (
          <EvoTabs role="tablist" aria-label="Trade mode">
            <EvoTab href="/" role="tab" aria-selected={false}>
              <TabGlyph aria-hidden viewBox="0 0 24 24">
                <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />
              </TabGlyph>
              Swap
            </EvoTab>
            <EvoTab href="/bridge" role="tab" aria-selected $active>
              <TabGlyph aria-hidden viewBox="0 0 24 24">
                <path d="M3 17c0-5 4-9 9-9s9 4 9 9M7 17c0-2.8 2.2-5 5-5s5 2.2 5 5" />
              </TabGlyph>
              Bridge
            </EvoTab>
          </EvoTabs>
        ) : null}
        <Workspace $embedded={embedded}>
          <Card $embedded={embedded}>
            <h1 className="sr-only-bridge">MARCO Bridge</h1>
            <EvoPanel>
              <EvoPanelHead>
                <span>From</span>
              </EvoPanelHead>
              <EvoPanelBody>
                <EvoChip>
                  <EvoTokenIcon>
                    <img src="/images/56/tokens/0x963556de0eb8138E97A85F0A86eE0acD159D210b.png" alt="" />
                    <EvoChainBadge network={fromNetwork} />
                  </EvoTokenIcon>
                  <EvoChipText>
                    <strong>
                      MARCO <EvoChevron aria-hidden />
                    </strong>
                    <small>{fromNetwork.label.replace('Smart Chain', 'Chain')}</small>
                  </EvoChipText>
                  <select
                    aria-label="From network"
                    value={from}
                    disabled={sourceLocked}
                    onChange={(event) => {
                      applyRouteChange(event.target.value as MarcoBridgeNetworkId, to)
                    }}
                  >
                    {networkEntries.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.label}
                      </option>
                    ))}
                  </select>
                </EvoChip>
                <EvoAmount>
                  <input
                    inputMode="decimal"
                    aria-label="MARCO amount"
                    value={amount}
                    disabled={sourceLocked}
                    onChange={(event) => {
                      setAmount(event.target.value.replace(/[^0-9.]/g, ''))
                      resetQuote()
                    }}
                    placeholder="0"
                  />
                </EvoAmount>
              </EvoPanelBody>
            </EvoPanel>
            <EvoFlip
              type="button"
              aria-label="Swap networks"
              disabled={sourceLocked}
              onClick={() => {
                applyRouteChange(to, from)
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M8 4v15M4 15l4 4 4-4M16 20V5M12 9l4-4 4 4" />
              </svg>
            </EvoFlip>
            <EvoPanel>
              <EvoPanelHead>
                <span>To</span>
              </EvoPanelHead>
              <EvoPanelBody>
                <EvoChip>
                  <EvoTokenIcon>
                    <img src="/images/56/tokens/0x963556de0eb8138E97A85F0A86eE0acD159D210b.png" alt="" />
                    <EvoChainBadge network={toNetwork} />
                  </EvoTokenIcon>
                  <EvoChipText>
                    <strong>
                      MARCO <EvoChevron aria-hidden />
                    </strong>
                    <small>{toNetwork.label.replace('Smart Chain', 'Chain')}</small>
                  </EvoChipText>
                  <select
                    aria-label="To network"
                    value={to}
                    disabled={sourceLocked}
                    onChange={(event) => {
                      applyRouteChange(from, event.target.value as MarcoBridgeNetworkId)
                    }}
                  >
                    {networkEntries.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.label}
                      </option>
                    ))}
                  </select>
                </EvoChip>
                <EvoAmount as="div" aria-live="polite">
                  <output>{quote?.live ? quote.expectedReceive : '0'}</output>
                </EvoAmount>
              </EvoPanelBody>
            </EvoPanel>
            {fromNetwork.walletFamily === 'solana' ? (
              <WalletLine>
                <span>Source wallet</span>
                <strong>{short(sourceWallet)}</strong>
                {sourceWallet ? (
                  <span data-testid="solana-wallet-connected">{solanaWalletConnectionLabel(sourceWallet)}</span>
                ) : (
                  <ConnectSolana type="button" onClick={connectSolana} data-testid="solana-wallet-connect">
                    {solanaWalletConnectionLabel(sourceWallet)}
                  </ConnectSolana>
                )}
              </WalletLine>
            ) : null}
            {!sameFamily || showCustomDestination ? (
              <Field style={{ marginTop: 12 }}>
                <span>Destination wallet</span>
                <input
                  aria-label="Destination wallet"
                  value={resolvedDestination}
                  readOnly={sourceLocked}
                  placeholder={toNetwork.walletFamily === 'evm' ? '0x…' : 'Solana address'}
                  onChange={(event) => {
                    setDestination(event.target.value)
                    resetQuote()
                  }}
                />
              </Field>
            ) : (
              <EvoLinkButton type="button" onClick={() => setShowCustomDestination(true)} disabled={sourceLocked}>
                Send to a different wallet
              </EvoLinkButton>
            )}
            <EvoInfoRow>
              <EvoInfoCell>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
                <div>
                  <span>You receive</span>
                  <strong>{quote?.live ? `${quote.expectedReceive} MARCO` : '—'}</strong>
                </div>
              </EvoInfoCell>
              <EvoInfoCell>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <ellipse cx="12" cy="6.5" rx="7" ry="2.5" />
                  <path d="M5 6.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5M5 11.5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
                </svg>
                <div>
                  <span>Bridge fee</span>
                  <strong>
                    {quote?.live
                      ? `${quote.nativeFee} ${quote.nativeFeeSymbol}`
                      : quoteLoading
                      ? 'Fetching…'
                      : '—'}
                  </strong>
                </div>
              </EvoInfoCell>
              <EvoInfoCell>
                <svg viewBox="0 0 24 24" aria-hidden>
                  <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />
                </svg>
                <div>
                  <span>Route</span>
                  <EvoRoutePill $ok={route.kind === 'direct'} title={routeText}>{route.kind === 'direct' ? 'Direct' : route.kind === 'via-bnb' ? 'Via BNB' : '—'}</EvoRoutePill>
                </div>
              </EvoInfoCell>
            </EvoInfoRow>
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
              <EvoConnect>
                <ConnectWalletButton width="100%" mt="14px">
                  Connect Wallet
                </ConnectWalletButton>
              </EvoConnect>
            ) : (
              <Primary
                type="button"
                disabled={sourceLocked || quoteCta.disabled || quoteLoading || (!canReview && sourceNetworkCorrect)}
                onClick={fromNetwork.walletFamily === 'solana' && !sourceWallet ? connectSolana : openReview}
              >
                {cta}
              </Primary>
            )}
          </Card>
          <Card $embedded={embedded}>
            <CardHead>
              <strong>
                {sourceLocked || showCompletedDelivery
                  ? 'Delivery status'
                  : review
                  ? 'Review bridge'
                  : 'Delivery status'}
              </strong>
              <span>
                {showCompletedDelivery
                  ? BRIDGE_COPY.bridgeComplete
                  : sourceLocked
                  ? BRIDGE_COPY.bridgeInProgress
                  : submissionPhase === 'approving'
                  ? BRIDGE_COPY.approvingMarco
                  : submissionPhase === 'confirming-wallet'
                  ? BRIDGE_COPY.confirmBridgeInWallet
                  : 'TRACKED'}
              </span>
            </CardHead>
            {review && !sourceLocked && !completedDelivery ? (
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
                  <strong>{quote?.live ? `${quote.expectedReceive} MARCO` : '—'}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>LayerZero fee</span>
                  <strong>{quote?.live ? `${quote.nativeFee} ${quote.nativeFeeSymbol}` : '—'}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>Quote state</span>
                  <strong>{quote?.live ? `LIVE · ${new Date(quote.quotedAt).toLocaleTimeString()}` : '—'}</strong>
                </ReviewRow>
                <Notice $danger={Boolean(submitCta.reason && /INSUFFICIENT BNB/i.test(submitCta.reason))}>
                  {submitCta.reason
                    ? submitCta.reason
                    : executable
                    ? 'Live quote refreshed at review. Confirm the unsigned LayerZero send in your wallet.'
                    : executionBlockers[0] || 'This route is not publicly executable.'}
                </Notice>
                <Primary
                  type="button"
                  data-testid="marco-bridge-submit"
                  disabled={submitCta.disabled || quoteLoading}
                  onClick={confirmSubmit}
                >
                  {submitCta.label}
                </Primary>
              </Review>
            ) : (
              <>
                <Steps>
                  {MARCO_BRIDGE_PROGRESS.map((step, index) => (
                    <li
                      key={step.status}
                      data-state={stepStates[index]}
                      data-testid={`marco-bridge-step-${step.status}`}
                    >
                      <i>{index + 1}</i>
                      {step.label}
                    </li>
                  ))}
                </Steps>
                <Notice>{bridgeRecoveryMessage(tracking)}</Notice>
                {tracking.sourceTx ? (
                  <TransactionLink
                    href={layerZeroScanTxUrl(tracking.sourceTx)}
                    target="_blank"
                    rel="noreferrer"
                    title={tracking.sourceTx}
                    aria-label={`View transaction ${tracking.sourceTx} on LayerZero Scan`}
                    data-testid="layerzero-transaction-link"
                  >
                    <span>
                      <small>LayerZero transaction</small>
                      <strong>{short(tracking.sourceTx)}</strong>
                    </span>
                    <b>View on LayerZero Scan ↗</b>
                  </TransactionLink>
                ) : null}
              </>
            )}
            <Advanced>
              <summary>Advanced details</summary>
              <ul>
                <li>Source transaction: {tracking.sourceTx ?? '—'}</li>
                <li>Transfer GUID: {tracking.guid ?? '—'}</li>
                <li>Destination transaction: {tracking.destinationTx ?? '—'}</li>
                <li>
                  Route authority:{' '}
                  {routeAuthority
                    ? `${routeAuthority.binding_version} · canonical live · updated ${routeAuthority.updated_at}`
                    : routeAuthorityError || 'Loading canonical MMN authority…'}
                </li>
                <li>
                  LayerZero EIDs: BNB {MARCO_WAVE1_NETWORKS.bnb.layerZeroEid} · Base{' '}
                  {MARCO_WAVE1_NETWORKS.base.layerZeroEid} · Solana {MARCO_WAVE1_NETWORKS.solana.layerZeroEid} ·
                  Robinhood {MARCO_WAVE1_NETWORKS.robinhood.layerZeroEid} · Arc {MARCO_WAVE1_NETWORKS.arc.layerZeroEid}{' '}
                  · Polygon {MARCO_WAVE1_NETWORKS.polygon.layerZeroEid}
                </li>
                <li>Robinhood chain ID: {MARCO_WAVE1_NETWORKS.robinhood.chainId}</li>
                <li>
                  Arc chain ID: {MARCO_WAVE1_NETWORKS.arc.chainId} · native gas{' '}
                  {MARCO_WAVE1_NETWORKS.arc.nativeFeeSymbol}
                </li>
                <li>
                  Canonical MARCO: BNB {MARCO_WAVE1_NETWORKS.bnb.marcoIdentity} · Base{' '}
                  {MARCO_WAVE1_NETWORKS.base.marcoIdentity} · Robinhood {MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity} ·
                  Arc {MARCO_WAVE1_NETWORKS.arc.marcoIdentity} · Polygon {MARCO_WAVE1_NETWORKS.polygon.marcoIdentity}
                </li>
                <li>
                  Solana mint/store: {MARCO_WAVE1_NETWORKS.solana.marcoIdentity} ·{' '}
                  {MARCO_WAVE1_NETWORKS.solana.endpointContract}
                </li>
                <li>
                  Global execution:{' '}
                  {routeAuthority ? (routeAuthority.global_execution_enabled ? 'enabled' : 'disabled') : 'unavailable'}
                </li>
                <li>
                  Public activation: {MARCO_WAVE1_PUBLIC_ACTIVATION.enabled ? 'enabled' : 'disabled'} · this route{' '}
                  {localRouteActivationEnabled(from, to) ? 'on' : 'off'}
                </li>
                <li>
                  Canonical BNB→Solana gate:{' '}
                  {solanaPaused ? 'blocked by live store pause' : 'active · live store paused=false'}
                </li>
                <li>Solana store: {solanaPaused ? 'paused' : 'active'}</li>
                <li>
                  Activation blockers:{' '}
                  {(executionBlockers.length ? executionBlockers : wave1ActivationBlockers()).join(' · ') || 'None'}
                </li>
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
