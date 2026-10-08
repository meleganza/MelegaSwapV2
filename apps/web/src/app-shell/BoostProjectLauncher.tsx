import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import styled, { keyframes } from 'styled-components'

const CommercialCheckoutModal = dynamic(
  () => import('views/shared/monetization/CommercialCheckoutModal').then((module) => module.CommercialCheckoutModal),
  { ssr: false },
)

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

export const BoostProjectLauncher: React.FC = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutMounted, setCheckoutMounted] = useState(false)

  const openCheckout = () => {
    setCheckoutMounted(true)
    setCheckoutOpen(true)
  }

  return (
    <>
      <Trigger type="button" onClick={openCheckout} data-testid="boost-your-project-trigger">
        BOOST YOUR PROJECT
      </Trigger>

      {checkoutMounted ? (
        <CommercialCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          projectId=""
          projectSlug=""
          projectContract=""
          chainId={56}
          identityReady
          visibilityOnly
        />
      ) : null}
    </>
  )
}

export default BoostProjectLauncher
