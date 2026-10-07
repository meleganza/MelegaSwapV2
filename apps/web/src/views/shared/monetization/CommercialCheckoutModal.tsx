/**
 * One-surface visibility checkout.
 * Project identity is resolved before a commercial offer can be reviewed.
 * Products without verified settlement/fulfilment remain visible but fail closed.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAccount, useSigner } from 'wagmi'
import { MarcoPay } from 'components/MarcoWidgets'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  MelegaModalFooter,
  MelegaModalFooterActions,
  MelegaModalFooterMeta,
} from 'design-system/melega/components/Modal'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { MARCO_BSC_ADDRESS, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import MelegaTokenAvatar from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { RC_COPY } from 'lib/monetization/copy'
import { FEATURED_OFFER } from 'lib/featured-placement/constants'
import { cashbackUserMessage } from 'lib/featured-placement/cashback'
import {
  FEATURED_FARM_PACKAGES,
  FEATURED_PACKAGES,
  FEATURED_POOL_PACKAGES,
  SPONSORED_RESEARCH_PACKAGES,
  TREND_BOOST_PACKAGES,
  type MonetizationAsset,
  type PlacementPackage,
} from 'lib/monetization/packages'
import { VISIBILITY_RUNTIME, canAcceptMCreditsPayment, visibilityCheckoutBlocker } from 'lib/monetization/visibilityRuntime'
import { bindCheckoutTarget } from 'lib/monetization/checkoutTargetBinding'
import {
  TOKEN_DETECTION_TIMEOUT_MESSAGE,
  TOKEN_DETECTION_TIMEOUT_MS,
} from 'lib/monetization/tokenDetectionBudget'
import {
  assessPaymentWalletChain,
  resolvePaymentWalletForSettlement,
} from 'lib/monetization/paymentWalletChain'
import {
  assignMarcoPayHandoff,
  beginMarcoPayIsolation,
  endMarcoPayIsolation,
  isMarcoPayWalletFlightActive,
  MARCO_PASSPORT_URL,
  marcoPayRewardNotice,
  openMarcoPayHandoffWindow,
  readMarcoPayHandoffSession,
  runMarcoPaySingleFlight,
} from 'lib/marco-pay/approval'
import type { MarcoPayWalletTransfer } from 'lib/marco-pay/walletTransfer'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import type { WalletFlowStage } from 'lib/monetization/copy'
import {
  authorizeMCreditsSpendForOrder,
  mCreditsCheckoutBlocker,
  readMCreditsPassport,
  refreshMCreditsQuote,
} from 'lib/mcredits/passportState'
import { loadMCreditsReceipt, saveMCreditsReceipt } from 'lib/mcredits/receipt'
import { dexReferralCatalogRef } from 'lib/marco-referral/catalog'
import { fetchMarcoPayReadiness, type MarcoPayReadiness } from 'lib/marco-pay/clientReadiness'
import {
  MARCO_REFERRAL_CHANGE_EVENT,
  getBrowserMarcoReferralStorage,
  readStoredMarcoReferral,
  resolveMarcoReferralForCheckout,
} from 'lib/marco-referral/client'
import { MelegaModal } from './BoostCheckoutShell'
import {
  VISIBILITY_SERVICES,
  type CommercialCheckoutStep,
  type CommercialPaymentAsset,
  type CommercialServiceId,
} from './commercialCheckoutTypes'
import { appendMarketingHistory } from './marketingHistory'

type MarcoPayOrderConfig = {
  orderId: string
  application: string
  amount: string
  currency: string
  product: string | null
  reference: string
  paymentId: string
  approvalUrl: string
  wallet: MarcoPayWalletTransfer | null
  referenceAmountMinor: string
  referralApplied: boolean
  referralCode: string | null
  referralDiscountMinor: string | null
}

const IDENTITY_CHAINS = [
  { id: 56, label: 'BNB Chain', short: 'BSC' },
  { id: 1, label: 'Ethereum', short: 'ETH' },
  { id: 8453, label: 'Base', short: 'BASE' },
  { id: 137, label: 'Polygon', short: 'POL' },
] as const

const PAYMENT_ASSET_META: Record<
  CommercialPaymentAsset,
  { label: string; symbol: string; address?: string; logoURI?: string; purple?: boolean }
> = {
  BNB: {
    label: 'BNB',
    symbol: 'BNB',
    address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  },
  USDT: {
    label: 'USDT',
    symbol: 'USDT',
    address: '0x55d398326f99059ff775485246999027b3197955',
  },
  USDC: {
    label: 'USDC',
    symbol: 'USDC',
    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  },
  MARCO: {
    label: 'MARCO',
    symbol: 'MARCO',
    address: MARCO_BSC_ADDRESS,
    logoURI: MARCO_LOGO_URI,
  },
  MARCO_PAY: {
    label: 'MARCO Pay',
    symbol: 'M',
    logoURI: MARCO_LOGO_URI,
    purple: true,
  },
  M_CREDITS: {
    label: 'M-Credits\nMARCO PASSPORT',
    symbol: 'M',
    logoURI: '/images/m-credits-logo.png',
    purple: true,
  },
}

type SettlementMarket = {
  marcoUsd?: number
  bnbUsd?: number
  loading: boolean
}

function formatApproxNumber(value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)
}

function resolveSettlementEstimate(
  payment: CommercialPaymentAsset,
  totalUsd: number,
  market: SettlementMarket,
): { amount: string; label: string } {
  if (payment === 'MARCO') {
    if (!market.marcoUsd || market.marcoUsd <= 0) {
      return { amount: market.loading ? 'Refreshing quote…' : 'Final quote at checkout', label: 'MARCO' }
    }
    return {
      amount: `≈ ${formatApproxNumber(totalUsd / market.marcoUsd, 0)} MARCO`,
      label: 'MARCO',
    }
  }
  if (payment === 'BNB') {
    if (!market.bnbUsd || market.bnbUsd <= 0) {
      return { amount: market.loading ? 'Refreshing quote…' : 'Final quote at checkout', label: 'BNB' }
    }
    return {
      amount: `≈ ${formatApproxNumber(totalUsd / market.bnbUsd, 6)} BNB`,
      label: 'BNB',
    }
  }
  if (payment === 'USDT' || payment === 'USDC') {
    return { amount: `≈ ${formatApproxNumber(totalUsd, 2)} ${payment}`, label: payment }
  }
  if (payment === 'M_CREDITS') {
    return { amount: `≈ ${formatApproxNumber(totalUsd, 2)} M-Credits`, label: 'M-Credits' }
  }
  return { amount: `$${formatApproxNumber(totalUsd, 2)} via MARCO PAY`, label: 'MARCO PAY' }
}

type DetectedProject = {
  tier: 'canonical' | 'pending'
  name: string
  symbol: string
  contract: string
  chainId: number
  decimals: number | null
  totalSupply: string | null
  logoUrl: string | null
  slug: string | null
  projectPageExists: boolean
  explorerUrl: string | null
  dexListed: boolean
  website: string | null
}

type EligibleVisibilityTarget = {
  id: string
  kind: 'farm' | 'pool'
  chainId: number
  title: string
  detail: string
  contractAddress: string
  pid?: number
  stakeSymbol?: string
  rewardSymbol?: string
}

const Grid = styled.div<{ $serviceWide?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 920px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const pricePulse = keyframes`
  0%, 100% { text-shadow: 0 0 0 rgba(244, 196, 48, 0); transform: translateY(0); }
  50% { text-shadow: 0 0 14px rgba(244, 196, 48, .32); transform: translateY(-1px); }
`

const ServiceCard = styled.button<{ $on?: boolean; $live?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  min-height: 86px;
  padding: 11px 13px;
  border-radius: 14px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.11)' : 'rgba(255,255,255,.025)')};
  color: ${uxRebuildColors.text};
  opacity: ${({ $live }) => ($live ? 1 : 0.72)};
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  grid-template-areas:
    'icon title price'
    'icon desc price';
  align-items: center;
  column-gap: 9px;
  row-gap: 3px;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(221, 185, 47, 0.62);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

`

const ServiceIcon = styled.div`
  grid-area: icon;
  color: ${uxRebuildColors.gold};
  font-size: 17px;
`

const STitle = styled.div`
  grid-area: title;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 780;
`

const SDesc = styled.div`
  grid-area: desc;
  font-size: 10px;
  line-height: 1.35;
  color: ${uxRebuildColors.secondary};
`

const SPrice = styled.div`
  grid-area: price;
  margin-left: 6px;
  text-align: right;
  color: ${uxRebuildColors.gold};
  display: inline-flex;
  flex-direction: column;
  align-items: baseline;
  justify-content: flex-end;
  gap: 1px;
  font-weight: 760;
  animation: ${pricePulse} 2.8s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SPricePrefix = styled.span`
  font-size: 9px;
  font-weight: 680;
  color: rgba(221, 185, 47, 0.76);
`

const SPriceValue = styled.span`
  font-size: 11px;
  line-height: 1.2;
`

const PkgGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 920px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  @media (max-width: 639px) {
    gap: 7px;
  }
`

const PkgCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: center;
  min-height: 132px;
  padding: 14px 10px;
  border-radius: 12px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.1)' : 'rgba(255,255,255,.025)')};
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: transform 0.22s ease, border-color 0.22s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(221, 185, 47, 0.62);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 639px) {
    min-height: 94px;
    max-width: 100%;
    padding: 10px 7px;
    gap: 4px;
  }
`

const PackagePrice = styled.div`
  margin-top: 4px;
  color: ${uxRebuildColors.gold};
  font-size: 24px;
  line-height: 1;
  font-weight: 840;
  animation: ${pricePulse} 2.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 639px) {
    font-size: 21px;
  }
`

const TargetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;

  @media (max-width: 680px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

const TargetCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-width: 0;
  min-height: 76px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.68)' : 'rgba(255,255,255,.11)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.1)' : 'rgba(255,255,255,.025)')};
  color: ${uxRebuildColors.text};
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;

  &:hover {
    border-color: rgba(221, 185, 47, 0.58);
  }
`

const TargetTitle = styled.strong`
  font-size: 13px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TargetDetail = styled.span`
  color: ${uxRebuildColors.secondary};
  font-size: 11px;
  line-height: 1.35;
`

const TargetState = styled.div`
  margin-top: 10px;
  min-height: 52px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  display: flex;
  align-items: center;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
`

const Badge = styled.span<{ $purple?: boolean; $green?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid
    ${({ $purple, $green }) =>
      $purple ? 'rgba(155,91,255,.6)' : $green ? 'rgba(54,211,153,.5)' : 'rgba(255,255,255,.13)'};
  color: ${({ $purple, $green }) => ($purple ? '#caa8ff' : $green ? '#65dfa8' : 'rgba(255,255,255,.72)')};
  background: ${({ $purple, $green }) =>
    $purple ? 'rgba(128,67,220,.16)' : $green ? 'rgba(32,158,105,.12)' : 'rgba(255,255,255,.03)'};
  font-size: 9px;
  font-weight: 780;
  letter-spacing: 0.035em;
  text-transform: uppercase;
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 13px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.12)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.13)' : 'rgba(255,255,255,.035)')};
  color: ${({ $on }) => ($on ? uxRebuildColors.gold : '#e8e8e8')};
  font-size: 12px;
  font-weight: 720;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
`

const CashbackSticker = styled.span`
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(172, 104, 255, 0.72);
  background: #5d27a8;
  color: #f2e8ff;
  box-shadow: 0 4px 14px rgba(117, 51, 210, 0.35);
  font-size: 8px;
  line-height: 1.2;
  font-weight: 850;
  letter-spacing: 0.04em;
  white-space: nowrap;
`

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 760px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1080px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 639px) {
    gap: 8px;
  }
`

const PaymentCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  position: relative;
  min-width: 0;
  min-height: 154px;
  padding: 16px 10px 14px;
  border-radius: 14px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(244,196,48,.78)' : 'rgba(255,255,255,.13)')};
  background: ${({ $on }) =>
    $on
      ? 'radial-gradient(circle at 50% 30%, rgba(244,196,48,.17), rgba(244,196,48,.055) 58%, rgba(255,255,255,.02))'
      : 'rgba(255,255,255,.026)'};
  box-shadow: ${({ $on }) => ($on ? '0 0 24px rgba(244,196,48,.12), inset 0 0 20px rgba(244,196,48,.04)' : 'none')};
  color: ${uxRebuildColors.text};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(244, 196, 48, 0.62);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.46;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 639px) {
    min-height: 116px;
    max-width: 100%;
    padding: 12px 7px 10px;
    gap: 6px;
  }
`

const PaymentBetaBadge = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  min-height: 16px;
  padding: 0 6px;
  border-radius: ${uxRebuildRadius.pill};
  border: 1px solid rgba(244, 196, 48, 0.42);
  background: rgba(244, 196, 48, 0.1);
  color: ${uxRebuildColors.gold};
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1;
  pointer-events: none;
`

const PaymentSelected = styled.span`
  position: absolute;
  top: 11px;
  left: 11px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: ${uxRebuildColors.gold};
  color: #111;
  font-size: 11px;
  font-weight: 900;
`

const PaymentLogoShell = styled.span<{ $purple?: boolean }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid ${({ $purple }) => ($purple ? 'rgba(171,104,255,.52)' : 'rgba(255,255,255,.18)')};
  background: ${({ $purple }) => ($purple ? 'rgba(102,44,171,.16)' : 'rgba(255,255,255,.035)')};
  box-shadow: ${({ $purple }) => ($purple ? '0 0 18px rgba(137,66,214,.2)' : 'inset 0 0 12px rgba(255,255,255,.035)')};
  display: grid;
  place-items: center;
  overflow: hidden;
  color: ${({ $purple }) => ($purple ? '#b77aff' : uxRebuildColors.gold)};
  font-size: 24px;
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 639px) {
    width: 42px;
    height: 42px;
    font-size: 20px;
  }
`

const PaymentName = styled.strong`
  min-height: 32px;
  display: grid;
  place-items: center;
  font-size: 14px;
  line-height: 1.12;
  text-align: center;
  white-space: pre-line;

  @media (max-width: 639px) {
    min-height: 24px;
    font-size: 12px;
  }
`

const PaymentNetwork = styled.span`
  min-height: 21px;
  padding: 2px 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 10px;
  line-height: 15px;

  @media (max-width: 639px) {
    min-height: 18px;
    padding: 1px 7px;
    font-size: 9px;
  }
`

const PremiumCashbackSticker = styled(CashbackSticker)`
  top: 8px;
  left: 50%;
  right: auto;
  width: max-content;
  max-width: calc(100% - 18px);
  box-sizing: border-box;
  padding: 5px 9px;
  font-size: clamp(7px, 0.72vw, 9px);
  line-height: 1.05;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SettlementSummary = styled.section`
  margin-top: 14px;
  border: 1px solid rgba(221, 185, 47, 0.34);
  border-radius: 14px;
  background: linear-gradient(120deg, rgba(221, 185, 47, 0.055), rgba(255, 255, 255, 0.018));
  overflow: hidden;
`

const SettlementMain = styled.div`
  display: grid;
  grid-template-columns: minmax(170px, 1.2fr) repeat(3, minmax(120px, 1fr));
  align-items: center;
  min-height: 92px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: 0;
  }
`

const SettlementCell = styled.div<{ $title?: boolean }>`
  min-width: 0;
  padding: 15px 18px;
  border-left: ${({ $title }) => ($title ? 'none' : '1px solid rgba(255,255,255,.1)')};

  @media (max-width: 820px) {
    border-left: none;
    border-top: ${({ $title }) => ($title ? 'none' : '1px solid rgba(255,255,255,.075)')};
  }

  @media (max-width: 520px) {
    grid-column: ${({ $title }) => ($title ? '1 / -1' : 'auto')};
    padding: 10px 11px;
  }
`

const SettlementTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  color: ${uxRebuildColors.text};
  font-size: 15px;
  font-weight: 780;
`

const SettlementGlyph = styled.span`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.08);
  box-shadow: 0 0 16px rgba(244, 196, 48, 0.12);
  color: ${uxRebuildColors.gold};
  font-size: 20px;
`

const SettlementLabel = styled.div`
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.56);
  font-size: 10px;
`

const SettlementValue = styled.div<{ $gold?: boolean }>`
  color: ${({ $gold }) => ($gold ? uxRebuildColors.gold : uxRebuildColors.text)};
  font-size: ${({ $gold }) => ($gold ? '19px' : '17px')};
  line-height: 1.15;
  font-weight: 800;
  overflow-wrap: anywhere;
`

const SettlementNote = styled.div`
  padding: 9px 16px 11px;
  border-top: 1px solid rgba(221, 185, 47, 0.22);
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  line-height: 1.45;
  text-align: center;

  strong {
    color: #b77aff;
  }
`

const ReviewStage = styled.div`
  width: min(100%, 720px);
  margin: 2px auto 0;
`

const ReviewCard = styled.section`
  padding: 22px 24px 14px;
  border: 1px solid rgba(221, 185, 47, 0.34);
  border-radius: 14px;
  background: radial-gradient(circle at 50% 0, rgba(244, 196, 48, 0.055), transparent 42%), rgba(255, 255, 255, 0.018);

  @media (max-width: 639px) {
    padding: 15px 14px 12px;
  }
`

const ReviewTitle = styled.h3`
  margin: 0;
  color: ${uxRebuildColors.text};
  font-size: 24px;
  line-height: 1.2;
  font-weight: 820;
  text-align: center;
`

const ReviewDivider = styled.div`
  height: 1px;
  margin: 16px 0;
  background: linear-gradient(90deg, transparent, rgba(244, 196, 48, 0.72), transparent);
  box-shadow: 0 0 9px rgba(244, 196, 48, 0.3);
`

const ReviewRows = styled.div`
  display: grid;
  gap: 11px;
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;

  strong {
    color: ${uxRebuildColors.text};
    font-size: 13px;
    text-align: right;
  }
`

const ReviewTotal = styled(ReviewRow)`
  font-size: 17px;
  font-weight: 800;

  strong {
    color: ${uxRebuildColors.gold};
    font-size: 24px;
    text-shadow: 0 0 15px rgba(244, 196, 48, 0.25);
  }
`

const ReviewQuote = styled.div`
  margin-top: 14px;
  padding: 14px 16px 12px;
  border: 1px solid rgba(244, 196, 48, 0.62);
  border-radius: 13px;
  background: radial-gradient(circle at 50% 20%, rgba(244, 196, 48, 0.14), rgba(244, 196, 48, 0.04) 62%);
  box-shadow: 0 0 22px rgba(244, 196, 48, 0.1), inset 0 0 18px rgba(244, 196, 48, 0.035);
  text-align: center;
`

const ReviewQuoteLabel = styled.div`
  color: rgba(244, 196, 48, 0.86);
  font-size: 12px;
`

const ReviewQuoteValue = styled.div`
  margin-top: 5px;
  color: ${uxRebuildColors.gold};
  font-size: clamp(23px, 4vw, 34px);
  line-height: 1.05;
  font-weight: 860;
  text-shadow: 0 0 16px rgba(244, 196, 48, 0.25);
`

const ReviewQuoteNote = styled.div`
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
`

const VerifiedSettlement = styled.div<{ $error?: boolean }>`
  margin-top: 10px;
  min-height: 40px;
  padding: 7px 12px;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(255,104,104,.4)' : 'rgba(81,180,111,.44)')};
  border-radius: 10px;
  background: ${({ $error }) => ($error ? 'rgba(160,40,40,.1)' : 'rgba(33,126,62,.09)')};
  color: ${({ $error }) => ($error ? '#ffaaa8' : '#a6d69f')};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
`

const PaymentAssetLogo: React.FC<{ asset: CommercialPaymentAsset }> = ({ asset }) => {
  const meta = PAYMENT_ASSET_META[asset]
  if (meta.address) {
    return (
      <PaymentLogoShell $purple={meta.purple}>
        <MelegaTokenAvatar
          symbol={meta.symbol}
          address={meta.address}
          chainId={56}
          logoURI={meta.logoURI}
          size={50}
          radius="circle"
          alt=""
        />
      </PaymentLogoShell>
    )
  }
  return (
    <PaymentLogoShell $purple={meta.purple}>
      {meta.logoURI ? <img src={meta.logoURI} alt="" aria-hidden="true" /> : meta.symbol}
    </PaymentLogoShell>
  )
}

const Input = styled.input`
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f4f4f4;
  padding: 0 13px;
  font-size: 13px;
  outline: none;
  &:focus {
    border-color: rgba(221, 185, 47, 0.58);
  }
`





const DetectRow = styled.div`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  gap: 8px;
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`

const Select = styled.select`
  min-height: 44px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f2f2f2;
  padding: 0 12px;
`

const Identity = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
`

const IdentityChip = styled.div`
  width: fit-content;
  max-width: 100%;
  display: grid;
  grid-template-columns: auto minmax(0, auto);
  align-items: center;
  gap: 10px;
  padding: 7px 11px 7px 7px;
  border: 1px solid rgba(221, 185, 47, 0.3);
  border-radius: 999px;
  background: rgba(221, 185, 47, 0.055);

  @media (max-width: 639px) {
    max-width: 132px;
    gap: 7px;
    padding: 5px 8px 5px 5px;

    > div:last-child {
      min-width: 0;
      overflow: hidden;
    }

    strong {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: #0c0d0f;
  color: ${uxRebuildColors.gold};
  font-weight: 800;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ProjectLogo: React.FC<{ project: DetectedProject; compact?: boolean }> = ({ project, compact = false }) => {
  const size = compact ? 38 : 48
  return (
    <Logo style={compact ? { width: size, height: size } : undefined}>
      <MelegaTokenAvatar
        symbol={project.symbol}
        name={project.name}
        address={project.contract}
        chainId={project.chainId}
        logoURI={project.logoUrl}
        size={size}
        radius="circle"
        alt={`${project.name} logo`}
      />
    </Logo>
  )
}

const Alert = styled.div<{ $error?: boolean }>`
  padding: 10px 12px;
  border-radius: 11px;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(255,104,104,.4)' : 'rgba(221,185,47,.32)')};
  background: ${({ $error }) => ($error ? 'rgba(160,40,40,.1)' : 'rgba(221,185,47,.07)')};
  color: ${({ $error }) => ($error ? '#ffaaa8' : '#ddd0a0')};
  font-size: 11px;
  line-height: 1.45;
`

const GhostBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #ddd;
  font-size: 12px;
  font-weight: 720;
`

const PrimaryBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 15px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.65);
  background: rgba(221, 185, 47, 0.16);
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 780;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const SecurePrimaryBtn = styled(PrimaryBtn)`
  min-height: 42px;
  padding: 0 22px;
  border-color: rgba(244, 196, 48, 0.86);
  background: linear-gradient(180deg, #f6cf58, #d9a91f);
  color: #111;
  box-shadow: 0 0 18px rgba(244, 196, 48, 0.2), inset 0 1px rgba(255, 255, 255, 0.35);
  font-size: 13px;
  font-weight: 840;
`

const CheckoutConnectBtn = styled(ConnectWalletButton)`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  height: 38px;
  padding: 0 15px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.65);
  background: rgba(221, 185, 47, 0.16);
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 780;
  box-shadow: none;
`

const Err = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff9292;
`

const Meta = styled.p`
  margin: 0;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  line-height: 1.45;
`

const SuccessState = styled.div`
  margin-top: 14px;
  text-align: center;
`

const SuccessTitle = styled.div`
  color: ${uxRebuildColors.positive};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.04em;
`

const SuccessHeadline = styled.div`
  margin-top: 6px;
  color: ${uxRebuildColors.text};
  font-size: 15px;
  font-weight: 800;
`

const SuccessSummary = styled.div`
  margin-top: 8px;
  color: ${uxRebuildColors.text};
  font-size: 13px;
  font-weight: 720;
`

const SuccessNote = styled.div`
  margin-top: 6px;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  line-height: 1.45;
`

const processingSpin = keyframes`
  to { transform: rotate(360deg); }
`

const ProcessingState = styled.div`
  margin-top: 14px;
  text-align: center;
`

const ProcessingSpinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-bottom: 8px;
  border-radius: 50%;
  border: 2px solid rgba(221, 185, 47, 0.22);
  border-top-color: ${uxRebuildColors.gold};
  animation: ${processingSpin} 0.8s linear infinite;
`

const ProcessingTitle = styled.div`
  color: ${uxRebuildColors.text};
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
`

const ProcessingCopy = styled.div`
  margin-top: 6px;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  line-height: 1.45;
`

const ProcessingHash = styled.div`
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
  word-break: break-all;
`

const Label = styled.div`
  margin-bottom: 7px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 720;
`

const STEPS: CommercialCheckoutStep[] = ['project', 'service', 'package', 'chain', 'payment', 'review']
const STEP_LABELS: Record<CommercialCheckoutStep, string> = {
  project: 'Project',
  service: 'Service',
  package: 'Package',
  chain: 'Chain',
  payment: 'Payment',
  review: 'Review',
}

const CATALOGS: Partial<Record<CommercialServiceId, readonly PlacementPackage[]>> = {
  featured: FEATURED_PACKAGES,
  'trend-boost': TREND_BOOST_PACKAGES,
  'sponsored-research': SPONSORED_RESEARCH_PACKAGES,
  'featured-farm': FEATURED_FARM_PACKAGES,
  'featured-pool': FEATURED_POOL_PACKAGES,
}

function compactSupply(value: string | null): string {
  if (!value) return 'Unavailable'
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(number)
}

type RegistryDetection = {
  ok?: boolean
  tier?: string
  reason?: string
  error?: string
  onChain?: {
    name?: string
    symbol?: string
    decimals?: number | string
    totalSupplyFormatted?: string | null
    explorerUrl?: string | null
    verifiedDeployment?: boolean
    reasonUnavailable?: string | null
  }
  profile?: {
    name?: { value?: string }
    symbol?: { value?: string }
  }
  project?: {
    displayName?: string
    logoUrl?: string | null
    slug?: string | null
    tokens?: Array<{ chainId?: number | string; symbol?: string }>
  } | null
  identitySource?: 'onchain' | 'factory' | 'canonical-registry'
  dex?: {
    listed?: boolean
    projectClaimed?: boolean
    registrySlug?: string | null
    name?: string | null
    symbol?: string | null
    logo?: string | null
    website?: string | null
  } | null
}

function parseDetectedProject(
  json: RegistryDetection,
  contract: string,
  requestedChain: number,
): DetectedProject | null {
  const onChainName = String(json?.onChain?.name ?? '').trim()
  const onChainSymbol = String(json?.onChain?.symbol ?? '').trim()
  const dexName = String(json?.dex?.name ?? '').trim()
  const dexSymbol = String(json?.dex?.symbol ?? '').trim()
  const onChainVerified =
    Boolean(json?.ok && json?.onChain) &&
    json?.onChain?.verifiedDeployment === true &&
    Boolean(onChainName && onChainSymbol)
  const registryBacked =
    Boolean(json?.ok) &&
    (json?.identitySource === 'factory' || json?.identitySource === 'canonical-registry') &&
    Boolean(json?.dex?.listed) &&
    Boolean((dexName || onChainName) && (dexSymbol || onChainSymbol))
  if (!onChainVerified && !registryBacked) return null
  const canonical = json.tier === 'canonical'
  const project = json.project ?? null
  const dex = json.dex ?? null
  const token = project?.tokens?.find((item) => Number(item.chainId) === requestedChain)
  const name = String(project?.displayName ?? dex?.name ?? json.onChain.name ?? json.profile?.name?.value).trim()
  const symbol = String(token?.symbol ?? dex?.symbol ?? json.onChain.symbol ?? json.profile?.symbol?.value).trim()
  return {
    tier: canonical ? 'canonical' : 'pending',
    name,
    symbol,
    contract,
    chainId: requestedChain,
    decimals: Number.isFinite(Number(json.onChain.decimals)) ? Number(json.onChain.decimals) : null,
    totalSupply: json.onChain.totalSupplyFormatted ?? null,
    logoUrl: dex?.logo ?? project?.logoUrl ?? null,
    slug: project?.slug ?? dex?.registrySlug ?? null,
    projectPageExists: Boolean((canonical && project?.slug) || (dex?.projectClaimed && dex?.registrySlug)),
    explorerUrl: json.onChain.explorerUrl ?? null,
    dexListed: Boolean(dex?.listed),
    website: dex?.website ?? null,
  }
}

type Props = {
  open: boolean
  onClose: () => void
  projectId: string
  projectSlug: string
  projectContract?: string | null
  chainId?: number
  initialService?: CommercialServiceId | null
  identityReady?: boolean
  onOpenClaim?: () => void
  onHistoryChange?: () => void
  visibilityOnly?: boolean
}

export const CommercialCheckoutModal: React.FC<Props> = ({
  open,
  onClose,
  projectId,
  projectSlug,
  projectContract = null,
  chainId = 56,
  initialService = null,
  identityReady: _identityReady = true,
  onHistoryChange,
  visibilityOnly: _visibilityOnly = false,
}) => {
  const { address, connector } = useAccount()
  const { data: signer } = useSigner()
  const buyerWallet = address ?? null
  const [step, setStep] = useState<CommercialCheckoutStep>('project')
  const [service, setService] = useState<CommercialServiceId | null>(initialService)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [identityChain, setIdentityChain] = useState(chainId)
  const [contract, setContract] = useState(projectContract ?? '')
  const [detected, setDetected] = useState<DetectedProject | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [pay, setPay] = useState<CommercialPaymentAsset>('BNB')
  const [farmTarget, setFarmTarget] = useState('')
  const [poolTarget, setPoolTarget] = useState('')
  const [eligibleTargets, setEligibleTargets] = useState<EligibleVisibilityTarget[]>([])
  const [eligibleTargetsState, setEligibleTargetsState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [referral, setReferral] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('idle')
  const [walletStage, setWalletStage] = useState<WalletFlowStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null)
  const [settlementMarket, setSettlementMarket] = useState<SettlementMarket>({ loading: false })
  const [marcoPayReadiness, setMarcoPayReadiness] = useState<MarcoPayReadiness | null>(null)
  const [marcoPayOrder, setMarcoPayOrder] = useState<MarcoPayOrderConfig | null>(null)
  const marcoPayOrderRef = useRef<MarcoPayOrderConfig | null>(null)
  const prepareFlightRef = useRef<Promise<MarcoPayOrderConfig | null> | null>(null)
  const lastBuyerRef = useRef<string | null>(null)
  const targetGenerationRef = useRef(0)
  const preparedTargetKeyRef = useRef<string | null>(null)
  const detectionAbortRef = useRef<AbortController | null>(null)
  const detectionInflightKeyRef = useRef<string | null>(null)
  const settledDetectionKeyRef = useRef<string | null>(null)
  marcoPayOrderRef.current = marcoPayOrder

  const readBoundTarget = () =>
    bindCheckoutTarget({
      inputAddress: contract,
      inputChainId: identityChain,
      detected,
      projectId,
      projectSlug,
      projectContract,
    })

  const preparedTargetKey = (chainId: number, tokenAddress: string) => `${chainId}:${tokenAddress}`

  const paymentInFlight =
    status === 'confirmed' ||
    status === 'submitted' ||
    status === 'submitted_pending_receipt' ||
    status === 'marco_pay_pending_verification'

  const invalidateCheckoutTarget = () => {
    targetGenerationRef.current += 1
    detectionAbortRef.current?.abort()
    detectionAbortRef.current = null
    detectionInflightKeyRef.current = null
    settledDetectionKeyRef.current = null
    setDetecting(false)
    if (paymentInFlight) return
    preparedTargetKeyRef.current = null
    prepareFlightRef.current = null
    marcoPayOrderRef.current = null
    setMarcoPayOrder(null)
    setOrderId(null)
    setQuoteSummary(null)
  }

  const serviceMeta = VISIBILITY_SERVICES.find((item) => item.id === service) ?? null
  const packages = service ? CATALOGS[service] ?? [] : []
  const selectedPackage =
    packages.find((item) => item.id === selectedPackageId) ??
    packages.find((item) => item.isDefault) ??
    packages[0] ??
    null
  const referralCatalogRef = dexReferralCatalogRef(selectedPackage ? String(selectedPackage.id) : null)
  const runtimeCheckoutBlocker = visibilityCheckoutBlocker({
    service,
    payment: pay,
    hasReferral: Boolean(referral.trim() && referralCatalogRef && pay === 'MARCO_PAY'),
    hasFeaturedAddOns: false,
  })
  const isMarcoPay = pay === 'MARCO_PAY'
  const isMCredits = pay === 'M_CREDITS'
  const mCreditsPassport = isMCredits ? readMCreditsPassport() : null
  const checkoutBlocker =
    runtimeCheckoutBlocker ??
    (isMarcoPay && marcoPayReadiness !== null && !marcoPayReadiness.executable
      ? marcoPayReadiness?.reason ?? 'MARCO Pay is temporarily unavailable.'
      : isMCredits && !marcoPayReadiness?.paymentMethods?.mCredits
      ? 'M-Credits are temporarily unavailable.'
      : isMCredits && selectedPackage
      ? mCreditsCheckoutBlocker({ usdPrice: selectedPackage.usdPrice, passport: mCreditsPassport ?? undefined })
      : null)
  const subtotal = selectedPackage?.usdPrice ?? 0
  const totalUsd = subtotal
  const payableUsd =
    isMarcoPay && marcoPayOrder && /^\d+$/.test(marcoPayOrder.referenceAmountMinor)
      ? Number(marcoPayOrder.referenceAmountMinor) / 100
      : totalUsd
  const settlementEstimate = resolveSettlementEstimate(pay, payableUsd, settlementMarket)
  const paymentLabel = PAYMENT_ASSET_META[pay].label.replace('\n', ' · ')

  useEffect(() => {
    if (!open || !detected || (service !== 'featured-farm' && service !== 'featured-pool')) {
      setEligibleTargets([])
      setEligibleTargetsState('idle')
      return undefined
    }
    const controller = new AbortController()
    const params = new URLSearchParams({
      service,
      chainId: String(detected.chainId),
      address: detected.contract,
      symbol: detected.symbol,
    })
    setEligibleTargetsState('loading')
    fetch(`/api/visibility/eligible-targets?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('ELIGIBLE_TARGETS_UNAVAILABLE')
        return response.json() as Promise<{ targets?: EligibleVisibilityTarget[] }>
      })
      .then((payload) => {
        const targets = payload.targets ?? []
        setEligibleTargets(targets)
        setEligibleTargetsState('ready')
        if (targets.length === 1) {
          if (service === 'featured-farm') setFarmTarget(targets[0].id)
          if (service === 'featured-pool') setPoolTarget(targets[0].id)
        }
      })
      .catch((cause) => {
        if ((cause as Error)?.name === 'AbortError') return
        setEligibleTargets([])
        setEligibleTargetsState('error')
      })
    return () => controller.abort()
  }, [detected, open, service])

  const detectProject = useCallback(async () => {
    const requestedAddress = contract.trim()
    const requestedChain = identityChain
    if (!/^0x[a-fA-F0-9]{40}$/.test(requestedAddress)) {
      setDetected(null)
      setError('Paste a valid EVM token contract address.')
      return
    }
    detectionAbortRef.current?.abort()
    const controller = new AbortController()
    detectionAbortRef.current = controller
    const generation = ++targetGenerationRef.current
    const inflightKey = `${requestedChain}:${requestedAddress.toLowerCase()}`
    detectionInflightKeyRef.current = inflightKey
    const timeout = window.setTimeout(() => controller.abort(), TOKEN_DETECTION_TIMEOUT_MS)
    setDetecting(true)
    setError(null)
    try {
      const response = await fetch('/api/registry/projects/onboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ contract: requestedAddress, chainId: requestedChain }),
      })
      const json = (await response.json()) as RegistryDetection
      if (generation !== targetGenerationRef.current) return
      if (!response.ok) throw new Error(json.reason || json.error || 'TOKEN_DETECTION_FAILED')
      const next = parseDetectedProject(json, requestedAddress, requestedChain)
      if (!next)
        throw new Error(json.onChain?.reasonUnavailable || 'The token identity could not be verified on-chain.')
      if (generation !== targetGenerationRef.current) return
      settledDetectionKeyRef.current = inflightKey
      setDetected(next)
    } catch (cause) {
      if (generation !== targetGenerationRef.current) return
      setDetected(null)
      const aborted =
        typeof cause === 'object' && cause !== null && (cause as { name?: string }).name === 'AbortError'
      setError(
        aborted
          ? TOKEN_DETECTION_TIMEOUT_MESSAGE
          : cause instanceof Error
            ? cause.message
            : String(cause),
      )
    } finally {
      window.clearTimeout(timeout)
      if (generation === targetGenerationRef.current) {
        if (detectionInflightKeyRef.current === inflightKey) detectionInflightKeyRef.current = null
        setDetecting(false)
      }
    }
  }, [contract, identityChain])

  useEffect(() => {
    targetGenerationRef.current += 1
    detectionAbortRef.current?.abort()
    detectionAbortRef.current = null
    detectionInflightKeyRef.current = null
    settledDetectionKeyRef.current = null
    preparedTargetKeyRef.current = null
    if (!open) return
    setService(initialService)
    setSelectedPackageId('')
    setIdentityChain(chainId)
    setContract(projectContract ?? '')
    setDetected(null)
    setDetecting(false)
    setPay('BNB')
    setFarmTarget('')
    setPoolTarget('')
    setReferral('')
    setError(null)
    setStatus('idle')
    setWalletStage('idle')
    setOrderId(null)
    setQuoteSummary(null)
    setSubmittedTxHash(null)
    setMarcoPayReadiness(null)
    setMarcoPayOrder(null)
    setSettlementMarket({ loading: true })
    setBusy(false)
    setStep('project')
  }, [open, initialService, chainId, projectContract])

  useEffect(() => {
    if (!open) {
      lastBuyerRef.current = buyerWallet
      return
    }
    const prev = lastBuyerRef.current
    lastBuyerRef.current = buyerWallet
    if (!prev || !buyerWallet || prev.toLowerCase() === buyerWallet.toLowerCase()) return
    if (
      status === 'confirmed' ||
      status === 'submitted' ||
      status === 'submitted_pending_receipt' ||
      status === 'marco_pay_pending_verification'
    ) {
      return
    }
    setMarcoPayOrder(null)
    marcoPayOrderRef.current = null
    setOrderId(null)
    setError(null)
    setWalletStage('idle')
    setStatus('idle')
    setQuoteSummary(null)
  }, [buyerWallet, open, status])

  useEffect(() => {
    if (!open) return undefined
    let active = true
    const refresh = () => {
      const storage = getBrowserMarcoReferralStorage()
      if (!storage) {
        if (active) setReferral('')
        return
      }
      void resolveMarcoReferralForCheckout(storage).then((verified) => {
        if (active) setReferral(verified?.code ?? '')
      })
    }
    const onReferralChange = () => refresh()
    refresh()
    window.addEventListener(MARCO_REFERRAL_CHANGE_EVENT, onReferralChange)
    return () => {
      active = false
      window.removeEventListener(MARCO_REFERRAL_CHANGE_EVENT, onReferralChange)
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setMarcoPayReadiness(null)
    void fetchMarcoPayReadiness(controller.signal)
      .then(setMarcoPayReadiness)
      .catch((cause) => {
        if (cause instanceof Error && cause.name === 'AbortError') return
        setMarcoPayReadiness({
          executable: false,
          reason: 'MARCO Pay is temporarily unavailable.',
          applicationRef: null,
        })
      })
    return () => controller.abort()
  }, [open, step])

  useEffect(() => {
    if (!open || pay !== 'M_CREDITS' || !service || !selectedPackage) return
    const bound = readBoundTarget()
    if (!bound) return
    const resolvedProjectId = bound.tokenAddress
    const receipt = loadMCreditsReceipt({
      projectId: resolvedProjectId,
      serviceId: service,
      packageId: String(selectedPackage.id),
    })
    if (!receipt) return
    setOrderId(receipt.orderId)
    setStatus('confirmed')
    setWalletStage('success')
    setQuoteSummary(
      `M-Credits confirmed · service activated · ${detected?.name ?? projectSlug} · ${serviceMeta?.title ?? service}`,
    )
  }, [
    contract,
    detected,
    identityChain,
    open,
    pay,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    serviceMeta?.title,
  ])

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setSettlementMarket({ loading: true })
    void fetch('/api/trade/pair-liquidity', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('SETTLEMENT_MARKET_UNAVAILABLE')
        return (await response.json()) as { priceUsd?: number; bnbUsd?: number }
      })
      .then((market) => {
        const marcoUsd =
          typeof market.priceUsd === 'number' && Number.isFinite(market.priceUsd) && market.priceUsd > 0
            ? market.priceUsd
            : undefined
        const bnbUsd =
          typeof market.bnbUsd === 'number' && Number.isFinite(market.bnbUsd) && market.bnbUsd > 0
            ? market.bnbUsd
            : undefined
        setSettlementMarket({
          marcoUsd,
          bnbUsd,
          loading: false,
        })
      })
      .catch((cause) => {
        if (cause instanceof Error && cause.name === 'AbortError') return
        setSettlementMarket({ loading: false })
      })
    return () => controller.abort()
  }, [open])

  useEffect(() => {
    if (!open || !/^0x[a-fA-F0-9]{40}$/.test(contract.trim())) return undefined
    const key = `${identityChain}:${contract.trim().toLowerCase()}`
    const timer = window.setTimeout(() => {
      if (detectionInflightKeyRef.current === key || settledDetectionKeyRef.current === key) return
      void detectProject()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [open, contract, identityChain, detectProject])

  useEffect(() => {
    if (!selectedPackageId && selectedPackage) setSelectedPackageId(String(selectedPackage.id))
  }, [selectedPackage, selectedPackageId])

  const stepIndex = STEPS.indexOf(step)
  const modalSteps = STEPS.map((id, index) => ({
    id,
    label: STEP_LABELS[id],
    active: id === step,
    done: index < stepIndex,
  }))

  const prepareMarcoPayOrder = useCallback(async (): Promise<MarcoPayOrderConfig | null> => {
    const bound = readBoundTarget()
    if (!selectedPackage || !service || !bound) return null
    if (!VISIBILITY_RUNTIME[service]?.live) return null
    if (!marcoPayReadiness?.executable) {
      setError(marcoPayReadiness?.reason ?? 'MARCO Pay is temporarily unavailable.')
      return null
    }
    const requestedReferralCode = referral && referralCatalogRef ? referral : null
    const referralContext = (() => {
      const storage = getBrowserMarcoReferralStorage()
      return storage ? readStoredMarcoReferral(storage) : null
    })()
    const targetKey = preparedTargetKey(bound.chainId, bound.tokenAddress)
    if (
      marcoPayOrderRef.current?.paymentId &&
      marcoPayOrderRef.current.wallet &&
      marcoPayOrderRef.current.referralCode === requestedReferralCode &&
      preparedTargetKeyRef.current === targetKey
    ) {
      return marcoPayOrderRef.current
    }
    if (prepareFlightRef.current && preparedTargetKeyRef.current === targetKey) return prepareFlightRef.current
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return null
    }
    const generation = targetGenerationRef.current
    setBusy(true)
    const flight = (async () => {
      try {
        const response = await fetch('/api/marco-pay/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            orderId: preparedTargetKeyRef.current === targetKey ? marcoPayOrderRef.current?.orderId ?? null : null,
            projectId: bound.projectId,
            projectSlug: bound.projectSlug,
            projectContract: bound.tokenAddress,
            buyerWallet,
            serviceId: service,
            packageId: selectedPackage.id,
            targetId: service === 'featured-farm' ? farmTarget : service === 'featured-pool' ? poolTarget : null,
            referralCode: requestedReferralCode,
            referralDestination: requestedReferralCode ? referralContext?.destinationRef ?? null : null,
            referralCampaign: requestedReferralCode ? referralContext?.campaignRef ?? null : null,
          }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'MARCO Pay is temporarily unavailable.')
        const session = readMarcoPayHandoffSession(payload)
        if (!session) throw new Error('MARCO Pay is temporarily unavailable.')
        const wallet = payload.wallet as MarcoPayWalletTransfer | null
        if (!wallet?.data || !wallet.to) throw new Error('MARCO Pay is temporarily unavailable.')
        const next: MarcoPayOrderConfig = {
          orderId: String(payload.order.orderId),
          application: String(payload.widget.application),
          amount: String(payload.widget.amount),
          currency: String(payload.widget.currency),
          product: typeof payload.widget.product === 'string' && payload.widget.product ? payload.widget.product : null,
          reference: String(payload.widget.reference),
          paymentId: session.paymentId,
          approvalUrl: session.approvalUrl,
          wallet,
          referenceAmountMinor: String(payload.order.referenceAmountMinor),
          referralApplied: payload.order.referralApplied === true,
          referralCode:
            typeof payload.order.referralCode === 'string' && payload.order.referralCode
              ? payload.order.referralCode
              : null,
          referralDiscountMinor:
            typeof payload.order.referralDiscountMinor === 'string'
              ? payload.order.referralDiscountMinor
              : null,
        }
        if (generation !== targetGenerationRef.current) return null
        preparedTargetKeyRef.current = targetKey
        marcoPayOrderRef.current = next
        setMarcoPayOrder(next)
        setOrderId(next.orderId)
        setQuoteSummary(`Order ${next.orderId} · awaiting canonical MARCO Pay settlement`)
        return next
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'MARCO Pay is temporarily unavailable.')
        return null
      } finally {
        setBusy(false)
        prepareFlightRef.current = null
      }
    })()
    prepareFlightRef.current = flight
    return flight
  }, [
    buyerWallet,
    contract,
    detected,
    farmTarget,
    identityChain,
    marcoPayReadiness,
    poolTarget,
    projectContract,
    projectId,
    projectSlug,
    referral,
    referralCatalogRef,
    selectedPackage,
    service,
  ])

  const goNext = async () => {
    setError(null)
    if (step === 'project') {
      if (!readBoundTarget()) {
        setError('Detect the project before choosing visibility.')
        return
      }
      setStep('service')
      return
    }
    if (step === 'service') {
      if (!service) {
        setError('Choose a visibility service.')
        return
      }
      setStep('package')
      return
    }
    if (step === 'package') {
      if (!selectedPackage) {
        setError('Choose a duration.')
        return
      }
      if (service === 'featured-farm' && !farmTarget.trim()) {
        setError('Choose one of the active farm pairs available for this token.')
        return
      }
      if (service === 'featured-pool' && !poolTarget.trim()) {
        setError('Choose one of the active staking or reward pools available for this token.')
        return
      }
      setStep('chain')
      return
    }
    if (step === 'chain') {
      setStep('payment')
      return
    }
    if (step === 'payment') {
      setStep('review')
      return
    }
  }

  useEffect(() => {
    if (
      !open ||
      step !== 'review' ||
      !isMarcoPay ||
      !marcoPayReadiness?.executable ||
      marcoPayOrderRef.current ||
      status === 'confirmed'
    )
      return
    void prepareMarcoPayOrder()
  }, [isMarcoPay, marcoPayReadiness, open, prepareMarcoPayOrder, status, step])

  const goBack = () => {
    setError(null)
    const index = STEPS.indexOf(step)
    if (index > 0) setStep(STEPS[index - 1])
  }

  const handleMarcoPayStarted = useCallback(() => {
    setError(null)
    setStatus('marco_pay_started')
    setWalletStage('confirm')
    setQuoteSummary('MARCO PAY opened · complete the secure payment flow')
  }, [])

  const handleMarcoPayCreated = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const paymentId = event.detail?.paymentId ?? event.detail?.id ?? event.detail?.reference
    setStatus('marco_pay_created')
    setWalletStage('confirm')
    setQuoteSummary(paymentId ? `MARCO PAY reference · ${String(paymentId)}` : 'MARCO PAY payment created')
  }, [])

  const handleMarcoPayCompleted = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const paymentId = event.detail?.paymentId ?? event.detail?.id ?? event.detail?.reference
    setStatus('marco_pay_pending_verification')
    setWalletStage('confirm')
    setQuoteSummary(`Payment received${paymentId ? ` · ${String(paymentId)}` : ''} · verifying provider receipt`)
  }, [])

  const handleMarcoPayError = useCallback((cause: Error) => {
    setStatus('marco_pay_error')
    setWalletStage('error')
    setError(cause.message || 'MARCO PAY is temporarily unavailable.')
  }, [])

  useEffect(() => {
    if (!open || step !== 'review' || !isMarcoPay || !marcoPayOrder || status === 'confirmed') {
      return undefined
    }
    let cancelled = false
    const poll = async () => {
      try {
        const response = await fetch(`/api/marco-pay/orders?orderId=${encodeURIComponent(marcoPayOrder.orderId)}`, {
          cache: 'no-store',
        })
        if (!response.ok || cancelled) return
        const payload = await response.json()
        const order = payload.order as {
          state?: string
          receiptRef?: string | null
          activatedAt?: string | null
          testMode?: boolean | null
          durationMs?: number
        }
        if (
          order.state === 'ONCHAIN_PENDING' ||
          order.state === 'PAYMENT_CONFIRMED' ||
          order.state === 'ACTIVATING'
        ) {
          setStatus('submitted')
          setWalletStage('idle')
          setQuoteSummary('Payment confirmed · activating your service')
          return
        }
        if (order.state === 'TEST_VERIFIED') {
          setWalletStage('error')
          setStatus('marco_pay_error')
          setError('MARCO Pay is temporarily unavailable.')
          setQuoteSummary(null)
          return
        }
        if (order.state !== 'ACTIVE') return
        setStatus('confirmed')
        setWalletStage('success')
        endMarcoPayIsolation()
        try {
          window.open('', 'marco-pay')?.close()
        } catch {
          /* ignore */
        }
        const expires =
          typeof order.durationMs === 'number'
            ? new Date(Date.parse(order.activatedAt || new Date().toISOString()) + order.durationMs).toISOString()
            : selectedPackage
            ? new Date(Date.now() + selectedPackage.durationMs).toISOString()
            : null
        setQuoteSummary(
          `Payment confirmed · service activated · ${detected?.name ?? projectSlug} · ${
            serviceMeta?.title ?? service
          } · ${selectedPackage?.durationLabel ?? 'duration verified'}`,
        )
        const bound = readBoundTarget()
        if (bound) appendMarketingHistory(bound.projectSlug || bound.tokenAddress, {
          kind:
            service === 'sponsored-research'
              ? 'sponsored-research'
              : service === 'featured-farm'
              ? 'farm'
              : service === 'featured-pool'
              ? 'pool'
              : service === 'featured'
              ? 'featured'
              : 'trend-boost',
          label: selectedPackage?.label ?? 'MARCO Pay purchase',
          status: 'Running',
          packageId: String(selectedPackage?.id ?? ''),
          expiresAt: expires,
        })
        onHistoryChange?.()
      } catch {
        /* Canonical webhook/reconciliation remains authoritative; keep polling. */
      }
    }
    void poll()
    const timer = window.setInterval(() => void poll(), 2_500)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [
    contract,
    detected,
    identityChain,
    isMarcoPay,
    marcoPayOrder,
    onHistoryChange,
    open,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    serviceMeta?.title,
    status,
    step,
  ])

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!selectedPackage || !service) return
    if (checkoutBlocker) {
      setError(checkoutBlocker)
      return
    }
    if (isMarcoPay || isMCredits) {
      setError(isMCredits ? 'Complete this purchase with M-Credits.' : 'Complete payment in the MARCO PAY panel.')
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return
    }
    const paymentAsset = pay as MonetizationAsset
    const bound = readBoundTarget()
    if (!bound) {
      setError('Detect the project before choosing visibility.')
      return
    }
    setBusy(true)
    try {
      setWalletStage('confirm')
      const isFeatured = service === 'featured'
      let id: string
      let prepared: { to: string; valueHex: string; data: string }
      let quote: { tokenAmount: string; quoteExpiration: string }

      if (isFeatured) {
        const createRes = await fetch('/api/featured/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            projectId: bound.projectId,
            projectSlug: bound.projectSlug,
            projectContract: bound.tokenAddress,
            buyerWallet,
            paymentAsset,
            packageId: selectedPackage.id,
            sourceFlow: 'boost-project',
          }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
        id = created.order.orderId as string
        setOrderId(id)
        const quoteRes = await fetch(`/api/featured/orders/${id}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', paymentAsset }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(
          `${quote.tokenAmount} ${paymentAsset} → ${FEATURED_OFFER.treasuryWallet.slice(
            0,
            6,
          )}…${FEATURED_OFFER.treasuryWallet.slice(-4)}`,
        )
      } else {
        const createRes = await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            projectId: bound.projectId,
            projectSlug: bound.projectSlug,
            projectContract: bound.tokenAddress,
            buyerWallet,
            paymentAsset,
            packageId: selectedPackage.id,
            serviceId: service,
            targetId: service === 'featured-farm' ? farmTarget : service === 'featured-pool' ? poolTarget : null,
          }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
        id = created.order.orderId as string
        setOrderId(id)
        const quoteRes = await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', orderId: id, paymentAsset }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(`${quote.tokenAmount} ${paymentAsset} · ${selectedPackage.durationLabel}`)
      }

      setStatus('awaiting_wallet')
      const preferredProvider = (await connector?.getProvider?.()) ?? null
      const paymentWallet = await resolvePaymentWalletForSettlement({
        preferredProvider,
        fallbackSigner: signer ?? null,
      })
      const chainGate = assessPaymentWalletChain(paymentWallet.chainId)
      if (chainGate.stage === 'switch_network') {
        setWalletStage(chainGate.stage)
        throw new Error(chainGate.message || RC_COPY.wrongNetwork)
      }
      if (!paymentWallet.signer) {
        setWalletStage('error')
        throw new Error(RC_COPY.walletUnavailable)
      }

      let txHash: string
      let receipt: { to?: string; status?: number; logs?: unknown[] }
      try {
        const transaction = await paymentWallet.signer.sendTransaction({
          to: prepared.to,
          value: prepared.valueHex,
          data: prepared.data,
        })
        txHash = transaction.hash
        receipt = await transaction.wait(1)
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        if (/reject|denied|cancel/i.test(message)) {
          await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(isFeatured ? { action: 'cancel' } : { action: 'cancel', orderId: id }),
          })
          setStatus('cancelled')
          setWalletStage('cancelled')
          setError(RC_COPY.paymentCancelled)
          return
        }
        throw cause
      }

      await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          isFeatured
            ? { action: 'submit', transactionHash: txHash }
            : { action: 'submit', orderId: id, transactionHash: txHash },
        ),
      })
      setStatus('submitted')
      if (!receipt) {
        setError('Payment submitted — receipt not yet available.')
        setStatus('submitted_pending_receipt')
        return
      }

      const confirmRes = await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-receipt',
          ...(isFeatured ? {} : { orderId: id }),
          transactionHash: txHash,
          receipt: {
            to: receipt.to,
            value: null,
            status: receipt.status,
            logs: receipt.logs,
          },
        }),
      })
      const confirmed = await confirmRes.json()
      if (!confirmRes.ok) {
        setStatus('payment_failed')
        setWalletStage('error')
        setError(confirmed.error || 'RECEIPT_INVALID')
        return
      }

      setStatus('confirmed')
      setWalletStage('success')
      setQuoteSummary(
        `Payment confirmed · order ${id}${
          paymentAsset === 'MARCO' ? ` · ${cashbackUserMessage('ELIGIBLE_PENDING')}` : ''
        }`,
      )
      appendMarketingHistory(bound.projectSlug || bound.tokenAddress, {
        kind:
          service === 'sponsored-research'
            ? 'sponsored-research'
            : service === 'featured-farm'
            ? 'farm'
            : service === 'featured-pool'
            ? 'pool'
            : isFeatured
            ? 'featured'
            : 'trend-boost',
        label: selectedPackage.label,
        status: 'Running',
        packageId: String(selectedPackage.id),
        expiresAt: new Date(Date.now() + selectedPackage.durationMs).toISOString(),
      })
      onHistoryChange?.()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      setError(message)
      setStatus('error')
      setWalletStage(message === RC_COPY.wrongNetwork ? 'switch_network' : 'error')
    } finally {
      setBusy(false)
    }
  }, [
    buyerWallet,
    checkoutBlocker,
    connector,
    contract,
    detected,
    farmTarget,
    identityChain,
    onHistoryChange,
    isMarcoPay,
    isMCredits,
    pay,
    poolTarget,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    signer,
  ])

  const reviewAndPay = useCallback(async () => {
    setError(null)
    if (status === 'confirmed' || status === 'submitted' || status === 'submitted_pending_receipt' || status === 'marco_pay_pending_verification') return
    if (checkoutBlocker) {
      setError(checkoutBlocker)
      return
    }
    if (isMCredits) {
      if (isMarcoPayWalletFlightActive()) return
      await runMarcoPaySingleFlight(async () => {
        setBusy(true)
        try {
          if (!canAcceptMCreditsPayment(service)) {
            throw new Error(runtimeCheckoutBlocker || 'This service cannot be fulfilled with M-Credits yet.')
          }
          const bound = readBoundTarget()
          if (!bound) throw new Error('Detect the project before choosing visibility.')
          const mCreditsBuyerWallet =
            (buyerWallet && /^0x[a-fA-F0-9]{40}$/.test(buyerWallet) ? buyerWallet : null) ||
            mCreditsPassport?.walletAddress ||
            null
          if (!mCreditsBuyerWallet) {
            throw new Error('Connect MARCO Passport to pay with M-Credits.')
          }
          const quote = refreshMCreditsQuote(selectedPackage?.usdPrice ?? 0)
          setStatus('debiting')
          setWalletStage('confirm')
          setQuoteSummary('Debiting M-Credits through MARCO Passport')
          const identityToken = await authorizeMCreditsSpendForOrder({
            merchantOrderRef: `${bound.tokenAddress}:${service}:${selectedPackage?.id ?? 'default'}`,
            maxAmountMinor: quote.amountMinor,
          })
          const response = await fetch('/api/mcredits/orders', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              ...(identityToken ? { 'x-marco-passport-session': identityToken } : {}),
            },
            body: JSON.stringify({
              projectId: bound.projectId,
              projectSlug: bound.projectSlug,
              projectContract: bound.tokenAddress,
              buyerWallet: mCreditsBuyerWallet,
              serviceId: service,
              packageId: selectedPackage?.id,
              targetId: service === 'featured-farm' ? farmTarget : service === 'featured-pool' ? poolTarget : null,
            }),
          })
          const payload = await response.json()
          if (payload.payment_id || payload.approval_url) {
            throw new Error('M-Credits must not open MARCO Pay.')
          }
          if (!response.ok) throw new Error(payload.message || 'M-Credits are temporarily unavailable.')
          if (payload.order?.state !== 'FULFILLED') {
            throw new Error('M-Credits fulfilment failed.')
          }
          setStatus('verifying')
          setOrderId(payload.order.orderId)
          saveMCreditsReceipt({
            orderId: payload.order.orderId,
            state: 'FULFILLED',
            serviceId: service,
            packageId: String(selectedPackage?.id ?? payload.order.packageId),
            projectId: bound.tokenAddress,
          })
          appendMarketingHistory(bound.projectSlug || bound.tokenAddress, {
            kind: service === 'featured' ? 'featured' : 'trend-boost',
            label: selectedPackage?.label ?? serviceMeta?.title ?? 'M-Credits',
            status: 'Running',
            packageId: String(selectedPackage?.id ?? ''),
            expiresAt: selectedPackage
              ? new Date(Date.now() + selectedPackage.durationMs).toISOString()
              : undefined,
          })
          onHistoryChange?.()
          setStatus('confirmed')
          setWalletStage('success')
          setQuoteSummary(
            `M-Credits confirmed · service activated · ${detected?.name ?? projectSlug} · ${
              serviceMeta?.title ?? service
            } · ${quote.display}`,
          )
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'M-Credits are temporarily unavailable.')
          setWalletStage('error')
        } finally {
          setBusy(false)
        }
      })
      return
    }
    if (isMarcoPay) {
      if (isMarcoPayWalletFlightActive()) return
      beginMarcoPayIsolation()
      await runMarcoPaySingleFlight(async () => {
        setBusy(true)
        setWalletStage('confirm')
        try {
          const order = marcoPayOrderRef.current ?? (await prepareMarcoPayOrder())
          const wallet = order?.wallet
          if (!order || !wallet) throw new Error('MARCO Pay is temporarily unavailable.')
          const preferredProvider = (await connector?.getProvider?.()) ?? null
          const paymentWallet = await resolvePaymentWalletForSettlement({
            preferredProvider,
            fallbackSigner: signer ?? null,
          })
          const chainGate = assessPaymentWalletChain(paymentWallet.chainId)
          if (chainGate.stage === 'switch_network') {
            setWalletStage(chainGate.stage)
            throw new Error(chainGate.message || RC_COPY.wrongNetwork)
          }
          if (!paymentWallet.signer) throw new Error(RC_COPY.walletUnavailable)
          setQuoteSummary('Confirm the MARCO transfer in your wallet')
          const transaction = await paymentWallet.signer.sendTransaction({
            to: wallet.to,
            value: wallet.value,
            data: wallet.data,
            chainId: wallet.chainId,
          })
          setStatus('submitted')
          setWalletStage('idle')
          setSubmittedTxHash(transaction.hash)
          setQuoteSummary(`Transaction submitted · ${transaction.hash} · verifying MARCO settlement`)
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause)
          if (/reject|denied|cancel/i.test(message)) {
            setStatus('cancelled')
            setWalletStage('cancelled')
            setError(RC_COPY.paymentCancelled)
            return
          }
          if (message === RC_COPY.wrongNetwork) {
            setWalletStage('switch_network')
            setError(message)
            return
          }
          setError(message)
          setWalletStage('error')
          const order = marcoPayOrderRef.current
          if (order?.paymentId && order.approvalUrl && !signer) {
            const popup = openMarcoPayHandoffWindow()
            assignMarcoPayHandoff(popup, { paymentId: order.paymentId, approvalUrl: order.approvalUrl })
          }
        } finally {
          setBusy(false)
        }
      })
      return
    }
    await runCheckout()
  }, [
    buyerWallet,
    checkoutBlocker,
    connector,
    contract,
    detected,
    farmTarget,
    identityChain,
    isMCredits,
    isMarcoPay,
    mCreditsPassport?.walletAddress,
    onHistoryChange,
    poolTarget,
    prepareMarcoPayOrder,
    projectContract,
    projectId,
    projectSlug,
    runCheckout,
    runtimeCheckoutBlocker,
    selectedPackage,
    service,
    serviceMeta?.title,
    signer,
    status,
  ])

  const confirmedRewardNotice =
    status === 'confirmed' ? marcoPayRewardNotice(marcoPayReadiness?.rewards?.customerBps) : null
  const isTerminalSuccess = status === 'confirmed'
  const isPaymentProcessing =
    status === 'submitted' ||
    status === 'submitted_pending_receipt' ||
    status === 'marco_pay_pending_verification'
  const hidePaymentAction = isTerminalSuccess || isPaymentProcessing
  const fulfilledServiceSummary = [
    detected?.name ?? projectSlug,
    serviceMeta?.title,
    selectedPackage?.durationLabel,
  ]
    .filter(Boolean)
    .join(' · ')

  const footer = (
    <MelegaModalFooter>
      <MelegaModalFooterMeta>
        {selectedPackage
          ? `${selectedPackage.label} · $${totalUsd}`
          : detected
          ? `${detected.name} · $${detected.symbol}`
          : 'Boost Your Project'}
      </MelegaModalFooterMeta>
      <MelegaModalFooterActions>
        {step === 'review' && isTerminalSuccess ? (
          <GhostBtn type="button" onClick={onClose} data-testid="commercial-checkout-close">
            Close
          </GhostBtn>
        ) : step !== 'project' ? (
          <GhostBtn type="button" onClick={goBack} data-testid="commercial-checkout-back">
            Back
          </GhostBtn>
        ) : (
          <GhostBtn type="button" onClick={onClose} data-testid="commercial-checkout-cancel">
            Cancel
          </GhostBtn>
        )}
        {step === 'review' && hidePaymentAction ? null : step === 'review' && !buyerWallet && !isMarcoPay && !isMCredits ? (
          <CheckoutConnectBtn data-testid="commercial-checkout-connect">Connect Wallet</CheckoutConnectBtn>
        ) : step === 'review' ? (
          <SecurePrimaryBtn
            type="button"
            onClick={() => void reviewAndPay()}
            disabled={busy || detecting || Boolean(checkoutBlocker) || isMarcoPayWalletFlightActive()}
            data-testid="commercial-checkout-pay"
          >
            {busy ? 'Processing…' : isMarcoPay && marcoPayOrder ? 'PAY WITH MARCO' : 'Review and pay'}
          </SecurePrimaryBtn>
        ) : step === 'payment' ? (
          <SecurePrimaryBtn
            type="button"
            onClick={() => void goNext()}
            disabled={busy || detecting}
            data-testid="commercial-checkout-next"
          >
            {`Continue with ${paymentLabel}`}
          </SecurePrimaryBtn>
        ) : (
          <PrimaryBtn
            type="button"
            onClick={() => void goNext()}
            disabled={busy || detecting}
            data-testid="commercial-checkout-next"
          >
            {busy && step === 'project' ? 'Checking project…' : 'Continue'}
          </PrimaryBtn>
        )}
      </MelegaModalFooterActions>
    </MelegaModalFooter>
  )

  return (
    <MelegaModal
      open={open}
      onClose={onClose}
      title="Boost Your Project"
      steps={modalSteps}
      headerAccessory={
        step !== 'project' && detected ? (
          <IdentityChip data-testid="commercial-project-identity-compact">
            <ProjectLogo project={detected} compact />
            <div>
              <strong>{detected.name}</strong>
              <Meta>${detected.symbol}</Meta>
            </div>
          </IdentityChip>
        ) : null
      }
      size="lg"
      footer={footer}
      testId="commercial-checkout-modal"
      closeTestId="commercial-checkout-close"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
    >
      <Grid $serviceWide={step === 'service' || step === 'project'}>
        <Stack>
          {step === 'project' ? (
            <div data-testid="commercial-step-project">
              <Label>Token address</Label>
              <DetectRow>
                <Select
                  value={identityChain}
                  onChange={(event) => {
                    invalidateCheckoutTarget()
                    setIdentityChain(Number(event.target.value))
                    setDetected(null)
                  }}
                  aria-label="Project chain"
                >
                  {IDENTITY_CHAINS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </Select>
                <Input
                  value={contract}
                  onChange={(event) => {
                    invalidateCheckoutTarget()
                    setContract(event.target.value)
                    setDetected(null)
                  }}
                  placeholder="Paste the token address (0x...)"
                />
                <PrimaryBtn
                  type="button"
                  disabled={detecting}
                  data-testid="commercial-detect-token"
                  onClick={() => void detectProject()}
                >
                  {detecting ? 'Detecting…' : 'Detect token'}
                </PrimaryBtn>
              </DetectRow>
              {detected ? (
                <Stack style={{ marginTop: 10 }}>
                  <Identity>
                    <ProjectLogo project={detected} />
                    <div>
                      <STitle>
                        {detected.name} · ${detected.symbol}
                      </STitle>
                      <Meta>
                        {IDENTITY_CHAINS.find((item) => item.id === detected.chainId)?.label} · Supply{' '}
                        {compactSupply(detected.totalSupply)} · {detected.decimals ?? '—'} decimals
                      </Meta>
                      <BadgeRow>
                        <Badge $green={detected.projectPageExists}>
                          {detected.projectPageExists ? `Project Page @${detected.slug}` : 'Unclaimed Project Page'}
                        </Badge>
                        {detected.dexListed ? <Badge $green>Listed</Badge> : <Badge>Detected on-chain</Badge>}
                      </BadgeRow>
                    </div>
                  </Identity>
                  {!detected.projectPageExists ? (
                    <>
                      <Alert>You can boost this project without claiming its Project Page. Page ownership is not being assigned.</Alert>
                    </>
                  ) : null}
                </Stack>
              ) : null}
            </div>
          ) : null}

          {step === 'service' ? (
            <div data-testid="commercial-step-service">
              <Label>Choose service</Label>
              <ServiceGrid data-testid="commercial-service-grid">
                {VISIBILITY_SERVICES.map((item) => {
                  const live = Boolean(VISIBILITY_RUNTIME[item.id]?.live)
                  return (
                    <ServiceCard
                      key={item.id}
                      type="button"
                      $on={service === item.id}
                      $live={live}
                      onClick={() => {
                        setService(item.id)
                        setSelectedPackageId('')
                        setFarmTarget('')
                        setPoolTarget('')
                      }}
                      data-testid={`commercial-service-${item.id}`}
                    >
                      <ServiceIcon aria-hidden="true">{item.icon}</ServiceIcon>
                      <STitle>{item.title}</STitle>
                      <SDesc>{item.description}{!live ? <><br />Activation pending</> : null}</SDesc>
                      <SPrice>
                        <SPricePrefix>From</SPricePrefix>
                        <SPriceValue>{item.priceHint.replace(/^From\s+/i, '')}</SPriceValue>
                      </SPrice>
                    </ServiceCard>
                  )
                })}
              </ServiceGrid>
            </div>
          ) : null}

          {step === 'package' ? (
            <div data-testid="commercial-step-package">
              <Label>Choose duration</Label>
              <PkgGrid>
                {packages.map((item) => (
                  <PkgCard
                    key={item.id}
                    type="button"
                    $on={selectedPackage?.id === item.id}
                    onClick={() => setSelectedPackageId(String(item.id))}
                    data-testid={`commercial-pkg-${item.id}`}
                  >
                    <STitle>{item.shortLabel}</STitle>
                    <SDesc>{item.durationLabel}</SDesc>
                    <PackagePrice>${item.usdPrice}</PackagePrice>
                  </PkgCard>
                ))}
              </PkgGrid>
              {service === 'featured-farm' ? (
                <div style={{ marginTop: 10 }}>
                  <Label>Choose an active farm pair</Label>
                  {eligibleTargetsState === 'loading' ? <TargetState>Loading active farms…</TargetState> : null}
                  {eligibleTargetsState === 'error' ? (
                    <TargetState>Active farms are temporarily unavailable. Please try again.</TargetState>
                  ) : null}
                  {eligibleTargetsState === 'ready' && eligibleTargets.length === 0 ? (
                    <TargetState>No active farm currently contains {detected?.symbol ?? 'this token'}.</TargetState>
                  ) : null}
                  {eligibleTargets.length > 0 ? (
                    <TargetGrid data-testid="commercial-featured-farm-targets">
                      {eligibleTargets.map((target) => (
                        <TargetCard
                          key={target.id}
                          type="button"
                          $on={farmTarget === target.id}
                          onClick={() => setFarmTarget(target.id)}
                          data-testid={`commercial-farm-target-${target.pid ?? target.id}`}
                        >
                          <TargetTitle>{target.title}</TargetTitle>
                          <TargetDetail>{target.detail}</TargetDetail>
                        </TargetCard>
                      ))}
                    </TargetGrid>
                  ) : null}
                </div>
              ) : null}
              {service === 'featured-pool' ? (
                <div style={{ marginTop: 10 }}>
                  <Label>Choose an active pool</Label>
                  {eligibleTargetsState === 'loading' ? <TargetState>Loading active pools…</TargetState> : null}
                  {eligibleTargetsState === 'error' ? (
                    <TargetState>Active pools are temporarily unavailable. Please try again.</TargetState>
                  ) : null}
                  {eligibleTargetsState === 'ready' && eligibleTargets.length === 0 ? (
                    <TargetState>
                      No active pool currently uses {detected?.symbol ?? 'this token'} for staking or rewards.
                    </TargetState>
                  ) : null}
                  {eligibleTargets.length > 0 ? (
                    <TargetGrid data-testid="commercial-featured-pool-targets">
                      {eligibleTargets.map((target) => (
                        <TargetCard
                          key={target.id}
                          type="button"
                          $on={poolTarget === target.id}
                          onClick={() => setPoolTarget(target.id)}
                          data-testid={`commercial-pool-target-${target.id}`}
                        >
                          <TargetTitle>{target.title}</TargetTitle>
                          <TargetDetail>{target.detail}</TargetDetail>
                        </TargetCard>
                      ))}
                    </TargetGrid>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'chain' ? (
            <div data-testid="commercial-step-chain">
              <Label>Settlement network</Label>
              <ChipRow>
                <Chip type="button" $on>
                  BNB Chain
                </Chip>
              </ChipRow>
              <Meta style={{ marginTop: 8 }}>Selected automatically for commercial placements.</Meta>
            </div>
          ) : null}

          {step === 'payment' ? (
            <div data-testid="commercial-step-payment">
              <Label>Choose payment</Label>
              <PaymentGrid>
                {(['BNB', 'USDT', 'USDC', 'MARCO_PAY', 'M_CREDITS'] as CommercialPaymentAsset[]).map((asset) => {
                  const disabled =
                    (asset === 'MARCO_PAY' && !marcoPayReadiness?.executable) ||
                    (asset === 'M_CREDITS' && !marcoPayReadiness?.paymentMethods?.mCredits)
                  const meta = PAYMENT_ASSET_META[asset]
                  return (
                    <PaymentCard
                      key={asset}
                      type="button"
                      $on={pay === asset}
                      disabled={disabled}
                      title={
                        asset === 'MARCO_PAY' && !marcoPayReadiness?.executable
                          ? marcoPayReadiness?.reason ?? 'MARCO Pay is temporarily unavailable.'
                          : asset === 'M_CREDITS' && !marcoPayReadiness?.paymentMethods?.mCredits
                          ? marcoPayReadiness?.reason ?? 'M-Credits are temporarily unavailable.'
                          : undefined
                      }
                      onClick={() => {
                        setPay(asset)
                        setError(null)
                        setStatus('idle')
                        setWalletStage('idle')
                        setQuoteSummary(null)
                        setOrderId(null)
                        setMarcoPayOrder(null)
                      }}
                      data-testid={`commercial-pay-${asset}`}
                    >
                      {pay === asset ? <PaymentSelected aria-hidden="true">✓</PaymentSelected> : null}
                      {asset === 'M_CREDITS' ? <PaymentBetaBadge data-testid="mcredits-beta-badge">BETA</PaymentBetaBadge> : null}
                      <PaymentAssetLogo asset={asset} />
                      <PaymentName>{meta.label}</PaymentName>
                      <PaymentNetwork>BNB Chain</PaymentNetwork>
                      {asset === 'MARCO_PAY' && marcoPayReadiness?.rewards?.customerLabel ? (
                        <PremiumCashbackSticker>{marcoPayReadiness.rewards.customerLabel}</PremiumCashbackSticker>
                      ) : null}
                    </PaymentCard>
                  )
                })}
              </PaymentGrid>
              <SettlementSummary data-testid="commercial-settlement-summary">
                <SettlementMain>
                  <SettlementCell $title>
                    <SettlementTitle>
                      <SettlementGlyph aria-hidden="true">▤</SettlementGlyph>
                      Settlement summary
                    </SettlementTitle>
                  </SettlementCell>
                  <SettlementCell>
                    <SettlementLabel>Total</SettlementLabel>
                    <SettlementValue>${formatApproxNumber(totalUsd, 2)}</SettlementValue>
                  </SettlementCell>
                  <SettlementCell>
                    <SettlementLabel>Estimated amount</SettlementLabel>
                    <SettlementValue $gold>{settlementEstimate.amount}</SettlementValue>
                  </SettlementCell>
                  <SettlementCell>
                    <SettlementLabel>Network</SettlementLabel>
                    <SettlementValue>BNB Chain</SettlementValue>
                  </SettlementCell>
                </SettlementMain>
                <SettlementNote>
                  <div>Final amount is refreshed before wallet confirmation.</div>
                  {pay === 'MARCO_PAY' && marcoPayReadiness?.rewards?.customerLabel ? (
                    <div>
                      {marcoPayReadiness.rewards.customerLabel} after verified settlement in your{' '}
                      <strong>MARCO Passport</strong>.
                    </div>
                  ) : null}
                  {pay === 'MARCO_PAY' && referral && referralCatalogRef ? (
                    <div>Passport PRO referral recognised. The authoritative discount is verified by MARCO at review.</div>
                  ) : null}
                </SettlementNote>
              </SettlementSummary>
            </div>
          ) : null}

          {step === 'review' ? (
            <div data-testid="commercial-step-review">
              <ReviewStage>
                <ReviewCard>
                  <ReviewTitle>Review your order</ReviewTitle>
                  <ReviewDivider />
                  <ReviewRows>
                    <ReviewRow>
                      <span>Project</span>
                      <strong>{detected?.name ?? projectSlug}</strong>
                    </ReviewRow>
                    <ReviewRow>
                      <span>Service</span>
                      <strong>{serviceMeta?.title ?? '—'}</strong>
                    </ReviewRow>
                    <ReviewRow>
                      <span>Duration</span>
                      <strong>{selectedPackage?.durationLabel ?? '—'}</strong>
                    </ReviewRow>
                    <ReviewRow>
                      <span>Settlement</span>
                      <strong>{paymentLabel} on BNB Chain</strong>
                    </ReviewRow>
                    {marcoPayOrder?.referralApplied ? (
                      <ReviewRow>
                        <span>Passport PRO</span>
                        <strong>
                          Referral recognised · −$
                          {formatApproxNumber(Number(marcoPayOrder.referralDiscountMinor ?? '0') / 100, 2)}
                        </strong>
                      </ReviewRow>
                    ) : null}
                  </ReviewRows>
                  <ReviewDivider />
                  <ReviewTotal>
                    <span>Total</span>
                    <strong>${formatApproxNumber(payableUsd, 2)}</strong>
                  </ReviewTotal>
                  <ReviewQuote>
                    <ReviewQuoteLabel>Approx. {settlementEstimate.label} required</ReviewQuoteLabel>
                    <ReviewQuoteValue>{settlementEstimate.amount}</ReviewQuoteValue>
                    <ReviewQuoteNote>Final amount is refreshed before wallet confirmation.</ReviewQuoteNote>
                  </ReviewQuote>
                  <VerifiedSettlement $error={Boolean(checkoutBlocker)}>
                    <span aria-hidden="true">{checkoutBlocker ? '!' : '✓'}</span>
                    {checkoutBlocker ?? 'Verified settlement · Automatic placement activation'}
                  </VerifiedSettlement>
                  {isMarcoPay && marcoPayOrder && !hidePaymentAction ? (
                    <>
                      <div style={{ marginTop: 14 }}>
                        <MarcoPay
                          application={marcoPayOrder.application}
                          amount={marcoPayOrder.amount}
                          currency={marcoPayOrder.currency}
                          product={marcoPayOrder.product}
                          item={`${serviceMeta?.title ?? 'Melega DEX visibility'} · ${detected?.symbol ?? projectSlug}`}
                          reference={marcoPayOrder.reference}
                          paymentId={marcoPayOrder.paymentId}
                          approvalUrl={marcoPayOrder.approvalUrl}
                          onLaunch={() => void reviewAndPay()}
                          onPaymentStarted={handleMarcoPayStarted}
                          onPaymentCreated={handleMarcoPayCreated}
                          onPaymentCompleted={handleMarcoPayCompleted}
                          onError={handleMarcoPayError}
                        />
                      </div>
                      <Meta style={{ marginTop: 8, textAlign: 'center' }}>
                        Your service activates only after the signed MARCO Pay receipt is verified.
                      </Meta>
                    </>
                  ) : null}
                  {!hidePaymentAction && quoteSummary ? (
                    <Meta style={{ marginTop: 8, textAlign: 'center' }}>{quoteSummary}</Meta>
                  ) : null}
                  {!hidePaymentAction && walletStage !== 'idle' ? (
                    <div style={{ marginTop: 10 }}>
                      <WalletFlowStatus stage={walletStage} detail={error ?? undefined} />
                    </div>
                  ) : null}
                  {isPaymentProcessing && !isTerminalSuccess ? (
                    <ProcessingState data-testid="commercial-checkout-processing">
                      <ProcessingSpinner aria-hidden="true" />
                      <ProcessingTitle>TRANSACTION SUBMITTED</ProcessingTitle>
                      <ProcessingCopy>Your MARCO payment is being confirmed on-chain.</ProcessingCopy>
                      <ProcessingCopy>
                        Please wait while we verify your payment and activate your service.
                      </ProcessingCopy>
                      <ProcessingCopy>This may take a few moments.</ProcessingCopy>
                      {submittedTxHash ? (
                        <ProcessingHash>
                          {`${submittedTxHash.slice(0, 10)}…${submittedTxHash.slice(-8)}`}
                        </ProcessingHash>
                      ) : null}
                    </ProcessingState>
                  ) : null}
                  {isTerminalSuccess ? (
                    <SuccessState data-testid="commercial-checkout-success">
                      <SuccessTitle>✓ PAYMENT COMPLETED</SuccessTitle>
                      <SuccessHeadline>BOOST ACTIVATED</SuccessHeadline>
                      <SuccessSummary>{fulfilledServiceSummary}</SuccessSummary>
                      {isMarcoPay ? (
                        <SuccessNote>Paid with MARCO Pay · Verified on-chain</SuccessNote>
                      ) : null}
                      {confirmedRewardNotice ? (
                        <Meta style={{ marginTop: 8, textAlign: 'center' }} data-testid="marco-pay-reward-notice">
                          {confirmedRewardNotice}
                          {' · '}
                          <a href={MARCO_PASSPORT_URL} target="_blank" rel="noopener noreferrer">
                            Open MARCO Passport
                          </a>
                        </Meta>
                      ) : (
                        <Meta style={{ marginTop: 8, textAlign: 'center' }}>
                          <a href={MARCO_PASSPORT_URL} target="_blank" rel="noopener noreferrer">
                            Open MARCO Passport
                          </a>
                        </Meta>
                      )}
                    </SuccessState>
                  ) : null}
                </ReviewCard>
              </ReviewStage>
            </div>
          ) : null}
          {error ? <Err data-testid="commercial-checkout-error">{error}</Err> : null}
        </Stack>
      </Grid>
    </MelegaModal>
  )
}

export default CommercialCheckoutModal
