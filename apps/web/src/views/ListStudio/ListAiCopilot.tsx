/**
 * LIST_MODULE_007 — AI Copilot (right panel product assistant).
 * Product assistant panel. Observes form values; suggests; never auto-applies.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { listOne, type ListIntent } from './listTokens'

export type CopilotStatus = 'Ready' | 'Thinking' | 'Searching' | 'Improving' | 'Waiting Confirmation'
export type Confidence = 'Low' | 'Medium' | 'High'

export type CopilotSuggestion = {
  id: string
  kind: 'category' | 'tags' | 'description' | 'website' | 'social' | 'logo'
  title: string
  preview: string
  confidence: Confidence
  pending?: boolean
}

export type MemoryItem = {
  id: string
  label: string
  at: number
}

type Props = {
  intent: ListIntent
  values: Record<string, string>
  completionPct: number
  onApply: (suggestion: CopilotSuggestion) => void
  onReject: (suggestion: CopilotSuggestion) => void
  onGenerateDescription: () => void
  pendingDescription?: string | null
  onApplyDescription: () => void
  onDiscardDescription: () => void
}

const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Root = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  animation: ${fade} ${listOne.workspaceAnimMs} ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (max-width: 767px) {
    height: auto;
    animation: none;
  }
`

const Top = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #f0f0f0;
`

const StatusPill = styled.span`
  height: 24px;
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #bdbdbd;
  font-size: 11px;
  line-height: 14px;
  font-weight: 650;
`

const CompleteWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`

const RingBox = styled.div`
  position: relative;
  width: ${listOne.workspaceCompleteRing};
  height: ${listOne.workspaceCompleteRing};
  flex-shrink: 0;
`

const Ring = styled.div<{ $pct: number }>`
  width: ${listOne.workspaceCompleteRing};
  height: ${listOne.workspaceCompleteRing};
  border-radius: 50%;
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
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #e8e8e8;
  pointer-events: none;
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

const Missing = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`

const MissingItem = styled.li`
  font-size: 11px;
  line-height: 16px;
  color: #9a9a9a;

  &::before {
    content: '·';
    margin-right: 6px;
    color: #6e6e6e;
  }
`

const Section = styled.section<{ $h: number }>`
  box-sizing: border-box;
  height: ${({ $h }) => `${$h}px`};
  flex: 0 0 ${({ $h }) => `${$h}px`};
  min-height: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: #141414;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    max-height: none;
  }
`

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #d8d8d8;
  margin-bottom: 8px;
  flex-shrink: 0;
`

const SuggestStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
  min-height: 0;
  flex: 1;

  @media (max-width: 767px) {
    max-height: 280px;
  }
`

const SuggestCard = styled.div`
  box-sizing: border-box;
  height: 52px;
  flex: 0 0 52px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #181818;
  padding: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 8px;
  align-items: center;
`

const SuggestCopy = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 12px;
    line-height: 14px;
    font-weight: 650;
    color: #e8e8e8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 10px;
    line-height: 12px;
    color: #8a8a8a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`

const MiniBtn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  height: 26px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(221, 185, 47, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(221, 185, 47, 0.12)' : 'transparent')};
  color: #d8d8d8;
  font-size: 11px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.5);
    outline-offset: 1px;
  }
`

const AnalysisRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  min-height: 0;
`

const AnalysisRow = styled.div<{ $tone: 'green' | 'gray' | 'gold' }>`
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  line-height: 14px;
  color: #8a8a8a;

  strong {
    font-weight: 650;
    color: ${({ $tone }) =>
      $tone === 'green' ? '#8fbf98' : $tone === 'gold' ? '#d4b85a' : '#9a9a9a'};
    max-width: 58%;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const MemoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  min-height: 0;
  flex: 1;
`

const MemoryItemRow = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  line-height: 16px;
  color: #c8c8c8;

  span {
    color: #7a7a7a;
    white-space: nowrap;
  }
`

const EmptyHint = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 11px;
  line-height: 16px;
  color: #6e6e6e;
  padding: 8px;
`

const PendingNote = styled.div`
  font-size: 10px;
  line-height: 13px;
  color: #7a7a7a;
  margin-top: 2px;
`

const Accordion = styled.details`
  @media (min-width: 768px) {
    display: contents;
  }

  @media (max-width: 767px) {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: #141414;
    padding: 8px 10px;

    summary {
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
      color: #d8d8d8;
      list-style: none;
    }

    summary::-webkit-details-marker {
      display: none;
    }
  }
`

function filled(v?: string) {
  return Boolean(v && v.trim())
}

function relative(at: number, now: number) {
  const sec = Math.max(0, Math.floor((now - at) / 1000))
  if (sec < 5) return `${Math.max(sec, 1)} seconds ago`
  if (sec < 60) return `${sec} seconds ago`
  const m = Math.floor(sec / 60)
  return m === 1 ? '1 minute ago' : `${m} minutes ago`
}

function missingItems(values: Record<string, string>) {
  const items: string[] = []
  if (!filled(values.website)) items.push('Missing Website')
  if (!filled(values.logo)) items.push('Missing Logo')
  if (!filled(values.whitepaper)) items.push('Missing Whitepaper')
  if (!filled(values.category)) items.push('Missing Category')
  if (!filled(values.social) && !filled(values.twitter) && !filled(values.telegram)) {
    items.push('Missing Social')
  }
  return items
}

function buildSuggestions(values: Record<string, string>, pendingDescription: string | null): CopilotSuggestion[] {
  const out: CopilotSuggestion[] = []
  const name = values.name?.trim() || ''

  if (name && !filled(values.category)) {
    out.push({
      id: 'cat',
      kind: 'category',
      title: 'Suggested Category',
      preview: 'Wallet',
      confidence: 'Medium',
      pending: true,
    })
  }

  if (name) {
    out.push({
      id: 'tags',
      kind: 'tags',
      title: 'Suggested Tags',
      preview: 'AI · Wallet · Identity',
      confidence: 'Low',
      pending: true,
    })
  }

  if (pendingDescription) {
    out.push({
      id: 'desc-pending',
      kind: 'description',
      title: 'Suggested Description',
      preview: pendingDescription.slice(0, 48) + (pendingDescription.length > 48 ? '…' : ''),
      confidence: 'Medium',
      pending: true,
    })
  } else if (name && !filled(values.description)) {
    out.push({
      id: 'desc',
      kind: 'description',
      title: 'Suggested Description',
      preview: 'Generate a local draft (pending backend)',
      confidence: 'Low',
      pending: true,
    })
  }

  if (name && !filled(values.website)) {
    out.push({
      id: 'web',
      kind: 'website',
      title: 'Suggested Website',
      preview: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.io (pending)`,
      confidence: 'Low',
      pending: true,
    })
  }

  if (name && !filled(values.social) && !filled(values.twitter)) {
    out.push({
      id: 'tw',
      kind: 'social',
      title: 'Suggested Twitter',
      preview: `@${name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14)} (pending)`,
      confidence: 'Low',
      pending: true,
    })
  }

  if (name && !filled(values.logo)) {
    out.push({
      id: 'logo',
      kind: 'logo',
      title: 'Suggested Logo',
      preview: 'Probable mark found (pending)',
      confidence: 'Low',
      pending: true,
    })
  }

  return out.slice(0, 5)
}

function analysisRows(values: Record<string, string>) {
  return [
    {
      label: 'Detected Chain',
      value: values.chain || (filled(values.token) ? 'BSC (pending)' : '—'),
      tone: filled(values.chain) || filled(values.token) ? ('gold' as const) : ('gray' as const),
    },
    {
      label: 'Detected Token',
      value: values.token || '—',
      tone: filled(values.token) ? ('green' as const) : ('gray' as const),
    },
    {
      label: 'Detected Website',
      value: values.website || '—',
      tone: filled(values.website) ? ('green' as const) : ('gray' as const),
    },
    {
      label: 'Detected Twitter',
      value: values.twitter || values.social || '—',
      tone: filled(values.twitter) || filled(values.social) ? ('gold' as const) : ('gray' as const),
    },
    {
      label: 'Detected Telegram',
      value: values.telegram || '—',
      tone: filled(values.telegram) ? ('green' as const) : ('gray' as const),
    },
    {
      label: 'Detected Whitepaper',
      value: values.whitepaper || '—',
      tone: filled(values.whitepaper) ? ('gold' as const) : ('gray' as const),
    },
  ]
}

export const ListAiCopilot: React.FC<Props> = ({
  intent,
  values,
  completionPct,
  onApply,
  onReject,
  onGenerateDescription,
  pendingDescription,
  onApplyDescription,
  onDiscardDescription,
}) => {
  const [status, setStatus] = useState<CopilotStatus>('Ready')
  const [memory, setMemory] = useState<MemoryItem[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})
  const lastName = useRef('')
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setDismissed({})
    setMemory([])
    setStatus('Ready')
    lastName.current = ''
  }, [intent])

  // Observe Project Name — non-blocking analysis cycle
  useEffect(() => {
    const name = values.name?.trim() || ''
    if (!name || name === lastName.current) return
    lastName.current = name
    setStatus('Searching')
    if (thinkTimer.current) clearTimeout(thinkTimer.current)
    thinkTimer.current = setTimeout(() => {
      setStatus('Thinking')
      thinkTimer.current = setTimeout(() => {
        setStatus(pendingDescription ? 'Waiting Confirmation' : 'Ready')
        setMemory((m) => [
          { id: `mem-${Date.now()}`, label: 'Analyzed project name', at: Date.now() },
          ...m,
        ].slice(0, 6))
      }, 280)
    }, 220)
    return () => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current)
    }
  }, [values.name, pendingDescription])

  useEffect(() => {
    if (pendingDescription) setStatus('Waiting Confirmation')
  }, [pendingDescription])

  const missing = useMemo(() => missingItems(values), [values])
  const suggestions = useMemo(
    () => buildSuggestions(values, pendingDescription || null).filter((s) => !dismissed[s.id]),
    [values, pendingDescription, dismissed],
  )
  const rows = useMemo(() => analysisRows(values), [values])

  const pushMemory = (label: string) => {
    setMemory((m) => [{ id: `mem-${Date.now()}-${label}`, label, at: Date.now() }, ...m].slice(0, 6))
  }

  const handleApply = (s: CopilotSuggestion) => {
    if (s.kind === 'description' && pendingDescription) {
      onApplyDescription()
      pushMemory('Applied description')
      setStatus('Ready')
      setDismissed((d) => ({ ...d, [s.id]: true }))
      return
    }
    if (s.kind === 'description' && s.id === 'desc') {
      setStatus('Improving')
      onGenerateDescription()
      pushMemory('Generated Description')
      return
    }
    onApply(s)
    pushMemory(`Applied ${s.title}`)
    setDismissed((d) => ({ ...d, [s.id]: true }))
    setStatus('Ready')
  }

  const handleReject = (s: CopilotSuggestion) => {
    if (s.kind === 'description' && pendingDescription) {
      onDiscardDescription()
      pushMemory('Discarded description')
    } else {
      onReject(s)
      pushMemory(`Rejected ${s.title}`)
    }
    setDismissed((d) => ({ ...d, [s.id]: true }))
    setStatus('Ready')
  }

  return (
    <Root data-testid="list-ai-copilot" data-list-module="007" data-copilot-status={status}>
      <Top>
        <Title>AI Copilot</Title>
        <StatusPill data-testid="list-ai-copilot-status">{status}</StatusPill>
      </Top>

      <CompleteWrap data-testid="list-workspace-completeness">
        <RingBox>
          <Ring $pct={completionPct} aria-hidden />
          <RingLabel>{completionPct}%</RingLabel>
        </RingBox>
        <CompleteMeta>
          <strong>Completion</strong>
          <span>From required fields only — never estimated.</span>
        </CompleteMeta>
      </CompleteWrap>

      <div>
        <SectionTitle as="div" style={{ marginBottom: 4 }}>
          Missing Items
        </SectionTitle>
        {missing.length ? (
          <Missing data-testid="list-ai-copilot-missing">
            {missing.map((item) => (
              <MissingItem key={item}>{item}</MissingItem>
            ))}
          </Missing>
        ) : (
          <MissingItem as="div" style={{ paddingLeft: 0 }}>
            No required gaps detected
          </MissingItem>
        )}
      </div>

      <Accordion open>
        <summary>AI Suggestions</summary>
        <Section $h={260} data-testid="list-ai-copilot-suggestions" aria-label="AI Suggestions" data-pixel-ai-suggest="260">
          <SectionTitle>AI Suggestions</SectionTitle>
          {suggestions.length ? (
            <SuggestStack>
              {suggestions.map((s) => (
                <SuggestCard key={s.id} data-testid={`list-ai-suggest-${s.id}`}>
                  <SuggestCopy>
                    <strong>{s.title}</strong>
                    <span>
                      {s.preview} · Confidence {s.confidence}
                      {s.pending ? ' · pending' : ''}
                    </span>
                  </SuggestCopy>
                  <Actions>
                    {s.kind === 'description' && s.id === 'desc' ? (
                      <MiniBtn type="button" $primary onClick={() => handleApply(s)}>
                        Generate
                      </MiniBtn>
                    ) : (
                      <>
                        <MiniBtn type="button" $primary onClick={() => handleApply(s)}>
                          Apply
                        </MiniBtn>
                        <MiniBtn type="button" onClick={() => handleReject(s)}>
                          {s.kind === 'description' ? 'Discard' : 'Reject'}
                        </MiniBtn>
                      </>
                    )}
                  </Actions>
                </SuggestCard>
              ))}
            </SuggestStack>
          ) : (
            <EmptyHint>
              Edit the form to receive suggestions.
              <PendingNote>Detections are local placeholders until backend AI is available.</PendingNote>
            </EmptyHint>
          )}
        </Section>
      </Accordion>

      <Section $h={120} data-testid="list-ai-copilot-analysis" aria-label="Live Analysis">
        <SectionTitle>Live Analysis</SectionTitle>
        <AnalysisRows>
          {rows.map((r) => (
            <AnalysisRow key={r.label} $tone={r.tone}>
              {r.label}
              <strong>{r.value}</strong>
            </AnalysisRow>
          ))}
        </AnalysisRows>
      </Section>

      <Section $h={120} data-testid="list-ai-copilot-memory" aria-label="AI Memory">
        <SectionTitle>AI Memory</SectionTitle>
        {memory.length ? (
          <MemoryList>
            {memory.map((m) => (
              <MemoryItemRow key={m.id}>
                {m.label}
                <span>{relative(m.at, now)}</span>
              </MemoryItemRow>
            ))}
          </MemoryList>
        ) : (
          <EmptyHint>Latest AI actions appear here — activity log only.</EmptyHint>
        )}
      </Section>
    </Root>
  )
}

export default ListAiCopilot
