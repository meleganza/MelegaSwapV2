/**
 * LIST_MODULE_006 — Premium unified List workspace (internals only).
 * Outer shell 1376×920 / 64·760·72 locked from MODULE_005.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { LIST_CREATE_TOKEN_AVAILABLE, listOne, type ListIntent } from './listTokens'
import { useListIntent } from './useListIntent'

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
  'ai-assistant': [{ key: 'prompt', label: 'Prompt', required: false }],
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
  height: ${listOne.workspaceH};
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
  height: ${listOne.workspaceBodyH};
  flex: 0 0 ${listOne.workspaceBodyH};
  min-height: 0;
  display: grid;
  /* 65/35 intent with locked 340px context column on desktop */
  grid-template-columns: minmax(0, 1fr) ${listOne.workspaceContextW};
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
  const { listIntent, clearListIntent } = useListIntent()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Draft and refine listing copy here. Outputs stay in this workspace.',
    },
  ])
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setStep(0)
    setAttempted(false)
    setSavedAt(null)
    setMessages([
      {
        role: 'assistant',
        text: 'Draft and refine listing copy here. Outputs stay in this workspace.',
      },
    ])
    if (listIntent === 'import-token') setValues({ chain: 'bsc' })
    else if (listIntent === 'create-token') setValues({ decimals: '18' })
    else if (listIntent === 'create-project') setValues({ category: 'defi' })
    else if (listIntent === 'claim-project') setValues({ verification: 'pending' })
    else setValues({})
  }, [listIntent])

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!listIntent) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (Object.keys(values).some((k) => filled(values[k]))) {
        setSavedAt(Date.now())
      }
    }, 2000)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [values, listIntent])

  const pct = completionPct(listIntent, values)
  const status: StatusKind = useMemo(() => {
    if (!listIntent) return 'Draft'
    if (pct >= 100 && step >= 3) return 'Review Required'
    if (pct >= 100) return 'Ready'
    if (savedAt) return 'Autosaved'
    return 'Draft'
  }, [listIntent, pct, savedAt, step])

  const savedLabel = relativeSaved(savedAt, now)
  const primaryLabel = step >= TOTAL_DOTS - 1 || (listIntent === 'ai-assistant' && step >= 0 && pct >= 75) ? 'Publish' : 'Continue'
  const canPublishish = listIntent !== 'create-token' || LIST_CREATE_TOKEN_AVAILABLE || primaryLabel === 'Continue'

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const invalid = (key: string, required = true) =>
    attempted && required && !filled(values[key])

  const onContinue = () => {
    if (!listIntent) return
    const req = REQUIRED[listIntent].filter((f) => f.required)
    const missing = req.some((f) => !filled(values[f.key]))
    if (missing && step === 0) {
      setAttempted(true)
      return
    }
    if (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE && step >= TOTAL_DOTS - 2) {
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
      return (
        <FormStack data-testid="list-workspace-form">
          {!LIST_CREATE_TOKEN_AVAILABLE ? (
            <Banner>Token creation is Coming Soon. Fields prepare a draft only — publishing is unavailable.</Banner>
          ) : null}
          <Field label="Token Name" ok={filled(values.name)} invalid={invalid('name')}>
            <Input value={values.name || ''} onChange={set('name')} disabled={!LIST_CREATE_TOKEN_AVAILABLE} />
          </Field>
          <Field label="Ticker" ok={filled(values.ticker)} invalid={invalid('ticker')}>
            <Input value={values.ticker || ''} onChange={set('ticker')} disabled={!LIST_CREATE_TOKEN_AVAILABLE} />
          </Field>
          <Field label="Supply" ok={filled(values.supply)} invalid={invalid('supply')}>
            <Input value={values.supply || ''} onChange={set('supply')} disabled={!LIST_CREATE_TOKEN_AVAILABLE} />
          </Field>
          <Field label="Decimals" ok={filled(values.decimals)} invalid={invalid('decimals')}>
            <Input value={values.decimals || '18'} onChange={set('decimals')} disabled={!LIST_CREATE_TOKEN_AVAILABLE} />
          </Field>
          <Field label="Logo" ok={filled(values.logo)} invalid={false} optional>
            <Input
              value={values.logo || ''}
              onChange={set('logo')}
              placeholder="https://… or upload later"
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </Field>
        </FormStack>
      )
    }

    if (listIntent === 'claim-project') {
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
        </FormStack>
      )
    }

    if (listIntent === 'create-project') {
      return (
        <FormStack data-testid="list-workspace-form">
          <Field label="Project Name" ok={filled(values.name)} invalid={invalid('name')}>
            <Input value={values.name || ''} onChange={set('name')} />
          </Field>
          <Field label="Category" ok={filled(values.category)} invalid={invalid('category')}>
            <Select value={values.category || 'defi'} onChange={set('category')}>
              <option value="defi">DeFi</option>
              <option value="gamefi">GameFi</option>
              <option value="infra">Infrastructure</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Website" ok={filled(values.website)} invalid={false} optional>
            <Input value={values.website || ''} onChange={set('website')} placeholder="https://" />
          </Field>
          <Field label="Social" ok={filled(values.social)} invalid={false} optional>
            <Input value={values.social || ''} onChange={set('social')} placeholder="X / Telegram / Discord" />
          </Field>
          <Field label="Description" ok={filled(values.description)} invalid={invalid('description')}>
            <TextArea value={values.description || ''} onChange={set('description')} placeholder="Describe the project" />
          </Field>
          <Field label="AI assist notes" ok={filled(values.aiNote)} invalid={false} optional>
            <Input value={values.aiNote || ''} onChange={set('aiNote')} placeholder="Local drafting notes" />
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
        </FormStack>
      )
    }

    return (
      <Chat data-testid="list-workspace-form">
        <Transcript data-testid="list-workspace-ai-transcript" aria-live="polite">
          {messages.map((m, i) => (
            <Bubble key={`${m.role}-${i}`} $user={m.role === 'user'}>
              {m.text}
            </Bubble>
          ))}
        </Transcript>
        <Field label="Prompt" ok={filled(values.prompt)} invalid={false} optional>
          <TextArea value={values.prompt || ''} onChange={set('prompt')} placeholder="Ask for a draft or improvement" />
        </Field>
        <Chips>
          <Chip
            type="button"
            onClick={() => {
              setMessages((prev) => [
                ...prev,
                { role: 'user', text: 'Generate Description' },
                { role: 'assistant', text: 'Generated a local draft. Nothing was published.' },
              ])
              setValues((v) => ({ ...v, summary: 'Local draft description ready for review.' }))
            }}
          >
            Generate Description
          </Chip>
          <Chip
            type="button"
            onClick={() => {
              setMessages((prev) => [
                ...prev,
                { role: 'user', text: 'Improve Description' },
                { role: 'assistant', text: 'Improved the local draft for clarity.' },
              ])
            }}
          >
            Improve Description
          </Chip>
          <Chip
            type="button"
            onClick={() => {
              setMessages((prev) => [
                ...prev,
                { role: 'user', text: 'Find Existing Information' },
                { role: 'assistant', text: 'Searched local notes only. Sources are not auto-verified.' },
              ])
            }}
          >
            Find Existing Information
          </Chip>
        </Chips>
      </Chat>
    )
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
                Estimated Contract <strong>Not deployed</strong>
              </ContextRow>
              <ContextRow>
                Warnings <strong>{LIST_CREATE_TOKEN_AVAILABLE ? 'None' : 'Factory unavailable'}</strong>
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

    if (listIntent === 'create-project') {
      const missing = REQUIRED['create-project'].filter((f) => f.required && !filled(values[f.key])).map((f) => f.label)
      const hasAny = filled(values.name) || filled(values.description) || filled(values.website)
      return (
        <>
          {ring}
          {hasAny ? (
            <ContextCard data-testid="list-workspace-context">
              <ContextTitle>Project intelligence</ContextTitle>
              <ContextRow>
                AI Suggestions <strong>{filled(values.aiNote) ? 'Notes captured' : 'None yet'}</strong>
              </ContextRow>
              <ContextRow>
                Category <strong>{values.category || 'defi'}</strong>
              </ContextRow>
              <ContextRow>
                Completeness <strong>{pct}%</strong>
              </ContextRow>
              <ContextRow>
                Missing Fields <strong>{missing.length ? missing.join(', ') : 'None'}</strong>
              </ContextRow>
              <ContextRow>
                Visibility Score <strong>{pct}%</strong>
              </ContextRow>
            </ContextCard>
          ) : (
            <ContextEmpty label="Start the project form to unlock suggestions." />
          )}
        </>
      )
    }

    return (
      <>
        {ring}
        <ContextCard data-testid="list-workspace-context">
          <ContextTitle>Conversation Memory</ContextTitle>
          <ContextRow>
            Messages <strong>{messages.length}</strong>
          </ContextRow>
          <ContextRow>
            Suggestions <strong>Generate · Improve · Find</strong>
          </ContextRow>
          <ContextRow>
            Generated Summary <strong>{values.summary || '—'}</strong>
          </ContextRow>
          <ContextRow>
            Confidence <strong>Local only</strong>
          </ContextRow>
          <ContextRow>
            Sources <strong>Workspace notes</strong>
          </ContextRow>
        </ContextCard>
      </>
    )
  })()

  return (
    <Shell
      data-testid="list-workspace"
      data-list-module="006"
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
            <Btn type="button" onClick={() => clearListIntent()}>
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
