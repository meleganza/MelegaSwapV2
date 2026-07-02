import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { PsGhostBtn, PsPrimaryBtn } from './poolsStudioPrimitives'

const Section = styled.section`
  width: 100%;
  min-height: ${poolsStudioLayout.createCtaHeight};
  border-radius: 20px;
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.ctaGradient}, ${poolsStudioColors.panel};
  padding: 20px 24px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 140px 1fr 200px;
  gap: 24px;
  align-items: center;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 20px 16px;
  }
`

const Illustration = styled.div`
  width: 120px;
  height: 110px;
  position: relative;
  margin: 0 auto;

  @media (max-width: 767px) {
    width: 100px;
    height: 90px;
  }
`

const GiftBox = styled.div`
  width: 72px;
  height: 56px;
  border-radius: 10px;
  background: linear-gradient(145deg, #f4c542, #b8860b);
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.25);

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 14px;
    height: 100%;
    background: rgba(255, 255, 255, 0.25);
  }

  &::after {
    content: '';
    position: absolute;
    top: 18px;
    left: 0;
    right: 0;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
  }
`

const Coin = styled.span<{ $x: number; $y: number; $s: number }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  width: ${({ $s }) => $s}px;
  height: ${({ $s }) => $s}px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f4c542, #d4af37);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }
`

const Center = styled.div`
  min-width: 0;
`

const Title = styled.h2`
  margin: 0 0 6px;
  font-family: Orbitron, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Sub = styled.p`
  margin: 0 0 14px;
  font-size: 14px;
  color: ${poolsStudioColors.secondary};
`

const BtnRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 767px) {
    justify-content: center;
  }
`

const Checklist = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${poolsStudioColors.secondary};

  &::before {
    content: '✓';
    color: ${poolsStudioColors.green};
    font-weight: 800;
  }
`

const CHECKS = [
  'Distribute your own token',
  'Flexible & Locked pools',
  'AI Analytics',
  'Retention tools',
]

export const CreatePoolCta: React.FC = () => (
  <Section data-ps-create-cta>
    <Illustration aria-hidden>
      <Coin $x={10} $y={5} $s={22} />
      <Coin $x={75} $y={0} $s={18} />
      <Coin $x={82} $y={35} $s={14} />
      <GiftBox />
    </Illustration>
    <Center>
      <Title>Create Your Reward Pool</Title>
      <Sub>Launch a staking program rewarding your community.</Sub>
      <BtnRow>
        <PsPrimaryBtn type="button">+ Create Pool</PsPrimaryBtn>
        <PsGhostBtn type="button">Reward MARCO Holders</PsGhostBtn>
      </BtnRow>
    </Center>
    <Checklist>
      {CHECKS.map((item) => (
        <CheckItem key={item}>{item}</CheckItem>
      ))}
    </Checklist>
  </Section>
)

export default CreatePoolCta
