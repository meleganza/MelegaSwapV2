/**
 * LIST_MODULE_006/007 — Premium workspace shell + AI Copilot panel.
 * Outer shell 1376×920 / 64·760·72 locked. MODULE_007 adds product-copilot assist.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import styled, { css, keyframes } from 'styled-components'
import { ethers } from 'ethers'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'
import { useSwitchNetwork as useMelegaSwitchNetwork } from 'hooks/useSwitchNetwork'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { buildProjectClaimMessage, normalizeClaimMetadata } from 'lib/project-claims/claimMessage'
import type { ProjectClaimRecord, PublicProjectClaim } from 'lib/project-claims/types'
import { LIST_CREATE_TOKEN_AVAILABLE, listOne, type ListIntent } from './listTokens'
import { useListIntent } from './useListIntent'
import { ListAiCopilot, type CopilotSuggestion } from './ListAiCopilot'
import { ListFeaturedCheckout } from './ListFeaturedCheckout'
import { ListTrendBoostCheckout } from './ListTrendBoostCheckout'
import { ListInlineLiquidityStep } from './ListInlineLiquidityStep'
import { deleteListDraft, loadListDraft, saveListDraft } from './listDraftPersistence'
import { CREATE_TOKEN_READINESS } from './createTokenReadiness'
import {
  assertTokenCreatedEvent,
  buildReviewFacts,
  encodeCreateTokenCalldata,
  humanSupplyToRaw,
  parseTokenCreatedReceipt,
  validateCreateTokenDraft,
  verifyDeployedToken,
  type CreateTokenDraft,
} from './createToken/createTokenTx'
import { MELEGA_TOKEN_FACTORY_ABI } from './createToken/createTokenAbi'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_FACTORY_CHAIN_ID,
  CREATE_TOKEN_FEE_RECIPIENT,
} from 'config/constants/createTokenFactoryDeployment'
import { CreateTokenPostCreationFunnel } from './createToken/CreateTokenPostCreationFunnel'
import { buildCreateTokenSuccessModel, type CreateTokenSuccessModel } from './createToken/createTokenPostCreationTypes'
import { CommercialCheckoutModal } from 'views/shared/monetization/CommercialCheckoutModal'

type StatusKind = 'Autosaved' | 'Draft' | 'Ready' | 'Review Required'
type FieldDef = { key: string; label: string; required: boolean }

const FLOW_TITLE: Record<ListIntent, string> = {
  'import-token': 'List Your Token',
  'create-token': 'Create Token',
  'claim-project': 'Claim Project',
  'create-project': 'Create Project',
  'ai-assistant': 'AI Assistant',
}

const REQUIRED: Record<ListIntent, FieldDef[]> = {
  'import-token': [
    { key: 'contract', label: 'Contract Address', required: true },
    { key: 'chain', label: 'Chain', required: true },
  ],
  'create-token': [
    { key: 'name', label: 'Token Name', required: true },
    { key: 'ticker', label: 'Ticker', required: true },
    { key: 'supply', label: 'Supply', required: true },
    { key: 'decimals', label: 'Decimals', required: true },
    { key: 'owner', label: 'Owner Wallet', required: true },
  ],
  'claim-project': [
    { key: 'contract', label: 'Contract', required: true },
    { key: 'wallet', label: 'Wallet', required: true },
    { key: 'name', label: 'Project name', required: true },
    { key: 'symbol', label: 'Ticker', required: true },
    { key: 'handle', label: 'Project handle', required: true },
    { key: 'description', label: 'Description', required: true },
  ],
  'create-project': [
    { key: 'name', label: 'Project Name', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'description', label: 'Description', required: true },
  ],
  'ai-assistant': [
    { key: 'name', label: 'Project Name', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'description', label: 'Description', required: true },
  ],
}

const TOTAL_DOTS = 5

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(${listOne.workspaceAnimSlide}); }
  to { opacity: 1; transform: translateY(0); }
`

const Shell = styled.section`
  position: relative;
  width: 100%;
  max-width: ${listOne.workspaceW};
  height: auto;
  min-height: ${listOne.workspaceMinH};
  margin: ${listOne.workspaceTop} 0 0;
  box-sizing: border-box;
  padding: ${listOne.workspacePadY} ${listOne.workspacePadX};
  border-radius: ${listOne.workspaceRadius};
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: ${listOne.workspaceBg};
  font-family: ${listOne.font};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 100%;
    max-width: ${listOne.mobileCardW};
    height: auto;
    min-height: 0;
    padding: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  box-sizing: border-box;
  height: ${listOne.workspaceHeaderH};
  flex: 0 0 ${listOne.workspaceHeaderH};
  display: grid;
  grid-template-columns: minmax(140px, 1fr) auto minmax(140px, 1fr);
  align-items: center;
  column-gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    grid-template-columns: 1fr;
    row-gap: 10px;
    padding-bottom: 10px;
  }
`

const FlowTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #f0f0f0;
  justify-self: start;
`

const FlowBrand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex: 0 0 auto;
  }
`

const SingleStep = styled.div`
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(221, 185, 47, 0.24);
  background: rgba(221, 185, 47, 0.07);
  color: #d8c16e;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
`

const ProgressTrack = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${listOne.workspaceProgressGap};
`

const JourneyProgress = styled.ol`
  display: grid;
  grid-template-columns: repeat(4, minmax(72px, 1fr));
  gap: 6px;
  width: min(470px, 44vw);
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 767px) {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const JourneyStage = styled.li<{ $state: 'current' | 'done' | 'future' }>`
  min-width: 0;
  padding: 7px 8px;
  border-radius: 9px;
  border: 1px solid
    ${({ $state }) =>
      $state === 'done'
        ? 'rgba(42, 190, 125, 0.28)'
        : $state === 'current'
        ? 'rgba(221, 185, 47, 0.4)'
        : 'rgba(255,255,255,0.08)'};
  background: ${({ $state }) =>
    $state === 'done'
      ? 'rgba(42, 190, 125, 0.08)'
      : $state === 'current'
      ? 'rgba(221, 185, 47, 0.09)'
      : 'rgba(255,255,255,0.025)'};
  color: ${({ $state }) => ($state === 'done' ? '#62d9a0' : $state === 'current' ? '#e5c453' : '#686868')};
  font-size: 9px;
  line-height: 13px;
  font-weight: 800;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.035em;
`

const Dot = styled.span<{ $state: 'current' | 'done' | 'future' }>`
  width: ${listOne.workspaceProgressDot};
  height: ${listOne.workspaceProgressDot};
  border-radius: 50%;
  box-sizing: border-box;
  border: 1px solid
    ${({ $state }) =>
      $state === 'current'
        ? 'rgba(221, 185, 47, 0.85)'
        : $state === 'done'
        ? 'rgba(255, 255, 255, 0.55)'
        : 'rgba(255, 255, 255, 0.16)'};
  background: ${({ $state }) =>
    $state === 'current' ? 'rgba(221, 185, 47, 0.22)' : $state === 'done' ? 'rgba(255,255,255,0.18)' : '#161616'};
`

const HeaderRight = styled.div`
  justify-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 0;
`

const StatusPill = styled.span`
  height: ${listOne.workspaceStatusH};
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #bdbdbd;
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
  white-space: nowrap;
`

const AutosaveLine = styled.div`
  font-size: 11px;
  line-height: 14px;
  color: #8a8a8a;
  text-align: right;
  white-space: nowrap;

  span {
    display: block;
    color: #6e6e6e;
  }
`

const Body = styled.div`
  box-sizing: border-box;
  height: auto;
  min-height: 360px;
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(240px, ${listOne.workspaceContextW});
  column-gap: 20px;
  overflow: hidden;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: visible;
  }
`

const LeftPane = styled.div`
  min-width: 0;
  height: 100%;
  overflow: auto;
  padding-right: 4px;
  animation: ${fadeSlide} ${listOne.workspaceAnimMs} ease-out;

  @media (max-width: 767px) {
    height: auto;
    overflow: visible;
    animation: none;
  }
`

const RightPane = styled.aside`
  width: 100%;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-left: 1px solid rgba(255, 255, 255, 0.06);
  padding-left: 16px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: ${fadeSlide} ${listOne.workspaceAnimMs} ease-out;

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 14px 0 0;
    overflow: visible;
    animation: none;
  }
`

const Footer = styled.footer`
  box-sizing: border-box;
  height: ${listOne.workspaceFooterH};
  flex: 0 0 ${listOne.workspaceFooterH};
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 12px;
  }
`

const FooterLeft = styled.div`
  justify-self: start;
`

const FooterRight = styled.div`
  justify-self: end;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  border-radius: 10px;
  height: 40px;
  min-width: 108px;
  padding: 0 16px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(221, 185, 47, 0.75)' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? 'rgba(221, 185, 47, 0.14)' : 'rgba(255,255,255,0.03)')};
  color: #e8e8e8;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.55);
    outline-offset: 2px;
  }
`

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${listOne.workspaceFieldGap};
  padding: 8px 0 12px;
`

const ClaimIntro = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);

  strong {
    display: block;
    color: #f3f3f3;
    font-size: 15px;
  }

  span {
    display: block;
    margin-top: 3px;
    color: #858585;
    font-size: 11px;
  }
`

const ListedPill = styled.span`
  && {
    margin: 0;
    min-height: 26px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    background: rgba(42, 190, 125, 0.1);
    color: #62d9a0;
    border: 1px solid rgba(42, 190, 125, 0.25);
    white-space: nowrap;
    font-size: 10px;
    font-weight: 800;
  }
`

const ClaimGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

const ClaimWide = styled.div`
  grid-column: 1 / -1;
`

const LogoIdentity = styled.div`
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 12px;
  align-items: end;
`

const LogoPreview = styled.div<{ $src?: string }>`
  width: 58px;
  height: 58px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${({ $src }) =>
    $src
      ? `#0d0d0d url("${$src.replace(/"/g, '%22')}") center / cover no-repeat`
      : 'linear-gradient(145deg, rgba(221,185,47,.18), rgba(255,255,255,.03))'};
  display: grid;
  place-items: center;
  color: #d9b936;
  font-weight: 850;
  font-size: 16px;
  overflow: hidden;
`

const ClaimReview = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`

const ReviewItem = styled.div`
  min-width: 0;
  padding: 11px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: #858585;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  strong {
    display: block;
    margin-top: 4px;
    color: #ededed;
    font-size: 12px;
    line-height: 1.4;
    letter-spacing: 0;
    text-transform: none;
    word-break: break-word;
  }
`

const SuccessState = styled.div`
  min-height: 330px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 30px;

  > div {
    max-width: 520px;
  }

  strong {
    display: block;
    color: #fff;
    font-size: 24px;
  }

  p {
    margin: 10px auto 0;
    color: #969696;
    font-size: 13px;
    line-height: 1.6;
  }
`

const CompactCompletion = styled.div`
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
`

const CompletionLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #8b8b8b;
  font-size: 11px;

  strong {
    color: #ececec;
  }
`

const CompletionRail = styled.div<{ $pct: number }>`
  height: 4px;
  margin-top: 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    width: ${({ $pct }) => `${$pct}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #cda51f, #f2c84c);
  }
`

const FieldRow = styled.label`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  column-gap: 10px;
  align-items: start;
`

const Mark = styled.span<{ $ok: boolean; $invalid?: boolean }>`
  width: 16px;
  height: 16px;
  margin-top: 13px;
  border-radius: 50%;
  box-sizing: border-box;
  border: 1px solid
    ${({ $ok, $invalid }) =>
      $invalid ? 'rgba(220, 80, 80, 0.7)' : $ok ? 'rgba(110, 180, 120, 0.8)' : 'rgba(255,255,255,0.22)'};
  background: ${({ $ok, $invalid }) =>
    $invalid ? 'rgba(220, 80, 80, 0.12)' : $ok ? 'rgba(110, 180, 120, 0.18)' : 'transparent'};
  position: relative;

  ${({ $ok }) =>
    $ok &&
    css`
      &::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 2px;
        width: 5px;
        height: 8px;
        border: solid rgba(150, 210, 160, 0.95);
        border-width: 0 1.5px 1.5px 0;
        transform: rotate(45deg);
      }
    `}
`

const FieldBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const Label = styled.span`
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: #c4c4c4;
`

const Hint = styled.span`
  font-size: 11px;
  line-height: 15px;
  color: #7a7a7a;
`

const Optional = styled.span`
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #7a7a7a;
`

const control = css`
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #151515;
  color: #f2f2f2;
  font-size: 13px;
  font-family: inherit;

  &:disabled {
    opacity: 0.55;
  }

  &:focus {
    outline: none;
    border-color: rgba(221, 185, 47, 0.45);
  }
`

const Input = styled.input`
  ${control};
  height: 42px;
  padding: 0 12px;
`

const Select = styled.select`
  ${control};
  height: 42px;
  padding: 0 12px;
`

const TextArea = styled.textarea`
  ${control};
  min-height: 96px;
  padding: 10px 12px;
  resize: none;
`

const Idle = styled.div`
  height: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8a8a8a;
  font-size: 14px;
  line-height: 22px;
  padding: 24px;
`

const Banner = styled.div`
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.28);
  background: rgba(221, 185, 47, 0.06);
  color: #d6c48a;
  font-size: 12px;
  line-height: 18px;
  padding: 10px 12px;
`

const CompleteWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const Ring = styled.div<{ $pct: number }>`
  width: ${listOne.workspaceCompleteRing};
  height: ${listOne.workspaceCompleteRing};
  border-radius: 50%;
  flex-shrink: 0;
  background: conic-gradient(rgba(221, 185, 47, 0.75) ${({ $pct }) => $pct * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg);
  display: grid;
  place-items: center;

  &::after {
    content: '';
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #121212;
  }
`

const RingLabel = styled.div`
  position: absolute;
  width: ${listOne.workspaceCompleteRing};
  height: ${listOne.workspaceCompleteRing};
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #e8e8e8;
  pointer-events: none;
`

const RingBox = styled.div`
  position: relative;
  width: ${listOne.workspaceCompleteRing};
  height: ${listOne.workspaceCompleteRing};
`

const CompleteMeta = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #f0f0f0;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    line-height: 15px;
    color: #8a8a8a;
  }
`

const ContextCard = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: #141414;
  padding: 12px 14px;
`

const ContextTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d8d8d8;
  margin-bottom: 8px;
`

const ContextRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  line-height: 18px;
  color: #9a9a9a;
  padding: 3px 0;

  strong {
    color: #e4e4e4;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }
`

const Placeholder = styled.div`
  flex: 1;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6e6e6e;
  font-size: 12px;
  line-height: 18px;
  padding: 16px;
`

const Chat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Transcript = styled.div`
  min-height: 180px;
  max-height: 320px;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141414;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Bubble = styled.div<{ $user?: boolean }>`
  align-self: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
  max-width: 88%;
  border-radius: 12px;
  padding: 9px 11px;
  font-size: 13px;
  line-height: 18px;
  background: ${({ $user }) => ($user ? 'rgba(221,185,47,0.12)' : '#1a1a1a')};
  color: #e4e4e4;
  border: 1px solid ${({ $user }) => ($user ? 'rgba(221,185,47,0.22)' : 'rgba(255,255,255,0.06)')};
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button`
  appearance: none;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: #cfcfcf;
  font-size: 12px;
  line-height: 16px;
  padding: 7px 11px;
  cursor: pointer;
  font-family: inherit;

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.55);
    outline-offset: 2px;
  }
`

function filled(value: string | undefined) {
  return Boolean(value && String(value).trim().length > 0)
}

function completionPct(intent: ListIntent | null, values: Record<string, string>) {
  if (!intent) return 0
  const req = REQUIRED[intent].filter((f) => f.required)
  if (!req.length) return values.prompt ? 50 : 0
  const n = req.filter((f) => filled(values[f.key])).length
  const raw = (n / req.length) * 100
  if (raw <= 0) return 0
  if (raw < 25) return 25
  if (raw < 50) return 25
  if (raw < 75) return 50
  if (raw < 100) return 75
  return 100
}

function relativeSaved(ts: number | null, now: number) {
  if (!ts) return null
  const sec = Math.max(0, Math.floor((now - ts) / 1000))
  if (sec < 2) return 'just now'
  if (sec < 60) return `${sec} seconds ago`
  const min = Math.floor(sec / 60)
  return min === 1 ? '1 minute ago' : `${min} minutes ago`
}

function Field({
  label,
  ok,
  invalid,
  hint,
  optional,
  children,
}: {
  label: string
  ok: boolean
  invalid?: boolean
  hint?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <FieldRow>
      <Mark $ok={ok} $invalid={invalid} aria-hidden />
      <FieldBody>
        <Label>
          {label}
          {optional ? <Optional>optional</Optional> : null}
        </Label>
        {children}
        {hint ? <Hint>{hint}</Hint> : null}
      </FieldBody>
    </FieldRow>
  )
}

function ContextEmpty({ label }: { label: string }) {
  return <Placeholder>{label}</Placeholder>
}

export const ListWorkspace: React.FC = () => {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const { switchNetworkAsync } = useMelegaSwitchNetwork()
  const { listIntent, clearListIntent } = useListIntent()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [pendingDescription, setPendingDescription] = useState<string | null>(null)
  const [createTokenPhase, setCreateTokenPhase] = useState<'form' | 'success'>('form')
  const [createdToken, setCreatedToken] = useState<CreateTokenSuccessModel | null>(null)
  const [createTokenBusy, setCreateTokenBusy] = useState(false)
  const [createTokenStage, setCreateTokenStage] = useState<
    'idle' | 'switching' | 'awaiting-signature' | 'confirming' | 'verifying'
  >('idle')
  const [createTokenError, setCreateTokenError] = useState<string | null>(null)
  const [claimSubmitted, setClaimSubmitted] = useState(false)
  const [claimRecord, setClaimRecord] = useState<PublicProjectClaim | null>(null)
  const [claimBusy, setClaimBusy] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimAuthorityType, setClaimAuthorityType] = useState<ProjectClaimRecord['authorityType'] | null>(null)
  const [liquidityConfirmed, setLiquidityConfirmed] = useState(false)
  const [visibilityCheckoutOpen, setVisibilityCheckoutOpen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const querySlug =
    typeof router.query.slug === 'string' && router.query.slug.trim() ? router.query.slug.trim().toLowerCase() : null
  const queryContract =
    typeof router.query.contract === 'string' && router.query.contract.trim() ? router.query.contract.trim() : null
  const queryChain =
    typeof router.query.chain === 'string' && router.query.chain.trim() ? router.query.chain.trim() : null
  const queryName = typeof router.query.name === 'string' && router.query.name.trim() ? router.query.name.trim() : null
  const querySymbol =
    typeof router.query.symbol === 'string' && router.query.symbol.trim() ? router.query.symbol.trim() : null
  const queryLogo = typeof router.query.logo === 'string' && router.query.logo.trim() ? router.query.logo.trim() : null
  const queryListed = router.query.listed === '1'
  const queryJourney = router.query.journey === 'listing'
  const queryLiquidityConfirmed = router.query.liquidity === 'confirmed'

  useEffect(() => {
    setStep(0)
    setAttempted(false)
    setSavedAt(null)
    setPendingDescription(null)
    setCreateTokenPhase('form')
    setCreatedToken(null)
    setCreateTokenBusy(false)
    setCreateTokenStage('idle')
    setCreateTokenError(null)
    setClaimSubmitted(false)
    setClaimRecord(null)
    setClaimBusy(false)
    setClaimError(null)
    setClaimAuthorityType(null)
    setLiquidityConfirmed(queryLiquidityConfirmed)
    setVisibilityCheckoutOpen(false)
    if (!listIntent) {
      setValues({})
      return
    }
    const restored = loadListDraft({
      intent: listIntent,
      wallet: 'guest',
      chainId: 56,
    })
    if (restored?.values) {
      const detectedHandle = querySymbol ? `@${querySymbol.toLowerCase().replace(/[^a-z0-9_]/g, '')}` : ''
      setValues({
        ...restored.values,
        ...(listIntent === 'import-token' && queryContract ? { contract: queryContract } : {}),
        ...(listIntent === 'import-token' && queryChain ? { chain: queryChain } : {}),
        ...(listIntent === 'import-token' && querySymbol ? { auto: querySymbol } : {}),
        ...(listIntent === 'import-token' && queryName ? { name: queryName } : {}),
        ...(listIntent === 'import-token' && queryLogo ? { logo: queryLogo } : {}),
        ...(listIntent === 'claim-project' && querySlug ? { slug: querySlug } : {}),
        ...(listIntent === 'claim-project' && queryContract ? { contract: queryContract } : {}),
        ...(listIntent === 'claim-project' && queryChain ? { chain: queryChain } : {}),
        ...(listIntent === 'claim-project' && queryName ? { name: queryName } : {}),
        ...(listIntent === 'claim-project' && querySymbol ? { symbol: querySymbol } : {}),
        ...(listIntent === 'claim-project' && queryLogo ? { logo: queryLogo } : {}),
        ...(listIntent === 'claim-project' && queryListed ? { listed: '1' } : {}),
        ...(listIntent === 'claim-project' && detectedHandle && !restored.values.handle
          ? { handle: detectedHandle }
          : {}),
      })
      setSavedAt(Date.parse(restored.updatedAt) || Date.now())
      return
    }
    if (listIntent === 'import-token')
      setValues({
        contract: queryContract || '',
        chain: queryChain || '56',
        auto: querySymbol || '',
        name: queryName || '',
        logo: queryLogo || '',
      })
    else if (listIntent === 'create-token') setValues({ decimals: '18' })
    else if (listIntent === 'create-project' || listIntent === 'ai-assistant') setValues({ category: 'defi' })
    else if (listIntent === 'claim-project')
      setValues({
        verification: 'pending',
        chain: queryChain || '56',
        listed: queryListed ? '1' : '',
        ...(querySlug ? { slug: querySlug } : {}),
        ...(queryContract ? { contract: queryContract } : {}),
        ...(queryName ? { name: queryName } : {}),
        ...(querySymbol ? { symbol: querySymbol } : {}),
        ...(queryLogo ? { logo: queryLogo } : {}),
        ...(querySymbol ? { handle: `@${querySymbol.toLowerCase().replace(/[^a-z0-9_]/g, '')}` } : {}),
      })
    else setValues({})
  }, [
    listIntent,
    querySlug,
    queryContract,
    queryChain,
    queryName,
    querySymbol,
    queryLogo,
    queryListed,
    queryLiquidityConfirmed,
  ])

  useEffect(() => {
    if (listIntent !== 'claim-project' || !isConnected || !address) return
    setValues((current) =>
      current.wallet === address && current.verification === 'wallet-connected'
        ? current
        : { ...current, wallet: address, verification: 'wallet-connected' },
    )
  }, [listIntent, isConnected, address])

  useEffect(() => {
    if (listIntent !== 'create-token' || !isConnected || !address) return
    setValues((current) => (current.owner ? current : { ...current, owner: address }))
  }, [listIntent, isConnected, address])

  /** Featured / Trend Boost deep links from Project Page Grow CTAs. */
  useEffect(() => {
    if (typeof window === 'undefined' || !listIntent) return
    const hash = window.location.hash.replace(/^#/, '')
    if (hash !== 'featured' && hash !== 'trend-boost') return
    const scroll = () => {
      const el = document.getElementById(hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    const t = window.setTimeout(scroll, 120)
    return () => window.clearTimeout(t)
  }, [listIntent, values.contract, values.wallet, values.slug])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!listIntent) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (!Object.keys(values).some((k) => filled(values[k]))) return
      // Guest-scoped by default; wallet field stored inside values for isolation checks.
      const saved = saveListDraft({
        intent: listIntent,
        wallet: 'guest',
        chainId: 56,
        projectKey: values.contract || values.name || null,
        values,
        featuredOrderId: values.featuredOrderId || null,
      })
      setSavedAt(Date.parse(saved.updatedAt) || Date.now())
    }, 2000)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [values, listIntent])

  const pct = completionPct(listIntent, values)
  const listingJourney = queryJourney && (listIntent === 'import-token' || listIntent === 'claim-project')
  const journeyStage = listIntent === 'import-token' ? 1 : claimSubmitted ? 3 : 2
  const flowStepCount =
    listingJourney
      ? 4
      : listIntent === 'claim-project'
      ? 2
      : listIntent === 'import-token' || listIntent === 'create-token'
      ? 1
      : TOTAL_DOTS
  const status: StatusKind = useMemo(() => {
    if (!listIntent) return 'Draft'
    if (listIntent === 'create-token' && createTokenPhase === 'success') return 'Ready'
    if (claimSubmitted) return 'Ready'
    if (listingJourney && pct >= 100) return 'Ready'
    if (pct >= 100 && step >= flowStepCount - 1) return 'Ready'
    if (pct >= 100) return 'Ready'
    if (savedAt) return 'Autosaved'
    return 'Draft'
  }, [listIntent, pct, savedAt, step, createTokenPhase, claimSubmitted, flowStepCount, listingJourney])

  const savedLabel = relativeSaved(savedAt, now)
  const createTokenSuccess = listIntent === 'create-token' && createTokenPhase === 'success' && createdToken
  const createTokenFinalStep = listIntent === 'create-token'
  const createTokenActionLabel = !isConnected
    ? 'Connect wallet'
    : chain?.id !== CREATE_TOKEN_FACTORY_CHAIN_ID
    ? 'Switch to BNB'
    : createTokenStage === 'switching'
    ? 'Switching…'
    : createTokenStage === 'awaiting-signature'
    ? 'Confirm in wallet'
    : createTokenStage === 'confirming'
    ? 'Creating token…'
    : createTokenStage === 'verifying'
    ? 'Verifying token…'
    : 'Create Token'
  const primaryLabel = createTokenSuccess
    ? 'Done'
    : listIntent === 'claim-project' && claimSubmitted
    ? `Open @${claimRecord?.slug || values.handle?.replace(/^@/, '') || 'project'}`
    : listIntent === 'claim-project' && step === 0
    ? 'Verify ownership'
    : listIntent === 'claim-project'
    ? 'Sign & publish'
    : listIntent === 'import-token'
    ? liquidityConfirmed
      ? 'Continue to Project Page'
      : 'Complete liquidity above'
    : createTokenFinalStep
    ? createTokenActionLabel
    : step >= TOTAL_DOTS - 1 || (listIntent === 'ai-assistant' && step >= 0 && pct >= 75)
    ? 'Publish'
    : 'Continue'
  const canPublishish =
    listIntent !== 'create-token' ||
    LIST_CREATE_TOKEN_AVAILABLE ||
    primaryLabel === 'Continue' ||
    primaryLabel === 'Done'
  const usesCopilot = listIntent === 'create-project' || listIntent === 'ai-assistant'

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const invalid = (key: string, required = true) => attempted && required && !filled(values[key])

  const applySuggestion = (s: CopilotSuggestion) => {
    if (s.kind === 'category') setValues((v) => ({ ...v, category: 'wallet' }))
    if (s.kind === 'tags') setValues((v) => ({ ...v, aiNote: s.preview }))
    if (s.kind === 'website') {
      const url = `https://${(values.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '')}.io`
      setValues((v) => ({ ...v, website: url }))
    }
    if (s.kind === 'social') {
      const handle = `@${(values.name || 'project')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 14)}`
      setValues((v) => ({ ...v, twitter: handle, social: handle }))
    }
    if (s.kind === 'logo') setValues((v) => ({ ...v, logo: 'pending://logo-preview' }))
  }

  const generateDescription = () => {
    const name = values.name?.trim() || 'This project'
    setPendingDescription(
      `${name} is building on Melega. Draft generated locally for review — pending backend AI. Nothing was published.`,
    )
  }

  const enterCreateTokenSuccess = (tokenAddress: string, creationTx: string) => {
    const model = buildCreateTokenSuccessModel({
      name: values.name,
      symbol: values.ticker,
      logoUrl: values.logo || null,
      contractAddress: tokenAddress,
      chainId: 56,
    })
    setCreatedToken(model)
    setCreateTokenPhase('success')
    setValues((v) => ({ ...v, tokenAddress, contract: tokenAddress, creationTx, postCreate: '1' }))
  }

  const publishCreateToken = async () => {
    if (!LIST_CREATE_TOKEN_AVAILABLE) return
    if (!address || !isConnected || !signer) {
      setCreateTokenError('Connect your wallet to create the token.')
      return
    }
    const decimals = Number.parseInt(values.decimals || '18', 10)
    const draft: CreateTokenDraft = {
      name: values.name || '',
      symbol: values.ticker || '',
      supplyHuman: values.supply || '',
      decimals,
      owner: values.owner || address,
      logoUrl: values.logo || undefined,
      description: values.description || undefined,
      website: values.website || undefined,
      social: values.social || undefined,
    }
    const errors = validateCreateTokenDraft(draft)
    if (errors.length) {
      setAttempted(true)
      setCreateTokenError(errors[0])
      return
    }
    const deployment = CREATE_TOKEN_CANONICAL_DEPLOYMENT
    if (!deployment.factoryAddress || !deployment.creationFeeWei) {
      setCreateTokenError('Canonical Create Token factory is not configured.')
      return
    }

    setCreateTokenBusy(true)
    setCreateTokenError(null)
    try {
      if (chain?.id !== CREATE_TOKEN_FACTORY_CHAIN_ID) {
        setCreateTokenStage('switching')
        await switchNetworkAsync(CREATE_TOKEN_FACTORY_CHAIN_ID)
      }
      const activeChainId = await signer.getChainId()
      if (activeChainId !== CREATE_TOKEN_FACTORY_CHAIN_ID) {
        throw new Error('Switch your wallet to BNB Smart Chain and try again.')
      }

      const provider = signer.provider
      if (!provider) throw new Error('Wallet provider is unavailable.')
      const code = await provider.getCode(deployment.factoryAddress)
      if (!code || code === '0x') throw new Error('Canonical Create Token factory is unavailable.')
      const factory = new ethers.Contract(deployment.factoryAddress, MELEGA_TOKEN_FACTORY_ABI as any, signer)
      const [onChainFee, onChainRecipient] = await Promise.all([factory.creationFee(), factory.feeRecipient()])
      if (onChainFee.toString() !== deployment.creationFeeWei) {
        throw new Error('Create Token fee changed. Transaction blocked for your protection.')
      }
      if (String(onChainRecipient).toLowerCase() !== CREATE_TOKEN_FEE_RECIPIENT.toLowerCase()) {
        throw new Error('Create Token treasury mismatch. Transaction blocked for your protection.')
      }

      // Encoding validation runs before any wallet prompt.
      encodeCreateTokenCalldata(draft)
      const totalSupplyRaw = humanSupplyToRaw(draft.supplyHuman, draft.decimals).toString()
      const args = [draft.name.trim(), draft.symbol.trim(), totalSupplyRaw, draft.decimals, draft.owner]
      const estimatedGas = await factory.estimateGas.createToken(...args, { value: onChainFee })
      const gasPrice = await provider.getGasPrice()
      const requiredNative = onChainFee.add(estimatedGas.mul(gasPrice))
      const walletBalance = await provider.getBalance(address)
      if (walletBalance.lt(requiredNative)) {
        throw new Error('Insufficient BNB for the 0.10 BNB creation fee and network gas.')
      }

      setCreateTokenStage('awaiting-signature')
      const transaction = await factory.createToken(...args, {
        value: onChainFee,
        gasLimit: estimatedGas.mul(120).div(100),
      })
      setCreateTokenStage('confirming')
      const receipt = await transaction.wait(1)
      const event = parseTokenCreatedReceipt(receipt, deployment.factoryAddress)
      const eventIssues = assertTokenCreatedEvent({
        event,
        draft,
        creator: address,
        creationFeeWei: deployment.creationFeeWei,
      })
      if (eventIssues.length) throw new Error(eventIssues[0])

      setCreateTokenStage('verifying')
      const tokenIssues = await verifyDeployedToken({
        provider,
        event,
        factoryAddress: deployment.factoryAddress,
        draft,
      })
      if (tokenIssues.length) throw new Error(tokenIssues[0])
      enterCreateTokenSuccess(event.token, receipt.transactionHash)
      setCreateTokenStage('idle')
    } catch (error: any) {
      const rejected = error?.code === 4001 || error?.code === 'ACTION_REJECTED'
      setCreateTokenError(
        rejected
          ? 'Wallet signature rejected. No token was created and no fee was charged.'
          : error instanceof Error
          ? error.message
          : 'Create Token transaction failed.',
      )
      setCreateTokenStage('idle')
    } finally {
      setCreateTokenBusy(false)
    }
  }

  const claimMetadata = () =>
    normalizeClaimMetadata({
      name: values.name || '',
      symbol: values.symbol || '',
      handle: values.handle || '',
      description: values.description || '',
      logo: values.logo || null,
      website: values.website || null,
      x: values.x || null,
      telegram: values.telegram || null,
      discord: values.discord || null,
    })

  const verifyClaimAuthority = async () => {
    if (!address || !isConnected) {
      setClaimError('Connect the owner or deployer wallet before continuing.')
      return
    }
    setClaimBusy(true)
    setClaimError(null)
    try {
      const response = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'preflight',
          chainId: Number(values.chain || queryChain || 56),
          contract: values.contract,
          claimant: address,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) throw new Error(payload.reason || 'Ownership proof failed.')
      setClaimAuthorityType(payload.authorityType)
      setValues((current) => ({ ...current, wallet: address, verification: 'owner-verified' }))
      setAttempted(false)
      setStep(1)
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Ownership proof failed.')
    } finally {
      setClaimBusy(false)
    }
  }

  const publishClaim = async () => {
    if (!address || !signer || !claimAuthorityType) {
      setClaimError('Reconnect the verified owner or deployer wallet and try again.')
      return
    }
    setClaimBusy(true)
    setClaimError(null)
    try {
      const metadata = claimMetadata()
      const issuedAt = new Date().toISOString()
      const message = buildProjectClaimMessage({
        chainId: Number(values.chain || queryChain || 56),
        contract: values.contract,
        claimant: address,
        metadata,
        issuedAt,
      })
      const signature = await signer.signMessage(message)
      const response = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          chainId: Number(values.chain || queryChain || 56),
          contract: values.contract,
          claimant: address,
          metadata,
          issuedAt,
          signature,
        }),
      })
      const payload = await response.json()
      if (!response.ok || !payload.ok) throw new Error(payload.reason || 'Project publication failed.')
      const published = payload.claim as PublicProjectClaim
      setClaimRecord(published)
      setClaimSubmitted(true)
      setValues((current) => ({
        ...current,
        handle: `@${published.slug}`,
        slug: published.slug,
        verification: 'published',
        submittedAt: published.publishedAt,
      }))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('melega:project-claim-published', {
            detail: { chainId: published.chainId, contract: published.contract, slug: published.slug },
          }),
        )
      }
      deleteListDraft({
        intent: 'claim-project',
        wallet: address,
        chainId: Number(values.chain || queryChain || 56),
        projectKey: values.contract,
      })
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Project publication failed.')
    } finally {
      setClaimBusy(false)
    }
  }

  const onContinue = () => {
    if (!listIntent) return
    if (listIntent === 'claim-project' && claimSubmitted) {
      void router.push(`/@${claimRecord?.slug || values.handle?.replace(/^@/, '')}/`)
      return
    }
    if (listIntent === 'create-token' && createTokenPhase === 'success') {
      clearListIntent()
      setCreateTokenPhase('form')
      setCreatedToken(null)
      return
    }
    const req = REQUIRED[listIntent].filter((f) => f.required)
    const missing = req.some((f) => !filled(values[f.key]))
    if (missing && (step === 0 || listIntent === 'claim-project')) {
      setAttempted(true)
      return
    }
    if (listIntent === 'claim-project') {
      if (step === 0) {
        void verifyClaimAuthority()
        return
      }
      void publishClaim()
      return
    }
    if (listIntent === 'import-token') {
      if (!liquidityConfirmed) return
      void router.replace(
        {
          pathname: '/list',
          query: {
            intent: 'claim-project',
            journey: 'listing',
            contract: values.contract,
            chain: values.chain,
            name: values.name || values.auto,
            symbol: values.auto,
            ...(values.logo ? { logo: values.logo } : {}),
            listed: '1',
            liquidity: 'confirmed',
          },
        },
        undefined,
        { shallow: true, scroll: false },
      )
      return
    }
    if (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE) {
      return
    }
    // Final Create Token action: canonical factory + verified receipt only.
    if (listIntent === 'create-token' && LIST_CREATE_TOKEN_AVAILABLE && createTokenFinalStep) {
      const stillMissing = req.some((f) => !filled(values[f.key]))
      if (stillMissing) {
        setAttempted(true)
        return
      }
      void publishCreateToken()
      return
    }
    setStep((s) => Math.min(TOTAL_DOTS - 1, s + 1))
  }

  const left = (() => {
    if (!listIntent) {
      return (
        <Idle data-testid="list-workspace-idle">
          Choose a path above. The workspace stays fixed — only this surface changes.
        </Idle>
      )
    }

    if (listIntent === 'import-token') {
      return (
        <FormStack data-testid="list-workspace-form">
          <ClaimIntro>
            <div>
              <strong>{values.name || values.auto || 'Deployed token'}</strong>
              <span>{values.auto ? `$${values.auto}` : 'Reading on-chain ticker…'} · Token detected</span>
            </div>
            <ListedPill>IMPORTED</ListedPill>
          </ClaimIntro>
          <Field label="Contract Address" ok={filled(values.contract)} invalid={invalid('contract')}>
            <Input value={values.contract || ''} readOnly aria-readonly="true" placeholder="0x…" autoComplete="off" />
          </Field>
          <Field label="Chain" ok={filled(values.chain)} invalid={invalid('chain')}>
            <Select value={values.chain || '56'} onChange={set('chain')}>
              <option value="56">BNB Smart Chain</option>
              <option value="8453">Base</option>
              <option value="1">Ethereum</option>
              <option value="137">Polygon</option>
            </Select>
          </Field>
          <Field
            label="Ticker · auto-detected"
            ok={filled(values.auto)}
            invalid={false}
            hint="Read directly from the detected token metadata."
          >
            <Input value={values.auto || ''} readOnly aria-readonly="true" placeholder="Detecting…" />
          </Field>
          <ListInlineLiquidityStep
            tokenAddress={values.contract || ''}
            chainId={Number(values.chain || 56)}
            onConfirmed={() => setLiquidityConfirmed(true)}
          />
        </FormStack>
      )
    }

    if (listIntent === 'create-token') {
      if (createTokenPhase === 'success' && createdToken) {
        return <CreateTokenPostCreationFunnel model={createdToken} />
      }
      const decimalsNum = Number.parseInt(values.decimals || '18', 10)
      const review = buildReviewFacts({
        name: values.name || '',
        symbol: values.ticker || '',
        supplyHuman: values.supply || '',
        decimals: Number.isFinite(decimalsNum) ? decimalsNum : 18,
        owner: values.owner || '',
      })
      return (
        <FormStack
          data-testid="list-workspace-form"
          data-create-token-status={CREATE_TOKEN_READINESS.status}
          data-create-token-ui-state={CREATE_TOKEN_READINESS.uiState}
          data-create-token-phase="form"
        >
          {LIST_CREATE_TOKEN_AVAILABLE ? (
            <Banner
              data-testid="list-create-token-ready"
              data-lifecycle="DEPLOYED_VALIDATED_BOUND_READY"
              data-blocker={CREATE_TOKEN_READINESS.blockerCode ?? 'none'}
            >
              Create Token — connect your wallet, set name, symbol and supply, then confirm. Creation fee: 0.10 BNB.
              Network: BNB Smart Chain.
            </Banner>
          ) : (
            <Banner data-testid="list-create-token-blocker" data-blocker={CREATE_TOKEN_READINESS.blockerCode}>
              Create Token is temporarily unavailable. Creation fee: 0.10 BNB. Network: BNB Smart Chain.
            </Banner>
          )}
          {createTokenError ? <Banner data-testid="list-create-token-error">{createTokenError}</Banner> : null}
          <Field label="Token Name" ok={filled(values.name)} invalid={invalid('name')}>
            <Input value={values.name || ''} onChange={set('name')} placeholder="e.g. Sample Token" />
          </Field>
          <Field label="Token Symbol" ok={filled(values.ticker)} invalid={invalid('ticker')}>
            <Input value={values.ticker || ''} onChange={set('ticker')} placeholder="e.g. SMPL" />
          </Field>
          <Field label="Total Supply" ok={filled(values.supply)} invalid={invalid('supply')}>
            <Input value={values.supply || ''} onChange={set('supply')} placeholder="Fixed total supply" />
          </Field>
          <Field label="Decimals" ok={filled(values.decimals)} invalid={invalid('decimals')} hint="Default 18">
            <Input value={values.decimals || '18'} onChange={set('decimals')} />
          </Field>
          <Field
            label="Owner Wallet"
            ok={filled(values.owner)}
            invalid={invalid('owner')}
            hint="Defaults to your connected wallet when available"
          >
            <Input value={values.owner || ''} onChange={set('owner')} placeholder="0x… receives full fixed supply" />
          </Field>
          <Field
            label="Logo (optional)"
            ok={filled(values.logo)}
            invalid={false}
            optional
            hint="Does not affect on-chain deployment"
          >
            <Input value={values.logo || ''} onChange={set('logo')} placeholder="Optional URL — metadata only" />
          </Field>
          <Field label="Project description (optional)" ok={filled(values.description)} invalid={false} optional>
            <TextArea
              value={values.description || ''}
              onChange={set('description')}
              placeholder="Optional — off-chain metadata"
            />
          </Field>
          <Field label="Website (optional)" ok={filled(values.website)} invalid={false} optional>
            <Input value={values.website || ''} onChange={set('website')} placeholder="https://" />
          </Field>
          <Field label="Social links (optional)" ok={filled(values.social)} invalid={false} optional>
            <Input value={values.social || ''} onChange={set('social')} placeholder="X / Telegram / Discord" />
          </Field>
          <Banner data-testid="list-create-token-review" data-review="factual">
            Review — Name: {review.tokenName || '—'}. Symbol: {review.symbol || '—'}. Supply:{' '}
            {review.totalSupply || '—'}. Decimals: {review.decimals}. Owner: {review.owner || '—'}. Creation fee: 0.10
            BNB. Network: BNB Smart Chain.
          </Banner>
          {LIST_CREATE_TOKEN_AVAILABLE ? (
            <Banner data-testid="list-create-token-cta-ready">
              Create Token — confirm in your wallet to deploy. Creation fee: 0.10 BNB on BNB Smart Chain. Drafts are
              autosaved until you confirm.
            </Banner>
          ) : (
            <Banner data-testid="list-create-token-cta-blocked">
              Create Token — deployment is not available right now. Your draft remains saved. Creation fee: 0.10 BNB.
            </Banner>
          )}
        </FormStack>
      )
    }

    if (listIntent === 'claim-project') {
      if (claimSubmitted) {
        const publishedSlug = claimRecord?.slug || values.handle?.replace(/^@/, '') || values.slug || ''
        return (
          <FormStack data-testid="list-claim-published">
            <SuccessState>
              <div>
                <strong>Project page published.</strong>
                <p>
                  The owner/deployer proof is complete. Your page is live immediately at <b>@{publishedSlug}</b>; no
                  manual review is pending.
                </p>
              </div>
            </SuccessState>
            <Banner data-testid="list-claim-live-handle">
              Permanent Melega Project Page: <strong>/@{publishedSlug}</strong>
            </Banner>
            <ListFeaturedCheckout
              testId="list-claim-featured-home-promotion"
              sourceFlow="claim-project"
              projectId={`claim:${values.contract}`}
              projectSlug={publishedSlug}
              projectContract={values.contract || null}
              buyerWallet={values.wallet || address || null}
              identityReady
              onOrderId={(id) => setValues((current) => ({ ...current, featuredOrderId: id || '' }))}
              onDeclined={() => setValues((current) => ({ ...current, featuredOrderId: '' }))}
            />
            <ListTrendBoostCheckout
              testId="list-claim-trend-boost"
              projectId={`claim:${values.contract}`}
              projectSlug={publishedSlug}
              projectContract={values.contract || null}
              buyerWallet={values.wallet || address || null}
              identityReady
            />
            <Btn
              type="button"
              $primary
              data-testid="list-claim-open-visibility-checkout"
              onClick={() => setVisibilityCheckoutOpen(true)}
            >
              Choose visibility packages
            </Btn>
          </FormStack>
        )
      }

      if (step === 1) {
        return (
          <FormStack data-testid="list-claim-review">
            <ClaimIntro>
              <div>
                <strong>{values.name || values.symbol || 'Detected project'}</strong>
                <span>{values.symbol ? `$${values.symbol}` : 'Ticker pending'} · Owner/deployer verified</span>
              </div>
              {values.listed === '1' ? <ListedPill>LISTED ON MELEGA DEX</ListedPill> : null}
            </ClaimIntro>
            <ClaimReview>
              <ReviewItem>
                Project handle<strong>{values.handle || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Owner wallet<strong>{values.wallet || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Website<strong>{values.website || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Logo<strong>{values.logo ? 'Ready' : 'Not provided'}</strong>
              </ReviewItem>
              <ReviewItem>
                X<strong>{values.x || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Telegram<strong>{values.telegram || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Discord<strong>{values.discord || '—'}</strong>
              </ReviewItem>
              <ReviewItem>
                Contract<strong>{values.contract || '—'}</strong>
              </ReviewItem>
            </ClaimReview>
            <ReviewItem>
              About<strong>{values.description || '—'}</strong>
            </ReviewItem>
            <Banner>
              Publishing is immediate after your wallet signature. There is no manual review: the signature proves
              control of the contract owner or original deployer wallet.
            </Banner>
            {claimError ? <Banner role="alert">{claimError}</Banner> : null}
          </FormStack>
        )
      }

      return (
        <FormStack data-testid="list-workspace-form" data-claim-flow="one-page-identity">
          <ClaimIntro>
            <div>
              <strong>{values.name || values.symbol || 'Token detected'}</strong>
              <span>
                {values.symbol ? `$${values.symbol}` : 'Ticker detected on-chain'} · Contract and network locked
              </span>
            </div>
            {values.listed === '1' ? <ListedPill>LISTED ON MELEGA DEX</ListedPill> : null}
          </ClaimIntro>

          <ClaimGrid>
            <Field label="Project name" ok={filled(values.name)} invalid={invalid('name')}>
              <Input value={values.name || ''} onChange={set('name')} placeholder="Project display name" />
            </Field>
            <Field label="Ticker · auto-detected" ok={filled(values.symbol)} invalid={false}>
              <Input value={values.symbol || ''} readOnly aria-readonly="true" placeholder="Detecting ticker…" />
            </Field>
            <ClaimWide>
              <Field
                label="Your permanent Melega Project Page"
                ok={filled(values.handle)}
                invalid={invalid('handle')}
                hint={`Public URL: melega.finance/@${(values.handle || 'your-project').replace(/^@/, '')}`}
              >
                <Input value={values.handle || ''} onChange={set('handle')} placeholder="@project" />
              </Field>
            </ClaimWide>
            <Field label="Connected owner/deployer wallet" ok={filled(values.wallet)} invalid={invalid('wallet')}>
              <Input
                value={values.wallet || ''}
                readOnly
                aria-readonly="true"
                placeholder="Connect the owner or deployer wallet"
              />
            </Field>
            <ClaimWide>
              <Field
                label="Logo"
                ok={filled(values.logo)}
                invalid={false}
                optional
                hint="Detected logo can be replaced."
              >
                <LogoIdentity>
                  <LogoPreview $src={values.logo || undefined}>
                    {values.logo ? '' : (values.symbol || 'M').slice(0, 2)}
                  </LogoPreview>
                  <Input value={values.logo || ''} onChange={set('logo')} placeholder="https://… logo URL" />
                </LogoIdentity>
              </Field>
            </ClaimWide>
            <ClaimWide>
              <Field label="About the project" ok={filled(values.description)} invalid={invalid('description')}>
                <TextArea
                  value={values.description || ''}
                  onChange={set('description')}
                  placeholder="A concise description displayed on the Project Page"
                />
              </Field>
            </ClaimWide>
            <Field label="Website" ok={filled(values.website)} invalid={false} optional>
              <Input value={values.website || ''} onChange={set('website')} placeholder="https://" />
            </Field>
            <Field label="X" ok={filled(values.x)} invalid={false} optional>
              <Input value={values.x || ''} onChange={set('x')} placeholder="https://x.com/…" />
            </Field>
            <Field label="Telegram" ok={filled(values.telegram)} invalid={false} optional>
              <Input value={values.telegram || ''} onChange={set('telegram')} placeholder="https://t.me/…" />
            </Field>
            <Field label="Discord" ok={filled(values.discord)} invalid={false} optional>
              <Input value={values.discord || ''} onChange={set('discord')} placeholder="https://discord.gg/…" />
            </Field>
          </ClaimGrid>
          <Banner>
            {isConnected
              ? 'Next: Melega checks this wallet against the contract owner/original deployer, then asks for one signature.'
              : 'Connect the contract owner or original deployer wallet. Claims fail closed without verifiable authority.'}
          </Banner>
          {claimError ? <Banner role="alert">{claimError}</Banner> : null}
        </FormStack>
      )
    }

    if (listIntent === 'create-project' || listIntent === 'ai-assistant') {
      return (
        <FormStack data-testid="list-workspace-form">
          <Field label="Project Name" ok={filled(values.name)} invalid={invalid('name')}>
            <Input value={values.name || ''} onChange={set('name')} />
          </Field>
          <Field label="Category" ok={filled(values.category)} invalid={invalid('category')}>
            <Select value={values.category || 'defi'} onChange={set('category')}>
              <option value="defi">DeFi</option>
              <option value="wallet">Wallet</option>
              <option value="gamefi">GameFi</option>
              <option value="infra">Infrastructure</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field
            label="Wallet"
            ok={filled(values.wallet)}
            invalid={false}
            optional
            hint="Required only if purchasing Featured placement."
          >
            <Input value={values.wallet || ''} onChange={set('wallet')} placeholder="0x… buyer wallet" />
          </Field>
          <Field label="Website" ok={filled(values.website)} invalid={false} optional>
            <Input value={values.website || ''} onChange={set('website')} placeholder="https://" />
          </Field>
          <Field label="Social" ok={filled(values.social)} invalid={false} optional>
            <Input value={values.social || ''} onChange={set('social')} placeholder="X / Telegram / Discord" />
          </Field>
          <Field
            label="Description"
            ok={filled(values.description)}
            invalid={invalid('description')}
            hint={!filled(values.description) ? 'AI can propose a draft — never auto-applied.' : undefined}
          >
            <TextArea
              value={values.description || ''}
              onChange={set('description')}
              placeholder="Describe the project"
            />
            {!filled(values.description) ? (
              <Chip type="button" onClick={generateDescription} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                Generate Description
              </Chip>
            ) : null}
            {pendingDescription ? (
              <Banner>Preview ready in AI Copilot — Apply or Discard. Your field is unchanged until you Apply.</Banner>
            ) : null}
          </Field>
          <Field label="Logo" ok={filled(values.logo)} invalid={false} optional>
            <Input value={values.logo || ''} onChange={set('logo')} placeholder="https://… or pending preview" />
          </Field>
          <Field label="Token" ok={filled(values.token)} invalid={false} optional hint="optional — never mandatory">
            <Input value={values.token || ''} onChange={set('token')} placeholder="Token contract if you have one" />
          </Field>
          {listIntent === 'create-project' ? (
            <>
              <ListFeaturedCheckout
                testId="list-create-featured-home-promotion"
                sourceFlow="create-project"
                projectId={filled(values.name) ? `create:${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}
                projectSlug={
                  filled(values.name)
                    ? values.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    : null
                }
                projectContract={values.token || null}
                buyerWallet={values.wallet || null}
                identityReady={filled(values.name) && filled(values.category) && filled(values.description)}
                onOrderId={(id) => setValues((v) => ({ ...v, featuredOrderId: id || '', featuredHome: id ? '1' : '' }))}
                onDeclined={() => setValues((v) => ({ ...v, featuredHome: '', featuredOrderId: '' }))}
              />
              <ListTrendBoostCheckout
                testId="list-create-trend-boost"
                projectId={filled(values.name) ? `create:${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''}
                projectSlug={
                  filled(values.name)
                    ? values.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    : null
                }
                projectContract={values.token || null}
                buyerWallet={values.wallet || null}
                identityReady={filled(values.name) && filled(values.category) && filled(values.description)}
              />
            </>
          ) : null}
        </FormStack>
      )
    }

    return null
  })()

  const right = (() => {
    if (!listIntent) {
      return <ContextEmpty label="Select a flow to open contextual guidance." />
    }

    const ring = (
      <CompleteWrap data-testid="list-workspace-completeness">
        <RingBox>
          <Ring $pct={pct} aria-hidden />
          <RingLabel>{pct}%</RingLabel>
        </RingBox>
        <CompleteMeta>
          <strong>Completion</strong>
          <span>From required fields only — never estimated.</span>
        </CompleteMeta>
      </CompleteWrap>
    )

    if (listIntent === 'import-token') {
      const hasAny = filled(values.contract) || filled(values.auto)
      const listingPct = liquidityConfirmed ? 50 : 25
      return (
        <>
          <CompactCompletion data-testid="list-workspace-completeness">
            <CompletionLine>
              Listing progress <strong>{listingPct}%</strong>
            </CompletionLine>
            <CompletionRail $pct={listingPct} />
          </CompactCompletion>
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>{values.name || values.auto || 'Detected token'}</ContextTitle>
              <ContextRow>
                Ticker <strong>{values.auto || 'Detecting…'}</strong>
              </ContextRow>
              <ContextRow>
                Network <strong>{values.chain === '56' ? 'BNB Chain' : values.chain || '—'}</strong>
              </ContextRow>
              <ContextRow>
                Contract{' '}
                <strong>{values.contract ? `${values.contract.slice(0, 8)}…${values.contract.slice(-6)}` : '—'}</strong>
              </ContextRow>
              <ContextRow>
                Token <strong>Imported</strong>
              </ContextRow>
              <ContextRow>
                Liquidity <strong>{liquidityConfirmed ? 'Confirmed' : 'In progress'}</strong>
              </ContextRow>
              <ContextRow>
                Project page <strong>Next</strong>
              </ContextRow>
              <ContextRow>
                Visibility <strong>After publishing</strong>
              </ContextRow>
            </ContextCard>
          ) : (
            <ContextEmpty label="Enter a contract to populate detection context." />
          )}
        </>
      )
    }

    if (listIntent === 'create-token') {
      if (createTokenPhase === 'success' && createdToken) {
        return (
          <>
            {ring}
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>Next steps</ContextTitle>
              <ContextRow>
                Token <strong>{createdToken.symbol}</strong>
              </ContextRow>
              <ContextRow>
                Contract <strong>{createdToken.contractStatus}</strong>
              </ContextRow>
              <ContextRow>
                Liquidity <strong>AVAILABLE</strong>
              </ContextRow>
              <ContextRow>
                Project page <strong>PENDING</strong>
              </ContextRow>
              <ContextRow>
                Promotion tools <strong>LOCKED</strong>
              </ContextRow>
            </ContextCard>
          </>
        )
      }
      const hasAny = filled(values.name) || filled(values.ticker) || filled(values.supply)
      return (
        <>
          {ring}
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>Live Summary</ContextTitle>
              <ContextRow>
                Supply <strong>{values.supply || '—'}</strong>
              </ContextRow>
              <ContextRow>
                Decimals <strong>{values.decimals || '18'}</strong>
              </ContextRow>
              <ContextRow>
                Network <strong>BNB Smart Chain</strong>
              </ContextRow>
              <ContextRow>
                Creation fee <strong>0.10 BNB</strong>
              </ContextRow>
              <ContextRow>
                Status <strong>{LIST_CREATE_TOKEN_AVAILABLE ? 'Ready' : 'Unavailable'}</strong>
              </ContextRow>
            </ContextCard>
          ) : (
            <ContextEmpty label="Add token basics to see a live summary." />
          )}
        </>
      )
    }

    if (listIntent === 'claim-project') {
      const hasAny = filled(values.contract) || filled(values.wallet)
      return (
        <>
          <CompactCompletion data-testid="list-workspace-completeness">
            <CompletionLine>
              Identity completion <strong>{pct}%</strong>
            </CompletionLine>
            <CompletionRail $pct={pct} />
          </CompactCompletion>
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <LogoIdentity style={{ alignItems: 'center', marginBottom: 12 }}>
                <LogoPreview $src={values.logo || undefined}>
                  {values.logo ? '' : (values.symbol || 'M').slice(0, 2)}
                </LogoPreview>
                <div>
                  <ContextTitle style={{ margin: 0 }}>
                    {values.name || values.symbol || 'Detected project'}
                  </ContextTitle>
                  <Hint>{values.handle || 'Handle required'}</Hint>
                </div>
              </LogoIdentity>
              <ContextRow>
                DEX status <strong>{values.listed === '1' ? 'Already listed' : 'Detected'}</strong>
              </ContextRow>
              <ContextRow>
                Ticker <strong>{values.symbol || 'Detecting…'}</strong>
              </ContextRow>
              <ContextRow>
                Contract{' '}
                <strong>{values.contract ? `${values.contract.slice(0, 8)}…${values.contract.slice(-6)}` : '—'}</strong>
              </ContextRow>
              <ContextRow>
                Ownership{' '}
                <strong>
                  {claimSubmitted
                    ? 'Published'
                    : claimAuthorityType
                    ? `${claimAuthorityType} verified`
                    : isConnected
                    ? 'Ready to verify'
                    : 'Owner/deployer wallet required'}
                </strong>
              </ContextRow>
              <ContextRow>
                Next action{' '}
                <strong>
                  {claimSubmitted ? 'Boost visibility' : step === 0 ? 'Prove ownership' : 'Sign & publish'}
                </strong>
              </ContextRow>
            </ContextCard>
          ) : (
            <ContextEmpty label="The detected project summary will appear here." />
          )}
        </>
      )
    }

    if (usesCopilot && listIntent) {
      return (
        <ListAiCopilot
          intent={listIntent}
          values={values}
          completionPct={pct}
          onApply={applySuggestion}
          onReject={() => undefined}
          onGenerateDescription={generateDescription}
          pendingDescription={pendingDescription}
          onApplyDescription={() => {
            if (pendingDescription) {
              setValues((v) => ({ ...v, description: pendingDescription }))
              setPendingDescription(null)
            }
          }}
          onDiscardDescription={() => setPendingDescription(null)}
        />
      )
    }

    return <ContextEmpty label="Select a flow to open contextual guidance." />
  })()

  return (
    <>
    <Shell
      data-testid="list-workspace"
      data-list-module="007"
      data-list-intent={listIntent || ''}
      data-pixel-workspace="1376x920"
      aria-labelledby="list-workspace-title"
    >
      <Header data-testid="list-workspace-header" data-pixel-workspace-header="64">
        <FlowBrand>
          <img src={MELEGA_LOGO_URI} alt="" aria-hidden />
          <FlowTitle id="list-workspace-title">
            {listingJourney ? 'List Your Token' : listIntent ? FLOW_TITLE[listIntent] : 'List Workspace'}
          </FlowTitle>
        </FlowBrand>
        {listingJourney ? (
          <JourneyProgress data-testid="list-workspace-progress" aria-label={`Listing step ${journeyStage + 1} of 4`}>
            {['Token', 'Liquidity', 'Project page', 'Visibility'].map((label, index) => {
              const state = index < journeyStage ? 'done' : index === journeyStage ? 'current' : 'future'
              return (
                <JourneyStage key={label} $state={state} data-state={state}>
                  {index + 1} · {label}
                </JourneyStage>
              )
            })}
          </JourneyProgress>
        ) : listIntent === 'claim-project' ? (
          <SingleStep data-testid="list-workspace-progress">
            {claimSubmitted ? 'Project page live' : step === 0 ? '1 · Identity & ownership' : '2 · Sign & publish'}
          </SingleStep>
        ) : listIntent === 'import-token' ? (
          <SingleStep data-testid="list-workspace-progress">Token setup · one step</SingleStep>
        ) : listIntent === 'create-token' ? (
          <SingleStep data-testid="list-workspace-progress">Configure · review · create</SingleStep>
        ) : (
          <ProgressTrack data-testid="list-workspace-progress" aria-label={`Step ${step + 1} of ${flowStepCount}`}>
            {Array.from({ length: flowStepCount }, (_, i) => {
              const state = i < step ? 'done' : i === step ? 'current' : 'future'
              return <Dot key={i} $state={state as 'current' | 'done' | 'future'} data-state={state} />
            })}
          </ProgressTrack>
        )}
        <HeaderRight>
          <StatusPill data-testid="list-workspace-status">{status}</StatusPill>
          <AutosaveLine data-testid="list-workspace-autosave">
            {savedLabel ? (
              <>
                Autosaved
                <span>↓ {savedLabel}</span>
              </>
            ) : (
              'Draft'
            )}
          </AutosaveLine>
        </HeaderRight>
      </Header>

      <Body data-testid="list-workspace-body" data-pixel-workspace-body="760">
        <LeftPane data-testid="list-workspace-left">{left}</LeftPane>
        <RightPane data-testid="list-workspace-right" data-pixel-workspace-context="340x760">
          {right}
        </RightPane>
      </Body>

      <Footer data-testid="list-workspace-footer" data-pixel-workspace-footer="72">
        <FooterLeft>
          {listIntent === 'claim-project' && step === 1 && !claimSubmitted ? (
            <Btn
              type="button"
              onClick={() => {
                setAttempted(false)
                setStep(0)
              }}
            >
              Back
            </Btn>
          ) : listIntent ? (
            <Btn
              type="button"
              onClick={() => {
                if (listIntent) {
                  deleteListDraft({
                    intent: listIntent,
                    wallet: values.wallet || values.owner || null,
                    chainId: 56,
                    projectKey: values.contract || values.name || null,
                  })
                }
                clearListIntent()
              }}
            >
              {claimSubmitted ? 'Stay here' : 'Cancel'}
            </Btn>
          ) : null}
        </FooterLeft>
        <div aria-hidden />
        <FooterRight>
          {listIntent === 'create-token' && !isConnected ? (
            <ConnectWalletButton scale="md" data-testid="list-create-token-connect-wallet">
              Connect wallet
            </ConnectWalletButton>
          ) : listIntent ? (
            <Btn
              type="button"
              $primary
              disabled={
                claimBusy ||
                createTokenBusy ||
                !canPublishish ||
                (listIntent === 'import-token' && !liquidityConfirmed) ||
                (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE && primaryLabel === 'Publish')
              }
              onClick={onContinue}
            >
              {claimBusy ? 'Checking…' : primaryLabel}
            </Btn>
          ) : null}
        </FooterRight>
      </Footer>
    </Shell>
    {claimSubmitted && claimRecord ? (
      <CommercialCheckoutModal
        open={visibilityCheckoutOpen}
        onClose={() => setVisibilityCheckoutOpen(false)}
        projectId={`claim:${claimRecord.contract}`}
        projectSlug={claimRecord.slug}
        projectContract={claimRecord.contract}
        chainId={claimRecord.chainId}
        identityReady
        visibilityOnly
      />
    ) : null}
    </>
  )
}

export default ListWorkspace
