import React from 'react'
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
  min-height: 100dvh;
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
  width: min(520px, 100%);
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

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.08;
`

const Message = styled.p`
  max-width: 400px;
  margin: 14px auto 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 15px;
  line-height: 1.6;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 9px;
  margin-top: 26px;
`

const Primary = styled(Link)`
  min-height: 44px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: linear-gradient(135deg, #f8cf49, #e7b718);
  color: #080808;
  text-decoration: none;
  font-size: 14px;
  font-weight: 850;
  box-shadow: 0 10px 30px rgba(244, 196, 48, 0.18);
`

export type PremiumErrorScreenProps = {
  title?: string
  message?: string
}

/**
 * Founder-approved global error experience:
 * polished centered message + Home CTA. Diagnostics stay in logs/Sentry only.
 */
export const PremiumErrorScreen: React.FC<PremiumErrorScreenProps> = ({
  title = 'Something went wrong',
  message = "This page couldn't load. You can go back home and keep using Melega DEX.",
}) => {
  return (
    <Screen data-testid="premium-error-screen" data-friendly-error-screen="true">
      <Card>
        <Orbit aria-hidden />
        <Logo src={MELEGA_LOGO_URI} alt="Melega DEX" />
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Actions>
          <Primary href="/" data-testid="friendly-error-home">
            Return Home
          </Primary>
        </Actions>
      </Card>
    </Screen>
  )
}

export default PremiumErrorScreen
