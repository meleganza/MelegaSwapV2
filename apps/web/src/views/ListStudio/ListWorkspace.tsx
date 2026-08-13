/**
 * LIST_MODULE_006/007 — Premium workspace shell + AI Copilot panel.
 * Outer shell 1376×920 / 64·760·72 locked. MODULE_007 adds product-copilot assist.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import styled, { css, keyframes } from 'styled-components'
import { LIST_CREATE_TOKEN_AVAILABLE, listOne, type ListIntent } from './listTokens'
import { useListIntent } from './useListIntent'
import { ListAiCopilot, type CopilotSuggestion } from './ListAiCopilot'
import { ListFeaturedCheckout } from './ListFeaturedCheckout'
import { ListTrendBoostCheckout } from './ListTrendBoostCheckout'
import { deleteListDraft, loadListDraft, saveListDraft } from './listDraftPersistence'
import { CREATE_TOKEN_READINESS } from './createTokenReadiness'
import { buildReviewFacts } from './createToken/createTokenTx'
import { CreateTokenPostCreationFunnel } from './createToken/CreateTokenPostCreationFunnel'
import {
  buildCreateTokenSuccessModel,
  type CreateTokenSuccessModel,
} from './createToken/createTokenPostCreationTypes'

type StatusKind = 'Autosaved' | 'Draft' | 'Ready' | 'Review Required'
type FieldDef = { key: string; label: string; required: boolean }

const FLOW_TITLE: Record<ListIntent, string> = {
  'import-token': 'Import Token',
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

const ProgressTrack = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${listOne.workspaceProgressGap};
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
  background: conic-gradient(
    rgba(221, 185, 47, 0.75) ${({ $pct }) => $pct * 3.6}deg,
    rgba(255, 255, 255, 0.08) 0deg
  );
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
  const { listIntent, clearListIntent } = useListIntent()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [pendingDescription, setPendingDescription] = useState<string | null>(null)
  const [createTokenPhase, setCreateTokenPhase] = useState<'form' | 'success'>('form')
  const [createdToken, setCreatedToken] = useState<CreateTokenSuccessModel | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const querySlug =
    typeof router.query.slug === 'string' && router.query.slug.trim()
      ? router.query.slug.trim().toLowerCase()
      : null

  useEffect(() => {
    setStep(0)
    setAttempted(false)
    setSavedAt(null)
    setPendingDescription(null)
    setCreateTokenPhase('form')
    setCreatedToken(null)
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
      setValues({
        ...restored.values,
        ...(listIntent === 'import-token' && typeof router.query.contract === 'string'
          ? { contract: router.query.contract, chain: 'bsc' }
          : {}),
        ...(listIntent === 'claim-project' && querySlug && !restored.values.slug
          ? { slug: querySlug }
          : {}),
      })
      setSavedAt(Date.parse(restored.updatedAt) || Date.now())
      return
    }
    if (listIntent === 'import-token')
      setValues({
        chain: 'bsc',
        ...(typeof router.query.contract === 'string' ? { contract: router.query.contract } : {}),
      })
    else if (listIntent === 'create-token') setValues({ decimals: '18' })
    else if (listIntent === 'create-project' || listIntent === 'ai-assistant') setValues({ category: 'defi' })
    else if (listIntent === 'claim-project')
      setValues({ verification: 'pending', ...(querySlug ? { slug: querySlug } : {}) })
    else setValues({})
  }, [listIntent, querySlug, router.query.contract])

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

  // Deep-link / handoff into post-create success (never invent address).
  useEffect(() => {
    if (listIntent !== 'create-token' || !router.isReady) return
    const createdFlag = router.query.created === '1' || router.query.phase === 'success'
    const qToken =
      (typeof router.query.token === 'string' && router.query.token) ||
      (typeof router.query.address === 'string' && router.query.address) ||
      values.tokenAddress ||
      values.contract ||
      null
    if (!createdFlag && values.postCreate !== '1') return
    const model = buildCreateTokenSuccessModel({
      name: (typeof router.query.name === 'string' && router.query.name) || values.name,
      symbol: (typeof router.query.symbol === 'string' && router.query.symbol) || values.ticker,
      logoUrl: values.logo || null,
      contractAddress: qToken,
      chainId: 56,
    })
    setCreatedToken(model)
    setCreateTokenPhase('success')
  }, [listIntent, router.isReady, router.query, values.name, values.ticker, values.logo, values.tokenAddress, values.contract, values.postCreate])

  const pct = completionPct(listIntent, values)
  const status: StatusKind = useMemo(() => {
    if (!listIntent) return 'Draft'
    if (listIntent === 'create-token' && createTokenPhase === 'success') return 'Ready'
    if (pct >= 100 && step >= 3) return 'Review Required'
    if (pct >= 100) return 'Ready'
    if (savedAt) return 'Autosaved'
    return 'Draft'
  }, [listIntent, pct, savedAt, step, createTokenPhase])

  const savedLabel = relativeSaved(savedAt, now)
  const createTokenSuccess = listIntent === 'create-token' && createTokenPhase === 'success' && createdToken
  const primaryLabel = createTokenSuccess
    ? 'Done'
    : step >= TOTAL_DOTS - 1 || (listIntent === 'ai-assistant' && step >= 0 && pct >= 75)
      ? 'Publish'
      : 'Continue'
  const canPublishish = listIntent !== 'create-token' || LIST_CREATE_TOKEN_AVAILABLE || primaryLabel === 'Continue' || primaryLabel === 'Done'
  const usesCopilot = listIntent === 'create-project' || listIntent === 'ai-assistant'

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const invalid = (key: string, required = true) =>
    attempted && required && !filled(values[key])

  const applySuggestion = (s: CopilotSuggestion) => {
    if (s.kind === 'category') setValues((v) => ({ ...v, category: 'wallet' }))
    if (s.kind === 'tags') setValues((v) => ({ ...v, aiNote: s.preview }))
    if (s.kind === 'website') {
      const url = `https://${(values.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '')}.io`
      setValues((v) => ({ ...v, website: url }))
    }
    if (s.kind === 'social') {
      const handle = `@${(values.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14)}`
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

  const enterCreateTokenSuccess = () => {
    const model = buildCreateTokenSuccessModel({
      name: values.name,
      symbol: values.ticker,
      logoUrl: values.logo || null,
      contractAddress: values.tokenAddress || values.contract || null,
      chainId: 56,
    })
    setCreatedToken(model)
    setCreateTokenPhase('success')
    setValues((v) => ({ ...v, postCreate: '1' }))
  }

  const onContinue = () => {
    if (!listIntent) return
    if (listIntent === 'create-token' && createTokenPhase === 'success') {
      clearListIntent()
      setCreateTokenPhase('form')
      setCreatedToken(null)
      return
    }
    const req = REQUIRED[listIntent].filter((f) => f.required)
    const missing = req.some((f) => !filled(values[f.key]))
    if (missing && step === 0) {
      setAttempted(true)
      return
    }
    if (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE && step >= TOTAL_DOTS - 2) {
      return
    }
    // Final Publish on Create Token → post-creation funnel (no Featured / Trend Boost).
    if (
      listIntent === 'create-token' &&
      LIST_CREATE_TOKEN_AVAILABLE &&
      (step >= TOTAL_DOTS - 1 || primaryLabel === 'Publish')
    ) {
      const stillMissing = req.some((f) => !filled(values[f.key]))
      if (stillMissing) {
        setAttempted(true)
        return
      }
      enterCreateTokenSuccess()
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
          <Field label="Contract Address" ok={filled(values.contract)} invalid={invalid('contract')}>
            <Input value={values.contract || ''} onChange={set('contract')} placeholder="0x…" autoComplete="off" />
          </Field>
          <Field label="Chain" ok={filled(values.chain)} invalid={invalid('chain')}>
            <Select value={values.chain || 'bsc'} onChange={set('chain')}>
              <option value="bsc">BNB Smart Chain</option>
              <option value="eth">Ethereum</option>
              <option value="polygon">Polygon</option>
            </Select>
          </Field>
          <Field
            label="Auto Detection"
            ok={filled(values.auto)}
            invalid={false}
            optional
            hint="Assists setup only. Does not prove ownership."
          >
            <Input value={values.auto || ''} onChange={set('auto')} placeholder="Symbol / decimals when available" />
          </Field>
          <Field label="Project Preview notes" ok={filled(values.preview)} invalid={false} optional>
            <TextArea value={values.preview || ''} onChange={set('preview')} placeholder="Optional local notes" />
          </Field>
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
          <Field label="Owner Wallet" ok={filled(values.owner)} invalid={invalid('owner')} hint="Defaults to your connected wallet when available">
            <Input value={values.owner || ''} onChange={set('owner')} placeholder="0x… receives full fixed supply" />
          </Field>
          <Field label="Logo (optional)" ok={filled(values.logo)} invalid={false} optional hint="Does not affect on-chain deployment">
            <Input value={values.logo || ''} onChange={set('logo')} placeholder="Optional URL — metadata only" />
          </Field>
          <Field label="Project description (optional)" ok={filled(values.description)} invalid={false} optional>
            <TextArea value={values.description || ''} onChange={set('description')} placeholder="Optional — off-chain metadata" />
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
      const claimSlug = values.slug || querySlug
      const claimProjectId = filled(values.contract)
        ? `claim:${values.contract.toLowerCase()}`
        : claimSlug
          ? `claim:${claimSlug}`
          : ''
      return (
        <FormStack data-testid="list-workspace-form">
          <Field label="Contract" ok={filled(values.contract)} invalid={invalid('contract')}>
            <Input value={values.contract || ''} onChange={set('contract')} placeholder="0x…" />
          </Field>
          <Field label="Wallet" ok={filled(values.wallet)} invalid={invalid('wallet')}>
            <Input value={values.wallet || ''} onChange={set('wallet')} placeholder="Claiming wallet" />
          </Field>
          <Field
            label="Verification"
            ok={filled(values.verification)}
            invalid={false}
            hint="Workflow state only — not completed verification."
          >
            <Select value={values.verification || 'pending'} onChange={set('verification')}>
              <option value="pending">Pending evidence</option>
              <option value="signature">Signature challenge</option>
              <option value="manual">Manual review</option>
            </Select>
          </Field>
          <Field label="Project Preview notes" ok={filled(values.preview)} invalid={false} optional>
            <TextArea value={values.preview || ''} onChange={set('preview')} placeholder="Local claim notes" />
          </Field>
          <div id="featured" data-testid="list-claim-featured-anchor">
            <ListFeaturedCheckout
              testId="list-claim-featured-home-promotion"
              sourceFlow="claim-project"
              projectId={claimProjectId}
              projectContract={values.contract || null}
              projectSlug={claimSlug}
              buyerWallet={values.wallet || null}
              identityReady={
                (filled(values.contract) || Boolean(claimSlug)) && filled(values.wallet)
              }
              onOrderId={(id) =>
                setValues((v) => ({ ...v, featuredOrderId: id || '', featuredHome: id ? '1' : '' }))
              }
              onDeclined={() => setValues((v) => ({ ...v, featuredHome: '', featuredOrderId: '' }))}
            />
          </div>
          <div id="trend-boost" data-testid="list-claim-trend-boost-anchor">
            <ListTrendBoostCheckout
              testId="list-claim-trend-boost"
              projectId={claimProjectId}
              projectContract={values.contract || null}
              projectSlug={claimSlug}
              buyerWallet={values.wallet || null}
              identityReady={
                (filled(values.contract) || Boolean(claimSlug)) && filled(values.wallet)
              }
            />
          </div>
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
              <Banner>
                Preview ready in AI Copilot — Apply or Discard. Your field is unchanged until you Apply.
              </Banner>
            ) : null}
          </Field>
          <Field label="Logo" ok={filled(values.logo)} invalid={false} optional>
            <Input value={values.logo || ''} onChange={set('logo')} placeholder="https://… or pending preview" />
          </Field>
          <Field
            label="Token"
            ok={filled(values.token)}
            invalid={false}
            optional
            hint="optional — never mandatory"
          >
            <Input value={values.token || ''} onChange={set('token')} placeholder="Token contract if you have one" />
          </Field>
          {listIntent === 'create-project' ? (
            <>
              <ListFeaturedCheckout
                testId="list-create-featured-home-promotion"
                sourceFlow="create-project"
                projectId={
                  filled(values.name)
                    ? `create:${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    : ''
                }
                projectSlug={
                  filled(values.name)
                    ? values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
                projectId={
                  filled(values.name)
                    ? `create:${values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
                    : ''
                }
                projectSlug={
                  filled(values.name)
                    ? values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
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
      return (
        <>
          {ring}
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>Detected Token</ContextTitle>
              <ContextRow>
                Network <strong>{values.chain || '—'}</strong>
              </ContextRow>
              <ContextRow>
                Contract <strong>{values.contract || '—'}</strong>
              </ContextRow>
              <ContextRow>
                Verification <strong>Not verified</strong>
              </ContextRow>
              <ContextRow>
                Current Status <strong>{filled(values.contract) ? 'Awaiting review' : 'Incomplete'}</strong>
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
          {ring}
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>Detected Project</ContextTitle>
              <ContextRow>
                Detected Website <strong>—</strong>
              </ContextRow>
              <ContextRow>
                Detected Social <strong>—</strong>
              </ContextRow>
              <ContextRow>
                Verification State <strong>{values.verification || 'pending'}</strong>
              </ContextRow>
              <ContextRow>
                Ownership checklist <strong>{filled(values.wallet) ? 'Wallet noted' : 'Wallet missing'}</strong>
              </ContextRow>
            </ContextCard>
          ) : (
            <ContextEmpty label="Add contract and wallet to build claim context." />
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
    <Shell
      data-testid="list-workspace"
      data-list-module="007"
      data-list-intent={listIntent || ''}
      data-pixel-workspace="1376x920"
      aria-labelledby="list-workspace-title"
    >
      <Header data-testid="list-workspace-header" data-pixel-workspace-header="64">
        <FlowTitle id="list-workspace-title">{listIntent ? FLOW_TITLE[listIntent] : 'List Workspace'}</FlowTitle>
        <ProgressTrack data-testid="list-workspace-progress" aria-label={`Step ${step + 1} of ${TOTAL_DOTS}`}>
          {Array.from({ length: TOTAL_DOTS }, (_, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'future'
            return <Dot key={i} $state={state as 'current' | 'done' | 'future'} data-state={state} />
          })}
        </ProgressTrack>
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
          {listIntent ? (
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
              Cancel
            </Btn>
          ) : null}
        </FooterLeft>
        <div aria-hidden />
        <FooterRight>
          {listIntent ? (
            <Btn
              type="button"
              $primary
              disabled={
                !canPublishish ||
                (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE && primaryLabel === 'Publish')
              }
              onClick={onContinue}
            >
              {primaryLabel}
            </Btn>
          ) : null}
        </FooterRight>
      </Footer>
    </Shell>
  )
}

export default ListWorkspace
