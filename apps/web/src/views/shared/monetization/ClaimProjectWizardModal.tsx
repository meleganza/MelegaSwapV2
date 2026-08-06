/**
 * Claim Project wizard — MelegaModal V3 multi-step ownership + publish flow.
 */
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import {
  MelegaModal,
  MelegaModalFooter,
  MelegaModalFooterActions,
  MelegaModalFooterMeta,
  MelegaModalPreview,
} from 'design-system/melega/components'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { RC_COPY } from 'lib/monetization/copy'
import { appendMarketingHistory } from './marketingHistory'

type ClaimStep = 'wallet' | 'ownership' | 'customize' | 'review' | 'publish'

const STEPS: ClaimStep[] = ['wallet', 'ownership', 'customize', 'review', 'publish']
const LABELS: Record<ClaimStep, string> = {
  wallet: 'Wallet',
  ownership: 'Ownership',
  customize: 'Customize',
  review: 'Review',
  publish: 'Publish',
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  @media (min-width: 720px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
  }
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
`

const Field = styled.input`
  width: 100%;
  box-sizing: border-box;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f2f2f2;
  font-size: 13px;
`

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #f2f2f2;
  font-size: 13px;
  resize: vertical;
`

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: ${uxRebuildColors.secondary};
`

const Err = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff8f8f;
`

const GhostBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #ddd;
  font-size: 12px;
  font-weight: 700;
`

const PrimaryBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.65);
  background: rgba(221, 185, 47, 0.16);
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 750;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const PreviewLine = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.82);
  & + & {
    margin-top: 6px;
  }
`

export type ClaimCustomizeDraft = {
  logo: string
  description: string
  website: string
  x: string
  telegram: string
  discord: string
  github: string
}

type Props = {
  open: boolean
  onClose: () => void
  projectSlug: string
  projectName?: string
  projectContract?: string | null
  initialDraft?: Partial<ClaimCustomizeDraft>
  onPublished?: () => void
}

const emptyDraft: ClaimCustomizeDraft = {
  logo: '',
  description: '',
  website: '',
  x: '',
  telegram: '',
  discord: '',
  github: '',
}

export const ClaimProjectWizardModal: React.FC<Props> = ({
  open,
  onClose,
  projectSlug,
  projectName,
  projectContract = null,
  initialDraft,
  onPublished,
}) => {
  const { address, isConnected } = useAccount()
  const [step, setStep] = useState<ClaimStep>('wallet')
  const [ownershipOk, setOwnershipOk] = useState(false)
  const [draft, setDraft] = useState<ClaimCustomizeDraft>({ ...emptyDraft, ...initialDraft })
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('wallet')
    setOwnershipOk(false)
    setDraft({ ...emptyDraft, ...initialDraft })
    setError(null)
    setPublished(false)
  }, [open, initialDraft])

  const stepIndex = STEPS.indexOf(step)
  const modalSteps = STEPS.map((id, i) => ({
    id,
    label: LABELS[id],
    active: id === step,
    done: i < stepIndex || (id === 'publish' && published),
  }))

  const setField = (key: keyof ClaimCustomizeDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
  }

  const goNext = () => {
    setError(null)
    if (step === 'wallet') {
      if (!isConnected || !address) {
        setError(RC_COPY.connectWallet)
        return
      }
      setStep('ownership')
      return
    }
    if (step === 'ownership') {
      if (!ownershipOk) {
        setError('Confirm you control the project wallet / deployer.')
        return
      }
      setStep('customize')
      return
    }
    if (step === 'customize') {
      if (!draft.description.trim()) {
        setError('Add a short description before continuing.')
        return
      }
      setStep('review')
      return
    }
    if (step === 'review') {
      setStep('publish')
    }
  }

  const goBack = () => {
    setError(null)
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  const publish = () => {
    setError(null)
    try {
      const payload = {
        slug: projectSlug,
        contract: projectContract,
        wallet: address,
        ...draft,
        publishedAt: new Date().toISOString(),
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`melega.claimDraft.v1.${projectSlug}`, JSON.stringify(payload))
      }
      appendMarketingHistory(projectSlug, {
        kind: 'claim',
        label: 'Claim Project published',
        status: 'Completed',
      })
      setPublished(true)
      onPublished?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const footer = (
    <MelegaModalFooter>
      <MelegaModalFooterMeta>
        {projectName || projectSlug} · Claim wizard
      </MelegaModalFooterMeta>
      <MelegaModalFooterActions>
        {step !== 'wallet' && !published ? (
          <GhostBtn type="button" onClick={goBack} data-testid="claim-wizard-back">
            Back
          </GhostBtn>
        ) : (
          <GhostBtn type="button" onClick={onClose} data-testid="claim-wizard-close-footer">
            {published ? 'Done' : 'Cancel'}
          </GhostBtn>
        )}
        {step === 'publish' ? (
          published ? null : (
            <PrimaryBtn type="button" onClick={publish} data-testid="claim-wizard-publish">
              Publish
            </PrimaryBtn>
          )
        ) : (
          <PrimaryBtn type="button" onClick={goNext} data-testid="claim-wizard-next">
            Continue
          </PrimaryBtn>
        )}
      </MelegaModalFooterActions>
    </MelegaModalFooter>
  )

  return (
    <MelegaModal
      open={open}
      onClose={onClose}
      title="Claim Project"
      subtitle="Verify ownership, customize identity, then publish."
      steps={modalSteps}
      size="md"
      footer={footer}
      testId="claim-project-wizard-modal"
      closeTestId="claim-wizard-close"
    >
      <Grid>
        <Stack>
          {step === 'wallet' ? (
            <div data-testid="claim-step-wallet">
              <Label>Connect Wallet</Label>
              <Meta style={{ marginTop: 6 }}>
                {isConnected && address
                  ? `Connected · ${address.slice(0, 6)}…${address.slice(-4)}`
                  : 'Connect your wallet to start the claim.'}
              </Meta>
            </div>
          ) : null}

          {step === 'ownership' ? (
            <div data-testid="claim-step-ownership">
              <Label>Ownership verification</Label>
              <Meta style={{ marginTop: 6 }}>
                Confirm you control the deployer or project treasury wallet for{' '}
                {projectContract ? `${projectContract.slice(0, 6)}…${projectContract.slice(-4)}` : projectSlug}.
              </Meta>
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={ownershipOk}
                  onChange={(e) => setOwnershipOk(e.target.checked)}
                  data-testid="claim-ownership-confirm"
                />
                <span>I control this project and authorize Melega to list my claim.</span>
              </label>
            </div>
          ) : null}

          {step === 'customize' ? (
            <div data-testid="claim-step-customize">
              <Label>Customize</Label>
              <Stack style={{ marginTop: 6 }}>
                <Field placeholder="Logo URL" value={draft.logo} onChange={setField('logo')} data-testid="claim-logo" />
                <TextArea
                  placeholder="Description"
                  value={draft.description}
                  onChange={setField('description')}
                  data-testid="claim-description"
                />
                <Field placeholder="Website" value={draft.website} onChange={setField('website')} data-testid="claim-website" />
                <Field placeholder="X / Twitter" value={draft.x} onChange={setField('x')} data-testid="claim-x" />
                <Field placeholder="Telegram" value={draft.telegram} onChange={setField('telegram')} data-testid="claim-telegram" />
                <Field placeholder="Discord" value={draft.discord} onChange={setField('discord')} data-testid="claim-discord" />
                <Field placeholder="GitHub" value={draft.github} onChange={setField('github')} data-testid="claim-github" />
              </Stack>
            </div>
          ) : null}

          {step === 'review' ? (
            <div data-testid="claim-step-review">
              <Label>Review</Label>
              <Meta style={{ marginTop: 6 }}>{draft.description}</Meta>
              <Meta>Website · {draft.website || '—'}</Meta>
              <Meta>X · {draft.x || '—'} · TG · {draft.telegram || '—'}</Meta>
              <Meta>Discord · {draft.discord || '—'} · GitHub · {draft.github || '—'}</Meta>
            </div>
          ) : null}

          {step === 'publish' ? (
            <div data-testid="claim-step-publish">
              <Label>Publish</Label>
              <Meta style={{ marginTop: 6 }}>
                {published
                  ? 'Claim draft published locally. Marketing History updated.'
                  : 'Publish stores your claim draft and marks Claim as Completed in Marketing History.'}
              </Meta>
            </div>
          ) : null}

          {error ? <Err data-testid="claim-wizard-error">{error}</Err> : null}
        </Stack>
        <MelegaModalPreview data-testid="claim-wizard-preview">
          <PreviewLine>
            <strong>{projectName || projectSlug}</strong>
          </PreviewLine>
          <PreviewLine>Step · {LABELS[step]}</PreviewLine>
          <PreviewLine>Wallet · {address ? `${address.slice(0, 6)}…` : '—'}</PreviewLine>
          <PreviewLine>Ownership · {ownershipOk ? 'confirmed' : 'pending'}</PreviewLine>
        </MelegaModalPreview>
      </Grid>
    </MelegaModal>
  )
}

export default ClaimProjectWizardModal
