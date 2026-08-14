import React, { useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { MELEGA_LOGO_URI } from 'design-system/melega/constants/brand'

const orbit = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const Screen = styled.main`
  position: fixed;
  inset: 0;
  z-index: 10080;
  min-height: 100vh;
  padding: 24px;
  display: grid;
  place-items: center;
  overflow: auto;
  color: #f7f7f7;
  background: radial-gradient(circle at 50% 42%, rgba(244, 196, 48, 0.105), transparent 28%),
    radial-gradient(circle at 78% 18%, rgba(244, 196, 48, 0.045), transparent 25%), #030303;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`

const Card = styled.section`
  position: relative;
  isolation: isolate;
  width: min(560px, 100%);
  padding: clamp(24px, 5vw, 42px);
  overflow: hidden;
  border: 1px solid rgba(244, 196, 48, 0.3);
  border-radius: 24px;
  background: linear-gradient(155deg, rgba(18, 18, 18, 0.98), rgba(6, 6, 6, 0.995));
  box-shadow: 0 36px 120px rgba(0, 0, 0, 0.78), 0 0 54px rgba(244, 196, 48, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  text-align: center;
`

const Orbit = styled.div`
  position: absolute;
  z-index: -1;
  width: 300px;
  height: 300px;
  top: -190px;
  right: -115px;
  border: 1px solid rgba(244, 196, 48, 0.14);
  border-radius: 50%;
  animation: ${orbit} 22s linear infinite;

  &::after {
    content: '';
    position: absolute;
    width: 9px;
    height: 9px;
    left: 31px;
    top: 205px;
    border-radius: 50%;
    background: #f4c430;
    box-shadow: 0 0 18px rgba(244, 196, 48, 0.72);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Logo = styled.img`
  width: 52px;
  height: 52px;
  display: block;
  margin: 0 auto 18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 26px rgba(244, 196, 48, 0.12);
`

const Eyebrow = styled.div`
  margin-bottom: 10px;
  color: #f4c430;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
`

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.06;
`

const Message = styled.p`
  max-width: 430px;
  margin: 14px auto 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 14px;
  line-height: 1.6;
`

const Tracking = styled.div`
  margin: 18px auto 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 11px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.025);
  font-size: 10px;
  overflow-wrap: anywhere;

  strong {
    display: block;
    margin-bottom: 3px;
    color: rgba(255, 255, 255, 0.82);
    letter-spacing: 0.04em;
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 9px;
  margin-top: 22px;
`

const Primary = styled(Link)`
  min-height: 44px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: linear-gradient(135deg, #f8cf49, #e7b718);
  color: #080808;
  text-decoration: none;
  font-size: 13px;
  font-weight: 850;
  box-shadow: 0 10px 30px rgba(244, 196, 48, 0.18);
`

const Action = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
`

const Details = styled.pre`
  width: 100%;
  max-height: 190px;
  margin: 14px 0 0;
  padding: 12px;
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.42);
  color: rgba(255, 255, 255, 0.58);
  font-size: 10px;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
`

export type PremiumErrorScreenProps = {
  code?: string | number
  title: string
  message: string
  trackingId?: string
  details?: string
  onRetry?: () => void
}

export const PremiumErrorScreen: React.FC<PremiumErrorScreenProps> = ({
  code = 'Route interrupted',
  title,
  message,
  trackingId,
  details,
  onRetry,
}) => {
  const [showDetails, setShowDetails] = useState(false)
  return (
    <Screen data-testid="premium-error-screen">
      <Card>
        <Orbit aria-hidden />
        <Logo src={MELEGA_LOGO_URI} alt="Melega DEX" />
        <Eyebrow>{code}</Eyebrow>
        <Title>{title}</Title>
        <Message>{message}</Message>
        {trackingId ? (
          <Tracking title="Click to copy" onClick={() => void navigator.clipboard?.writeText(trackingId)}>
            <strong>Error Tracking Id</strong>
            {trackingId}
          </Tracking>
        ) : null}
        <Actions>
          <Primary href="/">Return home</Primary>
          {onRetry ? <Action onClick={onRetry}>Retry</Action> : null}
          {details ? (
            <Action onClick={() => setShowDetails((visible) => !visible)}>
              {showDetails ? 'Hide technical details' : 'Technical details'}
            </Action>
          ) : null}
        </Actions>
        {showDetails && details ? <Details>{details}</Details> : null}
      </Card>
    </Screen>
  )
}

export default PremiumErrorScreen
