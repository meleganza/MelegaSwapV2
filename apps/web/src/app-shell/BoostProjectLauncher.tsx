import React, { useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaModal, MelegaModalFooter, MelegaModalFooterActions } from 'design-system/melega/components/Modal'
import { CommercialCheckoutModal } from 'views/shared/monetization/CommercialCheckoutModal'

const breathe = keyframes`
  0%, 100% { box-shadow: 0 0 0 rgba(244, 196, 48, 0); }
  50% { box-shadow: 0 0 16px rgba(244, 196, 48, 0.22); }
`

const Trigger = styled.button`
  appearance: none;
  flex: 0 0 auto;
  height: 30px;
  padding: 0 11px;
  border: 1px solid rgba(244, 196, 48, 0.42);
  border-radius: 999px;
  background: linear-gradient(120deg, rgba(244, 196, 48, 0.16), rgba(244, 196, 48, 0.06));
  color: #f4c430;
  font-size: 10px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: 0.055em;
  white-space: nowrap;
  cursor: pointer;
  animation: ${breathe} 2.8s ease-in-out infinite;

  &:hover {
    border-color: rgba(244, 196, 48, 0.7);
    background: rgba(244, 196, 48, 0.16);
  }

  @media (max-width: 767px) {
    width: 30px;
    padding: 0;
    font-size: 0;

    &::after {
      content: '↗';
      font-size: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  font-size: 13px;
  text-transform: none;
  letter-spacing: 0;
  outline: none;

  &:focus {
    border-color: rgba(244, 196, 48, 0.55);
  }
`

const Note = styled.p<{ $error?: boolean }>`
  margin: 9px 0 0;
  color: ${({ $error }) => ($error ? '#ff8f8f' : 'rgba(255, 255, 255, 0.55)')};
  font-size: 12px;
  line-height: 1.45;
`

const Secondary = styled.button`
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: transparent;
  color: #ddd;
  font-weight: 750;
  cursor: pointer;
`

const Primary = styled(Secondary)`
  border-color: rgba(244, 196, 48, 0.6);
  background: rgba(244, 196, 48, 0.14);
  color: #f4c430;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const normalizeContract = (value: string) => value.trim()

export const BoostProjectLauncher: React.FC = () => {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [contract, setContract] = useState('')
  const normalized = normalizeContract(contract)
  const validContract = /^0x[a-fA-F0-9]{40}$/.test(normalized)
  const projectKey = useMemo(() => (validContract ? normalized.toLowerCase() : ''), [normalized, validContract])

  const continueToOffers = () => {
    if (!validContract) return
    setSelectorOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <>
      <Trigger type="button" onClick={() => setSelectorOpen(true)} data-testid="boost-your-project-trigger">
        BOOST YOUR PROJECT
      </Trigger>

      <MelegaModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        title="Boost Your Project"
        subtitle="Select the listed token before choosing a visibility service."
        size="sm"
        testId="boost-project-selector"
        footer={
          <MelegaModalFooter>
            <MelegaModalFooterActions>
              <Secondary type="button" onClick={() => setSelectorOpen(false)}>
                Cancel
              </Secondary>
              <Primary type="button" disabled={!validContract} onClick={continueToOffers}>
                View visibility options
              </Primary>
            </MelegaModalFooterActions>
          </MelegaModalFooter>
        }
      >
        <Field>
          Project token contract
          <Input
            value={contract}
            onChange={(event) => setContract(event.target.value)}
            placeholder="Paste the BNB Chain token address (0x…)"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            aria-invalid={contract.length > 0 && !validContract}
          />
        </Field>
        <Note $error={contract.length > 0 && !validContract}>
          {contract.length > 0 && !validContract
            ? 'Enter a valid 42-character token contract address.'
            : 'The token identity is carried into Featured, Boost and Sponsored Research.'}
        </Note>
      </MelegaModal>

      <CommercialCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        projectId={projectKey}
        projectSlug={projectKey}
        projectContract={projectKey}
        chainId={56}
        identityReady={validContract}
        visibilityOnly
      />
    </>
  )
}

export default BoostProjectLauncher
