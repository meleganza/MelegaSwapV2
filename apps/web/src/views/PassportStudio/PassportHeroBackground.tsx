/**
 * Decorative Module 001 depth layers — aria-hidden, static, opacity-capped.
 */
import React from 'react'
import styled from 'styled-components'

const Layers = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`

const RadialLeft = styled.div`
  position: absolute;
  left: -8%;
  top: -20%;
  width: 62%;
  height: 90%;
  background: radial-gradient(
    ellipse at 30% 40%,
    rgba(28, 36, 52, 0.55) 0%,
    rgba(9, 11, 14, 0) 68%
  );
  opacity: 0.9;
`

const GoldGlow = styled.div`
  position: absolute;
  right: 4%;
  top: 8%;
  width: 48%;
  height: 70%;
  background: radial-gradient(
    ellipse at 60% 40%,
    rgba(221, 185, 47, 0.09) 0%,
    rgba(221, 185, 47, 0) 62%
  );
`

const Horizon = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 105px;
  background: radial-gradient(
    ellipse 120% 100% at 50% 120%,
    rgba(42, 48, 62, 0.45) 0%,
    rgba(18, 22, 30, 0.22) 42%,
    rgba(9, 11, 14, 0) 72%
  );
  opacity: 0.85;
`

const HorizonCurve = styled.div`
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -48px;
  height: 120px;
  border-radius: 50%;
  border-top: 1px solid rgba(221, 185, 47, 0.1);
  box-shadow: inset 0 18px 40px rgba(0, 0, 0, 0.35);
  opacity: 0.7;
`

const GridTexture = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.07;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 50% 40%, black 10%, transparent 72%);
`

const Particles = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image:
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px),
    radial-gradient(circle at 72% 22%, rgba(221, 185, 47, 0.45) 0 1px, transparent 1.5px),
    radial-gradient(circle at 44% 62%, rgba(255, 255, 255, 0.35) 0 1px, transparent 1.5px),
    radial-gradient(circle at 86% 58%, rgba(255, 255, 255, 0.3) 0 1px, transparent 1.5px),
    radial-gradient(circle at 30% 78%, rgba(221, 185, 47, 0.28) 0 1px, transparent 1.5px);
`

export const PassportHeroBackground: React.FC = () => (
  <Layers aria-hidden="true" data-testid="passport-hero-background">
    <RadialLeft />
    <GoldGlow />
    <Horizon />
    <HorizonCurve />
    <GridTexture />
    <Particles />
  </Layers>
)

export default PassportHeroBackground
