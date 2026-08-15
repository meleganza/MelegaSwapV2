/**
 * One-surface visibility checkout.
 * Project identity is resolved before a commercial offer can be reviewed.
 * Products without verified settlement/fulfilment remain visible but fail closed.
 */
import React, { useCallback, useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAccount, useSigner } from 'wagmi'
import { MarcoPay } from 'components/MarcoWidgets'
import ConnectWalletButton from 'components/ConnectWalletButton'
import {
  MelegaModal,
  MelegaModalFooter,
  MelegaModalFooterActions,
  MelegaModalFooterMeta,
} from 'design-system/melega/components'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
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
import { VISIBILITY_RUNTIME, visibilityCheckoutBlocker } from 'lib/monetization/visibilityRuntime'
import { buildProjectClaimMessage, normalizeClaimMetadata } from 'lib/project-claims/claimMessage'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import type { WalletFlowStage } from 'lib/monetization/copy'
import {
  VISIBILITY_SERVICES,
  type CommercialCheckoutStep,
  type CommercialPaymentAsset,
  type CommercialServiceId,
} from './commercialCheckoutTypes'
import { appendMarketingHistory } from './marketingHistory'

const MARCO_PAY_APPLICATION = process.env.NEXT_PUBLIC_MARCO_PAY_APPLICATION?.trim() || ''

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
    label: 'MARCO PAY',
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

type ProjectDraft = {
  handle: string
  logoUrl: string
  description: string
  website: string
  x: string
  telegram: string
}

const EMPTY_DRAFT: ProjectDraft = {
  handle: '',
  logoUrl: '',
  description: '',
  website: '',
  x: '',
  telegram: '',
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
  gap: 10px;
  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 1080px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const pricePulse = keyframes`
  0%, 100% { text-shadow: 0 0 0 rgba(244, 196, 48, 0); transform: translateY(0); }
  50% { text-shadow: 0 0 14px rgba(244, 196, 48, .32); transform: translateY(-1px); }
`

const ServiceCard = styled.button<{ $on?: boolean; $live?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: center;
  min-width: 0;
  min-height: 164px;
  padding: 18px 14px 15px;
  border-radius: 14px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.11)' : 'rgba(255,255,255,.025)')};
  color: ${uxRebuildColors.text};
  opacity: ${({ $live }) => ($live ? 1 : 0.7)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 9px;
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(221, 185, 47, 0.62);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const ServiceTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
`

const STitle = styled.div`
  font-size: 16px;
  line-height: 1.2;
  font-weight: 780;
`

const SDesc = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${uxRebuildColors.secondary};
`

const SPrice = styled.div`
  margin-top: auto;
  text-align: center;
  color: ${uxRebuildColors.gold};
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
  font-weight: 820;
  animation: ${pricePulse} 2.8s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SPricePrefix = styled.span`
  font-size: 11px;
  font-weight: 720;
  color: rgba(221, 185, 47, 0.76);
`

const SPriceValue = styled.span`
  font-size: 22px;
  line-height: 1;
`

const PkgGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 920px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
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
  right: -7px;
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
    grid-template-columns: repeat(6, minmax(0, 1fr));
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
`

const PaymentName = styled.strong`
  min-height: 32px;
  display: grid;
  place-items: center;
  font-size: 14px;
  line-height: 1.12;
  text-align: center;
  white-space: pre-line;
`

const PaymentNetwork = styled.span`
  min-height: 21px;
  padding: 2px 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 10px;
  line-height: 15px;
`

const PremiumCashbackSticker = styled(CashbackSticker)`
  top: -1px;
  right: -1px;
  padding: 5px 8px;
  font-size: 9px;
  line-height: 1.05;
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
    grid-template-columns: minmax(0, 1fr);
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

const Textarea = styled.textarea`
  width: 100%;
  min-height: 70px;
  box-sizing: border-box;
  resize: vertical;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f4f4f4;
  padding: 11px 13px;
  font-size: 13px;
  outline: none;
`

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [project.logoUrl])
  return (
    <Logo style={compact ? { width: 38, height: 38 } : undefined}>
      {project.logoUrl && !failed ? (
        <img src={project.logoUrl} alt={`${project.name} logo`} onError={() => setFailed(true)} />
      ) : (
        project.symbol.slice(0, 1)
      )}
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

const Label = styled.div`
  margin-bottom: 7px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 720;
`

const STEPS: CommercialCheckoutStep[] = ['project', 'service', 'package', 'chain', 'payment', 'review', 'checkout']
const STEP_LABELS: Record<CommercialCheckoutStep, string> = {
  project: 'Project',
  service: 'Service',
  package: 'Package',
  chain: 'Chain',
  payment: 'Payment',
  review: 'Review',
  checkout: 'Checkout',
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
  if (
    !json?.ok ||
    !json?.onChain ||
    json.onChain.verifiedDeployment !== true ||
    !String(json.onChain.name ?? '').trim() ||
    !String(json.onChain.symbol ?? '').trim()
  ) {
    return null
  }
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
    logoUrl: project?.logoUrl ?? dex?.logo ?? null,
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
  identityReady = true,
  onHistoryChange,
  visibilityOnly: _visibilityOnly = false,
}) => {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const buyerWallet = address ?? null
  const [step, setStep] = useState<CommercialCheckoutStep>('project')
  const [service, setService] = useState<CommercialServiceId | null>(initialService)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [identityChain, setIdentityChain] = useState(chainId)
  const [contract, setContract] = useState(projectContract ?? '')
  const [detected, setDetected] = useState<DetectedProject | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT)
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
  const [settlementMarket, setSettlementMarket] = useState<SettlementMarket>({ loading: false })

  const serviceMeta = VISIBILITY_SERVICES.find((item) => item.id === service) ?? null
  const packages = service ? CATALOGS[service] ?? [] : []
  const selectedPackage =
    packages.find((item) => item.id === selectedPackageId) ??
    packages.find((item) => item.isDefault) ??
    packages[0] ??
    null
  const projectPageReady = Boolean(detected?.projectPageExists && identityReady)
  const runtimeCheckoutBlocker = visibilityCheckoutBlocker({
    service,
    payment: pay,
    projectPageReady,
    hasReferral: Boolean(referral.trim()),
    hasFeaturedAddOns: false,
  })
  const checkoutBlocker =
    runtimeCheckoutBlocker ??
    (pay === 'MARCO_PAY' && !MARCO_PAY_APPLICATION
      ? 'MARCO PAY cannot prepare production payments until the provider issues the Melega DEX application key.'
      : null)
  const subtotal = selectedPackage?.usdPrice ?? 0
  const totalUsd = subtotal
  const settlementEstimate = resolveSettlementEstimate(pay, totalUsd, settlementMarket)
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
    if (!/^0x[a-fA-F0-9]{40}$/.test(contract.trim())) {
      setDetected(null)
      setError('Paste a valid EVM token contract address.')
      return
    }
    setDetecting(true)
    setError(null)
    try {
      const response = await fetch('/api/registry/projects/onboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract: contract.trim(), chainId: identityChain }),
      })
      const json = (await response.json()) as RegistryDetection
      if (!response.ok) throw new Error(json.reason || json.error || 'TOKEN_DETECTION_FAILED')
      const next = parseDetectedProject(json, contract.trim(), identityChain)
      if (!next)
        throw new Error(json.onChain?.reasonUnavailable || 'The token identity could not be verified on-chain.')
      setDetected(next)
      setDraft((current) => ({
        ...current,
        handle: current.handle || next.slug || next.symbol.toLowerCase(),
        logoUrl: current.logoUrl || next.logoUrl || '',
        website: current.website || next.website || '',
      }))
    } catch (cause) {
      setDetected(null)
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setDetecting(false)
    }
  }, [contract, identityChain])

  useEffect(() => {
    if (!open) return
    setService(initialService)
    setSelectedPackageId('')
    setIdentityChain(chainId)
    setContract(projectContract ?? '')
    setDetected(null)
    setDraft(EMPTY_DRAFT)
    setPay('BNB')
    setFarmTarget('')
    setPoolTarget('')
    setReferral('')
    setError(null)
    setStatus('idle')
    setWalletStage('idle')
    setOrderId(null)
    setQuoteSummary(null)
    setSettlementMarket({ loading: true })
    setBusy(false)
    setStep('project')
  }, [open, initialService, chainId, projectContract])

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
    const timer = window.setTimeout(() => void detectProject(), 350)
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

  const publishDetectedProject = useCallback(async (): Promise<boolean> => {
    if (!detected) return false
    if (!address || !signer) {
      setError('Connect the project owner/deployer wallet to verify and publish the Project Page.')
      return false
    }
    if (!draft.description.trim()) {
      setError('Add a short project description before continuing.')
      return false
    }
    const metadata = normalizeClaimMetadata({
      name: detected.name,
      symbol: detected.symbol,
      handle: draft.handle || detected.symbol,
      description: draft.description,
      logo: draft.logoUrl || null,
      website: draft.website || null,
      x: draft.x || null,
      telegram: draft.telegram || null,
      discord: null,
    })
    if (!metadata.handle) {
      setError('Choose a valid Project Page handle before continuing.')
      return false
    }

    setBusy(true)
    try {
      const preflightResponse = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'preflight',
          chainId: detected.chainId,
          contract: detected.contract,
          claimant: address,
        }),
      })
      const preflight = await preflightResponse.json()
      if (!preflightResponse.ok || !preflight.ok) {
        throw new Error(preflight.reason || 'Project ownership verification failed.')
      }

      const issuedAt = new Date().toISOString()
      const message = buildProjectClaimMessage({
        chainId: detected.chainId,
        contract: detected.contract,
        claimant: address,
        metadata,
        issuedAt,
      })
      const signature = await signer.signMessage(message)
      const publishResponse = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          chainId: detected.chainId,
          contract: detected.contract,
          claimant: address,
          metadata,
          issuedAt,
          signature,
        }),
      })
      const published = await publishResponse.json()
      if (!publishResponse.ok || !published.ok) {
        throw new Error(published.reason || 'Project Page publication failed.')
      }
      const slug = published.claim?.slug ?? metadata.handle
      setDetected((current) =>
        current ? { ...current, tier: 'canonical', slug, projectPageExists: true, logoUrl: metadata.logo } : current,
      )
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Project Page publication failed.')
      return false
    } finally {
      setBusy(false)
    }
  }, [address, detected, draft, signer])

  const goNext = async () => {
    setError(null)
    if (step === 'project') {
      if (!detected) {
        setError('Detect the project before choosing visibility.')
        return
      }
      if (!detected.projectPageExists) {
        const published = await publishDetectedProject()
        if (!published) return
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
    if (step === 'review') {
      setStep('checkout')
    }
  }

  const goBack = () => {
    setError(null)
    const index = STEPS.indexOf(step)
    if (index > 0) setStep(STEPS[index - 1])
  }

  const handleMarcoPayPassport = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const passport = event.detail?.passport as { passportNumber?: string | number } | undefined
    if (passport?.passportNumber === undefined) return
    setQuoteSummary(`MARCO Passport · ${String(passport.passportNumber)}`)
  }, [])

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

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!selectedPackage || !service) return
    if (checkoutBlocker) {
      setError(checkoutBlocker)
      return
    }
    if (pay === 'MARCO_PAY') {
      setError('Complete payment in the MARCO PAY panel.')
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return
    }
    if (pay === 'M_CREDITS') {
      setError(VISIBILITY_RUNTIME.M_CREDITS.reason)
      return
    }

    const paymentAsset = pay as MonetizationAsset
    const resolvedContract = detected?.contract ?? projectContract
    const resolvedSlug = detected?.slug ?? projectSlug
    const resolvedProjectId = projectId || resolvedSlug || resolvedContract || detected?.symbol || 'visibility-project'
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
            projectId: resolvedProjectId,
            projectSlug: resolvedSlug,
            projectContract: resolvedContract,
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
            projectId: resolvedProjectId,
            projectSlug: resolvedSlug,
            projectContract: resolvedContract,
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
      if (!signer) {
        setWalletStage('error')
        throw new Error(RC_COPY.walletUnavailable)
      }
      const connectedChainId = await signer.getChainId()
      if (connectedChainId !== 56) {
        setWalletStage('switch_network')
        throw new Error(RC_COPY.wrongNetwork)
      }

      let txHash: string
      let receipt: Awaited<ReturnType<Awaited<ReturnType<typeof signer.sendTransaction>>['wait']>>
      try {
        const transaction = await signer.sendTransaction({
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
      appendMarketingHistory(resolvedSlug || projectSlug, {
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
      setError(cause instanceof Error ? cause.message : String(cause))
      setStatus('error')
      setWalletStage('error')
    } finally {
      setBusy(false)
    }
  }, [
    buyerWallet,
    checkoutBlocker,
    detected,
    onHistoryChange,
    pay,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    signer,
  ])

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
        {step !== 'project' ? (
          <GhostBtn type="button" onClick={goBack} data-testid="commercial-checkout-back">
            Back
          </GhostBtn>
        ) : (
          <GhostBtn type="button" onClick={onClose} data-testid="commercial-checkout-cancel">
            Cancel
          </GhostBtn>
        )}
        {step === 'checkout' && !buyerWallet && pay !== 'MARCO_PAY' ? (
          <CheckoutConnectBtn data-testid="commercial-checkout-connect">Connect Wallet</CheckoutConnectBtn>
        ) : step === 'checkout' ? (
          <PrimaryBtn
            type="button"
            disabled={busy || Boolean(checkoutBlocker) || pay === 'MARCO_PAY'}
            onClick={() => void runCheckout()}
            data-testid="commercial-checkout-pay"
          >
            {busy ? 'Processing…' : pay === 'MARCO_PAY' ? 'Complete in MARCO PAY' : 'Pay & activate'}
          </PrimaryBtn>
        ) : step === 'payment' || step === 'review' ? (
          <SecurePrimaryBtn
            type="button"
            onClick={() => void goNext()}
            disabled={busy || detecting}
            data-testid="commercial-checkout-next"
          >
            {step === 'review' ? 'Continue to secure payment' : `Continue with ${paymentLabel}`}
          </SecurePrimaryBtn>
        ) : (
          <PrimaryBtn
            type="button"
            onClick={() => void goNext()}
            disabled={busy || detecting}
            data-testid="commercial-checkout-next"
          >
            {busy && step === 'project' ? 'Verifying & publishing…' : 'Continue'}
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
                    setContract(event.target.value)
                    setDetected(null)
                  }}
                  placeholder="Paste the token address (0x...)"
                />
                <PrimaryBtn type="button" disabled={detecting} onClick={() => void detectProject()}>
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
                          {detected.projectPageExists ? `Project Page @${detected.slug}` : 'Project Page required'}
                        </Badge>
                        {detected.dexListed ? <Badge $green>Listed</Badge> : <Badge>Detected on-chain</Badge>}
                      </BadgeRow>
                    </div>
                  </Identity>
                  {!detected.projectPageExists ? (
                    <>
                      <Alert>
                        Complete the missing Project Page details here. Continue verifies the connected owner/deployer
                        wallet, requests a safe signature and publishes the Project Page without leaving this popup.
                      </Alert>
                      <FieldGrid>
                        <Input
                          value={draft.handle}
                          onChange={(event) => setDraft({ ...draft, handle: event.target.value.replace(/^@/, '') })}
                          placeholder="@handle"
                        />
                        <Input
                          value={draft.logoUrl}
                          onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })}
                          placeholder="Logo URL"
                        />
                        <Input
                          value={draft.website}
                          onChange={(event) => setDraft({ ...draft, website: event.target.value })}
                          placeholder="Website"
                        />
                        <Input
                          value={draft.x}
                          onChange={(event) => setDraft({ ...draft, x: event.target.value })}
                          placeholder="X / Twitter"
                        />
                        <Input
                          value={draft.telegram}
                          onChange={(event) => setDraft({ ...draft, telegram: event.target.value })}
                          placeholder="Telegram"
                        />
                      </FieldGrid>
                      <Textarea
                        value={draft.description}
                        onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                        placeholder="Short project description"
                      />
                    </>
                  ) : null}
                </Stack>
              ) : null}
            </div>
          ) : null}

          {step === 'service' ? (
            <div data-testid="commercial-step-service">
              <Label>Choose service</Label>
              <ServiceGrid>
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
                      <ServiceTitleRow>
                        <STitle>{item.title}</STitle>
                      </ServiceTitleRow>
                      <SDesc>{item.description}</SDesc>
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
                {(['BNB', 'USDT', 'USDC', 'MARCO', 'MARCO_PAY', 'M_CREDITS'] as CommercialPaymentAsset[]).map(
                  (asset) => {
                    const disabled =
                      (asset === 'MARCO_PAY' && !MARCO_PAY_APPLICATION) ||
                      (asset === 'M_CREDITS' && !VISIBILITY_RUNTIME.M_CREDITS.live)
                    const meta = PAYMENT_ASSET_META[asset]
                    return (
                      <PaymentCard
                        key={asset}
                        type="button"
                        $on={pay === asset}
                        disabled={disabled}
                        title={
                          asset === 'MARCO_PAY' && !MARCO_PAY_APPLICATION
                            ? 'MARCO PAY is temporarily unavailable.'
                            : undefined
                        }
                        onClick={() => {
                          setPay(asset)
                          setError(null)
                          setStatus('idle')
                          setWalletStage('idle')
                          setQuoteSummary(null)
                          setOrderId(null)
                        }}
                        data-testid={`commercial-pay-${asset}`}
                      >
                        {pay === asset ? <PaymentSelected aria-hidden="true">✓</PaymentSelected> : null}
                        <PaymentAssetLogo asset={asset} />
                        <PaymentName>{meta.label}</PaymentName>
                        <PaymentNetwork>BNB Chain</PaymentNetwork>
                        {asset === 'MARCO' ? <PremiumCashbackSticker>+5% CASHBACK</PremiumCashbackSticker> : null}
                      </PaymentCard>
                    )
                  },
                )}
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
                  {pay === 'MARCO' ? (
                    <div>
                      Cashback in <strong>M-Credits</strong> is credited after verified settlement in your{' '}
                      <strong>MARCO PASSPORT</strong>.
                    </div>
                  ) : null}
                </SettlementNote>
              </SettlementSummary>
              <div style={{ marginTop: 12 }}>
                <Label>Referral link · 50% to referrer</Label>
                <Input
                  value={referral}
                  onChange={(event) => setReferral(event.target.value)}
                  placeholder="Paste referral link or wallet-linked code"
                />
                {referral ? (
                  <Alert>{VISIBILITY_RUNTIME.referral.reason}</Alert>
                ) : (
                  <Meta style={{ marginTop: 6 }}>
                    Permanent attribution will be shown in My Melega once the referral ledger is active.
                  </Meta>
                )}
              </div>
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
                  </ReviewRows>
                  <ReviewDivider />
                  <ReviewTotal>
                    <span>Total</span>
                    <strong>${formatApproxNumber(totalUsd, 2)}</strong>
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
                </ReviewCard>
              </ReviewStage>
            </div>
          ) : null}

          {step === 'checkout' ? (
            <div data-testid="commercial-step-checkout">
              <Label>Checkout</Label>
              {checkoutBlocker ? (
                <Alert $error>{checkoutBlocker}</Alert>
              ) : pay === 'MARCO_PAY' ? (
                <>
                  <Meta>Complete the official MARCO PAY flow below.</Meta>
                  <div style={{ marginTop: 12 }}>
                    <MarcoPay
                      application={MARCO_PAY_APPLICATION}
                      amount={String(Math.round(totalUsd * 100))}
                      currency="USD"
                      item={`${serviceMeta?.title ?? 'Melega DEX visibility'} · ${detected?.symbol ?? projectSlug}`}
                      onPassportResolved={handleMarcoPayPassport}
                      onPaymentStarted={handleMarcoPayStarted}
                      onPaymentCreated={handleMarcoPayCreated}
                      onPaymentCompleted={handleMarcoPayCompleted}
                      onError={handleMarcoPayError}
                    />
                  </div>
                  <Meta style={{ marginTop: 8 }}>
                    A client event never activates a placement. Melega verifies the provider callback first.
                  </Meta>
                </>
              ) : (
                <Meta>Confirm in your wallet. Placement activates only after a verified receipt.</Meta>
              )}
              {quoteSummary ? <Meta style={{ marginTop: 8 }}>{quoteSummary}</Meta> : null}
              <div style={{ marginTop: 10 }}>
                <WalletFlowStatus stage={walletStage} />
              </div>
              {status === 'confirmed' ? (
                <Meta style={{ marginTop: 8, color: uxRebuildColors.positive }}>Activated · see Marketing History</Meta>
              ) : null}
            </div>
          ) : null}
          {error ? <Err data-testid="commercial-checkout-error">{error}</Err> : null}
        </Stack>
      </Grid>
    </MelegaModal>
  )
}

export default CommercialCheckoutModal
