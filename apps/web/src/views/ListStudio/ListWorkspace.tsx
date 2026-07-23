/**
 * LIST_MODULE_005 — Unified List workspace.
 * One fixed shell; content replaced by listIntent. No modals, drawers, or routes.
 */
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { LIST_CREATE_TOKEN_AVAILABLE, listOne, type ListIntent } from './listTokens'
import { useListIntent } from './useListIntent'

type Meta = {
  title: string
  description: string
  steps: number
}

const INTENT_META: Record<ListIntent, Meta> = {
  'import-token': {
    title: 'Import Token',
    description: 'Connect an existing contract and prepare your Melega listing.',
    steps: 2,
  },
  'create-token': {
    title: 'Create Token',
    description: 'Define token basics. Factory publishing is not available yet.',
    steps: 2,
  },
  'claim-project': {
    title: 'Claim Project',
    description: 'Verify ownership signals and prepare your project claim.',
    steps: 2,
  },
  'create-project': {
    title: 'Create Project',
    description: 'Set up your project presence. Token details stay optional.',
    steps: 2,
  },
  'ai-assistant': {
    title: 'AI Assistant',
    description: 'Draft and improve listing copy inside this workspace.',
    steps: 1,
  },
}

const IDLE_META: Meta = {
  title: 'List Workspace',
  description: 'Select a path above. Everything continues inside this workspace.',
  steps: 1,
}

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
`

const Header = styled.header`
  box-sizing: border-box;
  height: ${listOne.workspaceHeaderH};
  flex: 0 0 ${listOne.workspaceHeaderH};
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 24px;
  align-items: center;
  min-width: 0;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    grid-template-columns: 1fr;
    row-gap: 8px;
    padding-bottom: 12px;
  }
`

const HeaderCopy = styled.div`
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 750;
  color: #f5f5f5;
`

const Description = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: #a8a8a8;
  max-width: 720px;
`

const Progress = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: #ddb92f;
  white-space: nowrap;
  justify-self: end;

  @media (max-width: 767px) {
    justify-self: start;
  }
`

const Body = styled.div`
  box-sizing: border-box;
  height: ${listOne.workspaceBodyH};
  flex: 0 0 ${listOne.workspaceBodyH};
  min-height: 0;
  overflow: auto;
  padding: 8px 0 0;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    max-height: none;
    overflow: visible;
  }
`

const Footer = styled.footer`
  box-sizing: border-box;
  height: ${listOne.workspaceFooterH};
  flex: 0 0 ${listOne.workspaceFooterH};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: auto;

  @media (max-width: 767px) {
    height: auto;
    flex: none;
    flex-wrap: wrap;
    padding-top: 12px;
  }
`

const FooterLeft = styled.div`
  display: flex;
  gap: 10px;
`

const FooterRight = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`

const Btn = styled.button<{ $primary?: boolean; $ghost?: boolean }>`
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
  border: 1px solid
    ${({ $primary, $ghost }) =>
      $primary ? 'rgba(221, 185, 47, 0.9)' : $ghost ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.18)'};
  background: ${({ $primary }) => ($primary ? 'rgba(221, 185, 47, 0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#f5f5f5' : '#d0d0d0')};

  &:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.7);
    outline-offset: 2px;
  }
`

const Panel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
  align-content: start;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`

const FieldWide = styled(Field)`
  grid-column: 1 / -1;
`

const Label = styled.span`
  font-size: 12px;
  line-height: 16px;
  font-weight: 650;
  color: #c8c8c8;
`

const Hint = styled.span`
  font-size: 11px;
  line-height: 15px;
  color: #8a8a8a;
`

const Input = styled.input`
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #151515;
  color: #f5f5f5;
  padding: 0 12px;
  font-size: 13px;
  font-family: inherit;

  &:disabled {
    opacity: 0.55;
  }
`

const Select = styled.select`
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #151515;
  color: #f5f5f5;
  padding: 0 12px;
  font-size: 13px;
  font-family: inherit;
`

const TextArea = styled.textarea`
  min-height: 96px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #151515;
  color: #f5f5f5;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
`

const Preview = styled.div`
  grid-column: 1 / -1;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141414;
  padding: 16px;
  min-height: 120px;
`

const PreviewTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #f5f5f5;
  margin-bottom: 8px;
`

const PreviewBody = styled.div`
  font-size: 12px;
  line-height: 18px;
  color: #a8a8a8;
  white-space: pre-wrap;
`

const Banner = styled.div`
  grid-column: 1 / -1;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  background: rgba(221, 185, 47, 0.08);
  color: #e6d39a;
  font-size: 12px;
  line-height: 18px;
  padding: 10px 12px;
`

const Idle = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #8a8a8a;
  font-size: 14px;
  line-height: 22px;
  padding: 24px;
`

const Chat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
`

const Transcript = styled.div`
  flex: 1;
  min-height: 220px;
  max-height: 420px;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #141414;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Bubble = styled.div<{ $user?: boolean }>`
  align-self: ${({ $user }) => ($user ? 'flex-end' : 'flex-start')};
  max-width: 85%;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 19px;
  background: ${({ $user }) => ($user ? 'rgba(221,185,47,0.14)' : '#1a1a1a')};
  color: #e8e8e8;
  border: 1px solid ${({ $user }) => ($user ? 'rgba(221,185,47,0.28)' : 'rgba(255,255,255,0.06)')};
`

const Suggestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button`
  appearance: none;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #d0d0d0;
  font-size: 12px;
  line-height: 16px;
  padding: 8px 12px;
  cursor: pointer;
  font-family: inherit;

  &:focus-visible {
    outline: 2px solid rgba(221, 185, 47, 0.7);
    outline-offset: 2px;
  }
`

const AiActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const OptionalTag = styled.span`
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #8a8a8a;
`

function ImportPanel({
  step,
  values,
  setValues,
}: {
  step: number
  values: Record<string, string>
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  if (step === 1) {
    return (
      <Panel>
        <Preview>
          <PreviewTitle>Project Preview</PreviewTitle>
          <PreviewBody>
            {`Contract: ${values.contract || '—'}\nChain: ${values.chain || '—'}\nAuto-detection: ${
              values.auto || 'Pending'
            }\n\nPreview is local only. Ownership is not verified from this screen.`}
          </PreviewBody>
        </Preview>
      </Panel>
    )
  }
  return (
    <Panel>
      <FieldWide>
        <Label>Contract Address</Label>
        <Input
          value={values.contract || ''}
          onChange={(e) => setValues((v) => ({ ...v, contract: e.target.value }))}
          placeholder="0x…"
          autoComplete="off"
        />
      </FieldWide>
      <Field>
        <Label>Chain</Label>
        <Select value={values.chain || 'bsc'} onChange={(e) => setValues((v) => ({ ...v, chain: e.target.value }))}>
          <option value="bsc">BNB Smart Chain</option>
          <option value="eth">Ethereum</option>
          <option value="polygon">Polygon</option>
        </Select>
      </Field>
      <Field>
        <Label>Auto Detection</Label>
        <Input
          value={values.auto || ''}
          onChange={(e) => setValues((v) => ({ ...v, auto: e.target.value }))}
          placeholder="Symbol / decimals when available"
        />
        <Hint>Detection assists setup. It does not prove ownership.</Hint>
      </Field>
      <Preview>
        <PreviewTitle>Project Preview</PreviewTitle>
        <PreviewBody>
          {values.contract
            ? `Ready to review ${values.contract.slice(0, 10)}… on ${values.chain || 'bsc'}.`
            : 'Enter a contract to populate a local preview.'}
        </PreviewBody>
      </Preview>
    </Panel>
  )
}

function CreateTokenPanel({
  step,
  values,
  setValues,
}: {
  step: number
  values: Record<string, string>
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  return (
    <Panel>
      {!LIST_CREATE_TOKEN_AVAILABLE ? (
        <Banner>Token creation is Coming Soon. Fields are shown for preparation only and cannot publish yet.</Banner>
      ) : null}
      {step === 1 ? (
        <Preview>
          <PreviewTitle>Token summary</PreviewTitle>
          <PreviewBody>
            {`Name: ${values.name || '—'}\nTicker: ${values.ticker || '—'}\nSupply: ${values.supply || '—'}\nDecimals: ${
              values.decimals || '—'
            }\nLogo: ${values.logo || '—'}`}
          </PreviewBody>
        </Preview>
      ) : (
        <>
          <Field>
            <Label>Token Name</Label>
            <Input
              value={values.name || ''}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </Field>
          <Field>
            <Label>Ticker</Label>
            <Input
              value={values.ticker || ''}
              onChange={(e) => setValues((v) => ({ ...v, ticker: e.target.value }))}
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </Field>
          <Field>
            <Label>Supply</Label>
            <Input
              value={values.supply || ''}
              onChange={(e) => setValues((v) => ({ ...v, supply: e.target.value }))}
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </Field>
          <Field>
            <Label>Decimals</Label>
            <Input
              value={values.decimals || '18'}
              onChange={(e) => setValues((v) => ({ ...v, decimals: e.target.value }))}
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </Field>
          <FieldWide>
            <Label>Logo</Label>
            <Input
              value={values.logo || ''}
              onChange={(e) => setValues((v) => ({ ...v, logo: e.target.value }))}
              placeholder="https://… or upload later"
              disabled={!LIST_CREATE_TOKEN_AVAILABLE}
            />
          </FieldWide>
        </>
      )}
    </Panel>
  )
}

function ClaimPanel({
  step,
  values,
  setValues,
}: {
  step: number
  values: Record<string, string>
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  if (step === 1) {
    return (
      <Panel>
        <Preview>
          <PreviewTitle>Project Preview</PreviewTitle>
          <PreviewBody>
            {`Contract: ${values.contract || '—'}\nWallet: ${values.wallet || '—'}\nVerification: ${
              values.verification || 'Not started'
            }\n\nClaiming requires evidence. This preview does not verify ownership.`}
          </PreviewBody>
        </Preview>
      </Panel>
    )
  }
  return (
    <Panel>
      <FieldWide>
        <Label>Contract</Label>
        <Input
          value={values.contract || ''}
          onChange={(e) => setValues((v) => ({ ...v, contract: e.target.value }))}
          placeholder="0x…"
        />
      </FieldWide>
      <Field>
        <Label>Wallet</Label>
        <Input
          value={values.wallet || ''}
          onChange={(e) => setValues((v) => ({ ...v, wallet: e.target.value }))}
          placeholder="Connected wallet address"
        />
      </Field>
      <Field>
        <Label>Verification</Label>
        <Select
          value={values.verification || 'pending'}
          onChange={(e) => setValues((v) => ({ ...v, verification: e.target.value }))}
        >
          <option value="pending">Pending evidence</option>
          <option value="signature">Signature challenge</option>
          <option value="manual">Manual review</option>
        </Select>
        <Hint>Status labels are workflow states, not completed verification.</Hint>
      </Field>
      <Preview>
        <PreviewTitle>Project Preview</PreviewTitle>
        <PreviewBody>
          {values.contract
            ? `Local claim draft for ${values.contract.slice(0, 10)}…`
            : 'Add contract and wallet to build a local claim preview.'}
        </PreviewBody>
      </Preview>
    </Panel>
  )
}

function CreateProjectPanel({
  step,
  values,
  setValues,
}: {
  step: number
  values: Record<string, string>
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
  if (step === 1) {
    return (
      <Panel>
        <Preview>
          <PreviewTitle>Project summary</PreviewTitle>
          <PreviewBody>
            {`Name: ${values.name || '—'}\nCategory: ${values.category || '—'}\nWebsite: ${
              values.website || '—'
            }\nSocial: ${values.social || '—'}\nToken (optional): ${values.token || 'Not provided'}\n\n${
              values.description || 'No description yet.'
            }`}
          </PreviewBody>
        </Preview>
      </Panel>
    )
  }
  return (
    <Panel>
      <Field>
        <Label>Project Name</Label>
        <Input value={values.name || ''} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
      </Field>
      <Field>
        <Label>Category</Label>
        <Select
          value={values.category || 'defi'}
          onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
        >
          <option value="defi">DeFi</option>
          <option value="gamefi">GameFi</option>
          <option value="infra">Infrastructure</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field>
        <Label>Website</Label>
        <Input
          value={values.website || ''}
          onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))}
          placeholder="https://"
        />
      </Field>
      <Field>
        <Label>Social</Label>
        <Input
          value={values.social || ''}
          onChange={(e) => setValues((v) => ({ ...v, social: e.target.value }))}
          placeholder="X / Telegram / Discord"
        />
      </Field>
      <FieldWide>
        <Label>Description</Label>
        <TextArea
          value={values.description || ''}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Describe the project"
        />
      </FieldWide>
      <FieldWide>
        <Label>
          AI
          <OptionalTag>assist</OptionalTag>
        </Label>
        <Input
          value={values.aiNote || ''}
          onChange={(e) => setValues((v) => ({ ...v, aiNote: e.target.value }))}
          placeholder="Notes for AI-assisted drafting (local only)"
        />
      </FieldWide>
      <FieldWide>
        <Label>
          Token
          <OptionalTag>optional — never mandatory</OptionalTag>
        </Label>
        <Input
          value={values.token || ''}
          onChange={(e) => setValues((v) => ({ ...v, token: e.target.value }))}
          placeholder="Token contract if you already have one"
        />
      </FieldWide>
    </Panel>
  )
}

function AiPanel({
  messages,
  onSuggest,
  onAction,
}: {
  messages: { role: 'user' | 'assistant'; text: string }[]
  onSuggest: (text: string) => void
  onAction: (action: string) => void
}) {
  return (
    <Chat>
      <Transcript data-testid="list-workspace-ai-transcript" aria-live="polite">
        {messages.map((m, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Bubble key={`${m.role}-${i}`} $user={m.role === 'user'}>
            {m.text}
          </Bubble>
        ))}
      </Transcript>
      <div>
        <Label style={{ marginBottom: 8, display: 'block' }}>Suggestions</Label>
        <Suggestions>
          {['Short project pitch', 'Liquidity-ready summary', 'Community intro'].map((s) => (
            <Chip key={s} type="button" onClick={() => onSuggest(s)}>
              {s}
            </Chip>
          ))}
        </Suggestions>
      </div>
      <AiActions>
        <Chip type="button" onClick={() => onAction('generate')}>
          Generate Description
        </Chip>
        <Chip type="button" onClick={() => onAction('improve')}>
          Improve Description
        </Chip>
        <Chip type="button" onClick={() => onAction('find')}>
          Find Existing Information
        </Chip>
      </AiActions>
    </Chat>
  )
}

export const ListWorkspace: React.FC = () => {
  const { listIntent, clearListIntent } = useListIntent()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Ask for a draft, improvement, or help finding public project information. Outputs stay in this workspace.',
    },
  ])

  useEffect(() => {
    setStep(0)
    setValues({})
    setMessages([
      {
        role: 'assistant',
        text: 'Ask for a draft, improvement, or help finding public project information. Outputs stay in this workspace.',
      },
    ])
  }, [listIntent])

  const meta = listIntent ? INTENT_META[listIntent] : IDLE_META
  const maxStep = Math.max(0, meta.steps - 1)
  const progressLabel = listIntent ? `Step ${step + 1} of ${meta.steps}` : 'Waiting'

  const canContinue = useMemo(() => {
    if (!listIntent) return false
    if (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE) return step < maxStep
    if (listIntent === 'ai-assistant') return false
    return true
  }, [listIntent, maxStep, step])

  const showBack = Boolean(listIntent) && step > 0
  const showContinue = Boolean(listIntent) && listIntent !== 'ai-assistant'
  const showCancel = Boolean(listIntent)

  const body = (() => {
    if (!listIntent) {
      return (
        <Idle data-testid="list-workspace-idle">
          Choose Import Token, Create Token, Claim Project, Create Project, or AI Assistant.
          <br />
          Content replaces here — you stay on /list.
        </Idle>
      )
    }
    switch (listIntent) {
      case 'import-token':
        return <ImportPanel step={step} values={values} setValues={setValues} />
      case 'create-token':
        return <CreateTokenPanel step={step} values={values} setValues={setValues} />
      case 'claim-project':
        return <ClaimPanel step={step} values={values} setValues={setValues} />
      case 'create-project':
        return <CreateProjectPanel step={step} values={values} setValues={setValues} />
      case 'ai-assistant':
        return (
          <AiPanel
            messages={messages}
            onSuggest={(text) => {
              setMessages((prev) => [
                ...prev,
                { role: 'user', text },
                {
                  role: 'assistant',
                  text: `Suggestion noted: “${text}”. Refine it with Generate or Improve Description.`,
                },
              ])
            }}
            onAction={(action) => {
              const map: Record<string, string> = {
                generate: 'Generated a local draft description. Edit freely — nothing was published.',
                improve: 'Improved the local draft for clarity. Review before using it elsewhere.',
                find: 'Searched local notes only. External sources are not auto-imported as verified facts.',
              }
              setMessages((prev) => [
                ...prev,
                { role: 'user', text: action },
                { role: 'assistant', text: map[action] || 'Done.' },
              ])
            }}
          />
        )
      default:
        return null
    }
  })()

  return (
    <Shell
      data-testid="list-workspace"
      data-list-module="005"
      data-list-intent={listIntent || ''}
      data-pixel-workspace="1376x920"
      aria-labelledby="list-workspace-title"
    >
      <Header data-testid="list-workspace-header" data-pixel-workspace-header="64">
        <HeaderCopy>
          <Title id="list-workspace-title">{meta.title}</Title>
          <Description>{meta.description}</Description>
        </HeaderCopy>
        <Progress data-testid="list-workspace-progress" aria-label={`Progress ${progressLabel}`}>
          {progressLabel}
        </Progress>
      </Header>

      <Body data-testid="list-workspace-body" data-pixel-workspace-body="760" data-workspace-step={step}>
        {body}
      </Body>

      <Footer data-testid="list-workspace-footer" data-pixel-workspace-footer="72">
        <FooterLeft>
          {showBack ? (
            <Btn type="button" $ghost onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Btn>
          ) : null}
        </FooterLeft>
        <FooterRight>
          {showCancel ? (
            <Btn type="button" $ghost onClick={() => clearListIntent()}>
              Cancel
            </Btn>
          ) : null}
          {showContinue ? (
            <Btn
              type="button"
              $primary
              disabled={!canContinue || (listIntent === 'create-token' && !LIST_CREATE_TOKEN_AVAILABLE && step >= maxStep)}
              onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
            >
              Continue
            </Btn>
          ) : null}
        </FooterRight>
      </Footer>
    </Shell>
  )
}

export default ListWorkspace
