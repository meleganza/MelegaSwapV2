import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { typography } from 'design-system/melega'
import {
  BRIDGE_COPY,
  layerZeroScanTxUrl,
  liveQuoteBlockReason,
  marcoBridgeStepStates,
  resolveQuoteCta,
  resolveSubmitCta,
  sourceSubmissionLocksControls,
  type MarcoBridgeSubmissionPhase,
} from 'lib/marco-bridge/bridgeActionState'
import { CANONICAL_BNB_SOLANA_GATE } from 'lib/marco-bridge/canonicalBnbSolanaGate'
import { isRouteExecutable, routeExecutionBlockers } from 'lib/marco-bridge/executableRoutes'
import { MARCO_BRIDGE_PROGRESS, bridgeRecoveryMessage } from 'lib/marco-bridge/lifecycle'
import {
  BNB_GAS_PRICE_FALLBACK_WEI,
  resolveNativeFundsBlockReason,
  type NativeFundsReadState,
} from 'lib/marco-bridge/nativeFunds'
import { planMarcoBridgeRoute } from 'lib/marco-bridge/routePolicy'
import { ensureRobinhoodWalletNetwork } from 'lib/marco-bridge/robinhoodChain'
import { marcoBridgeService } from 'lib/marco-bridge/service'
import type { CanonicalMmnRouteState } from 'lib/marco-bridge/routeAuthority'
import type { MarcoBridgeNetworkId, MarcoBridgeQuote, MarcoBridgeTracking } from 'lib/marco-bridge/types'
import { readErc20Allowance, submitMarcoApprovalFromWallet, submitMarcoBridgeFromWallet } from 'lib/marco-bridge/walletSubmit'
import {
  MARCO_WAVE1_NETWORKS,
  MARCO_WAVE1_PUBLIC_ACTIVATION,
  localRouteActivationEnabled,
  wave1ActivationBlockers,
} from 'lib/marco-bridge/wave1Registry'
import { isValidMarcoDestination, parseBridgeAmount, requiresExplicitDestination, validateBridgeAmount } from 'lib/marco-bridge/validation'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
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
const cinematicDrift = keyframes`
  0%, 100% { transform: scale(1.045) translate3d(0, 0, 0); }
  50% { transform: scale(1.085) translate3d(-1.2%, -0.8%, 0); }
`
const Hero = styled.header<{ $embedded?: boolean }>`
  position: relative;
  isolation: isolate;
  min-height: 260px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 18px;
  padding: 32px;
  overflow: hidden;
  border: 1px solid rgba(244, 196, 48, 0.17);
  border-radius: 18px;
  background: #050606;
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
    min-height: 300px;
    padding: 24px 20px;
    align-items: start;
    flex-direction: column;
    justify-content: flex-end;
  }

  ${({ $embedded }) => ($embedded ? 'display: none;' : '')}
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
const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
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
  a {
    color: #f4c430;
  }
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
    color: rgba(255, 255, 255, 0.52);
    font-size: 12px;
  }
  li[data-state='completed'] {
    color: rgba(244, 196, 48, 0.92);
  }
  li[data-state='current'] {
    color: #f5f5f5;
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
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const [from, setFrom] = useState<MarcoBridgeNetworkId>('bnb')
  const [to, setTo] = useState<MarcoBridgeNetworkId>('robinhood')
  const [submitting, setSubmitting] = useState(false)
  const [submissionPhase, setSubmissionPhase] = useState<MarcoBridgeSubmissionPhase>('idle')
  const [amount, setAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [solanaWallet, setSolanaWallet] = useState('')
  const [review, setReview] = useState(false)
  const [quote, setQuote] = useState<MarcoBridgeQuote | null>(null)
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
  const executable = Boolean(routeAuthority && isRouteExecutable(from, to, routeAuthority))
  const executionBlockers = routeAuthority ? routeExecutionBlockers(from, to, routeAuthority) : []
  const solanaPaused = Boolean(
    routeAuthority?.networks.find((network) => network.id === 'solana')?.paused ??
      MARCO_WAVE1_NETWORKS.solana.protectivePaused,
  )
  const parsedAmount = parseBridgeAmount(amount, fromNetwork.tokenDecimals)
  const approvalRequired = Boolean(
    from === 'bnb' &&
      parsedAmount &&
      (allowanceLD == null || BigNumber.from(allowanceLD).lt(parsedAmount.amountLD)),
  )
  const sourceLocked = sourceSubmissionLocksControls(tracking)
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
    let cancelled = false
    void fetch('/api/marco-bridge/route-state', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as CanonicalMmnRouteState & { message?: string }
        if (!response.ok) throw new Error(payload.message || 'Canonical route authority is unavailable.')
        if (!cancelled) setRouteAuthority(payload)
      })
      .catch((cause) => {
        if (!cancelled) setRouteAuthorityError(cause instanceof Error ? cause.message : 'Route authority unavailable.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const resetQuote = () => {
    setQuote(null)
    setQuoteLoading(false)
    setReview(false)
  }

  useEffect(() => {
    setQuote(null)
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
      void fetch(`/api/marco-bridge/track?sourceTx=${tracking.sourceTx}`, { cache: 'no-store' })
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
      const nextQuote = await marcoBridgeService.quote(request)
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
    if (!routeAuthority || !canReview || sourceLocked) return
    const quoteReason = liveQuoteBlockReason(quote)
    if (quoteReason && submitCta.label !== BRIDGE_COPY.switchToBnb) {
      setError(quoteReason)
      return
    }
    if (fromNetwork.chainId === 4663 && window.ethereum) {
      try {
        await ensureRobinhoodWalletNetwork(window.ethereum)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Add Robinhood Chain 4663 in the wallet.')
        return
      }
    }
    if (!sourceNetworkCorrect && fromNetwork.chainId && canSwitch) {
      void switchNetworkAsync(fromNetwork.chainId)
      return
    }
    if (!signer) {
      setError('Connect the source wallet to sign the unsigned bridge transactions.')
      return
    }
    setSubmitting(true)
    setSubmissionPhase(approvalRequired ? 'approving' : 'confirming-wallet')
    try {
      const request = { from, to, amount, sourceWallet, destinationWallet: resolvedDestination }
      const nextQuote = await marcoBridgeService.quote(request)
      setQuote(nextQuote)
      if (approvalRequired) {
        await submitMarcoApprovalFromWallet({
          request,
          authority: routeAuthority,
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
        authority: routeAuthority,
        signer,
        ethereum: window.ethereum,
        allowanceLD: allowanceLD ?? '0',
      })
      setTracking(nextTracking)
      setReview(true)
      if (nextTracking.sourceTx) {
        const tracked = await fetch(`/api/marco-bridge/track?sourceTx=${nextTracking.sourceTx}`, { cache: 'no-store' })
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
        <Hero $embedded={embedded}>
          <HeroArtwork src="/images/bridge/marco-bridge-hero.webp" alt="" aria-hidden="true" />
          <HeroVeil aria-hidden="true" />
          <HeroCopy>
            <h1>MARCO Bridge</h1>
            <p>Move MARCO across certified networks. One route, one tracked delivery.</p>
          </HeroCopy>
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
                  disabled={sourceLocked}
                  onChange={(event) => {
                    setFrom(event.target.value as MarcoBridgeNetworkId)
                    setDestination('')
                    resetQuote()
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
                disabled={sourceLocked}
                onClick={() => {
                  setFrom(to)
                  setTo(from)
                  setDestination('')
                  resetQuote()
                }}
              >
                ⇄
              </SwapNetworks>
              <Field>
                <span>To</span>
                <select
                  value={to}
                  disabled={sourceLocked}
                  onChange={(event) => {
                    setTo(event.target.value as MarcoBridgeNetworkId)
                    setDestination('')
                    resetQuote()
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
                readOnly={sourceLocked || (sameFamily && Boolean(sourceWallet) && !destination)}
                placeholder={toNetwork.walletFamily === 'evm' ? '0x…' : 'Solana address'}
                onChange={(event) => {
                  setDestination(event.target.value)
                  resetQuote()
                }}
              />
            </Field>
            <AmountRow>
              <Field>
                <span>Amount</span>
                <input
                  inputMode="decimal"
                  aria-label="MARCO amount"
                  value={amount}
                  disabled={sourceLocked}
                  onChange={(event) => {
                    setAmount(event.target.value.replace(/[^0-9.]/g, ''))
                    resetQuote()
                  }}
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
                <strong>{quote?.live ? `${quote.expectedReceive} MARCO` : 'QUOTE UNAVAILABLE'}</strong>
              </SummaryCell>
              <SummaryCell>
                <span>Fees</span>
                <strong>
                  {quote?.live
                    ? `${quote.nativeFee} ${quote.nativeFeeSymbol}`
                    : quoteLoading
                    ? 'FETCHING LIVE QUOTE'
                    : 'QUOTE UNAVAILABLE'}
                </strong>
              </SummaryCell>
              <SummaryCell>
                <span>Quote state</span>
                <strong>
                  {quote?.live ? `LIVE · ${new Date(quote.quotedAt).toLocaleTimeString()}` : 'QUOTE UNAVAILABLE'}
                </strong>
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
                disabled={sourceLocked || quoteCta.disabled || quoteLoading || (!canReview && sourceNetworkCorrect)}
                onClick={fromNetwork.walletFamily === 'solana' && !sourceWallet ? connectSolana : openReview}
              >
                {cta}
              </Primary>
            )}
          </Card>
          <Card $embedded={embedded}>
            <CardHead>
              <strong>{sourceLocked || tracking.status === 'delivered' ? 'Delivery status' : review ? 'Review bridge' : 'Delivery status'}</strong>
              <span>
                {tracking.status === 'delivered'
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
            {review && !sourceLocked ? (
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
                  <strong>{quote?.live ? `${quote.expectedReceive} MARCO` : 'QUOTE UNAVAILABLE'}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>LayerZero fee</span>
                  <strong>{quote?.live ? `${quote.nativeFee} ${quote.nativeFeeSymbol}` : 'QUOTE UNAVAILABLE'}</strong>
                </ReviewRow>
                <ReviewRow>
                  <span>Quote state</span>
                  <strong>
                    {quote?.live ? `LIVE · ${new Date(quote.quotedAt).toLocaleTimeString()}` : 'UNAVAILABLE'}
                  </strong>
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
                    <li key={step.status} data-state={stepStates[index]} data-testid={`marco-bridge-step-${step.status}`}>
                      <i>{index + 1}</i>
                      {step.label}
                    </li>
                  ))}
                </Steps>
                <Notice>{bridgeRecoveryMessage(tracking)}</Notice>
                {tracking.sourceTx ? (
                  <Notice>
                    Source tx {tracking.sourceTx}. Track on{' '}
                    <a href={layerZeroScanTxUrl(tracking.sourceTx)} target="_blank" rel="noreferrer">
                      LayerZero Scan
                    </a>
                    .
                  </Notice>
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
                  Robinhood {MARCO_WAVE1_NETWORKS.robinhood.layerZeroEid}
                </li>
                <li>Robinhood chain ID: {MARCO_WAVE1_NETWORKS.robinhood.chainId}</li>
                <li>
                  Canonical MARCO: BNB {MARCO_WAVE1_NETWORKS.bnb.marcoIdentity} · Base{' '}
                  {MARCO_WAVE1_NETWORKS.base.marcoIdentity} · Robinhood {MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity}
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
                <li>Activation blockers: {(executionBlockers.length ? executionBlockers : wave1ActivationBlockers()).join(' · ') || 'None'}</li>
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
