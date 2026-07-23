import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Activity,
  ArrowRight,
  BadgePercent,
  BrainCircuit,
  CircleCheck,
  Coins,
  Droplets,
  ShieldCheck,
} from 'lucide-react'
import { lb } from './lbProductTokens'

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
  gap: 24px;
  align-items: stretch;

  /* Stack before card columns go <280px (inside 672 desktop card + all mobile) */
  @media (max-width: 1375px) {
    grid-template-columns: 1fr;
  }
`

const Hero = styled.section`
  min-height: 430px;
  padding: 36px;
  border-radius: 24px;
  border: 1px solid ${lb.goldBorder};
  background:
    radial-gradient(
      circle at 82% 18%,
      rgba(244, 196, 48, 0.12) 0%,
      rgba(244, 196, 48, 0.025) 28%,
      transparent 54%
    ),
    ${lb.card};
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: 767px) {
    padding: 16px;
    border-radius: 18px;
  }

  @media (max-width: 390px) {
    padding: 14px;
  }
`

const Eyebrow = styled.div`
  font-size: 11px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: ${lb.gold};
  font-family: ${lb.font};
`

const Headline = styled.h2`
  margin: 16px 0 0;
  max-width: 650px;
  font-size: 44px;
  line-height: 52px;
  font-weight: 600;
  letter-spacing: -1.1px;
  color: ${lb.text};
  font-family: ${lb.font};

  @media (max-width: 768px) {
    font-size: 36px;
    line-height: 44px;
  }

  @media (max-width: 390px) {
    font-size: 31px;
    line-height: 38px;
  }
`

const Body = styled.p`
  margin: 16px 0 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 24px;
  color: ${lb.muted2};
  font-family: ${lb.font};
`

const Benefits = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Benefit = styled.div`
  min-height: 96px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid ${lb.borderSoft};
  background: rgba(8, 8, 8, 0.42);
  box-sizing: border-box;
`

const BenefitTitle = styled.div`
  margin-top: 10px;
  font-size: 12px;
  line-height: 17px;
  font-weight: 600;
  color: ${lb.text};
`

const BenefitBody = styled.div`
  margin-top: 4px;
  font-size: 11px;
  line-height: 16px;
  color: ${lb.muted8};
`

const CtaRow = styled.div`
  margin-top: 32px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;

  @media (max-width: 390px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Primary = styled.button`
  height: 48px;
  padding: 0 20px;
  border-radius: 14px;
  border: 0;
  background: ${lb.gold};
  color: ${lb.ink};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  font-family: ${lb.font};
  cursor: pointer;

  @media (max-width: 390px) {
    width: 100%;
  }
`

const HowLink = styled.button`
  margin-left: 14px;
  height: 48px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: ${lb.muted};
  font-size: 12px;
  font-weight: 600;
  font-family: ${lb.font};
  cursor: pointer;

  @media (max-width: 390px) {
    margin-left: 0;
    width: 100%;
  }
`

const HowPanel = styled.div`
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: rgba(8, 8, 8, 0.5);
  font-size: 12px;
  line-height: 18px;
  color: ${lb.muted2};
`

const Right = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1279px) and (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`

const SideCard = styled.section`
  padding: 20px;
  border-radius: 18px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;
`

const SideTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: ${lb.text};
  font-family: ${lb.font};
`

const Diagram = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 24px 1fr 24px 1fr;
  align-items: center;
  gap: 6px;
`

const Node = styled.div`
  min-height: 72px;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${lb.borderSoft};
  background: ${lb.input};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`

const NodeLabel = styled.div`
  margin-top: 7px;
  font-size: 10px;
  line-height: 14px;
  color: ${lb.muted2};
`

const Caption = styled.p`
  margin: 14px 0 0;
  font-size: 11px;
  line-height: 16px;
  color: ${lb.muted3};
`

const ProtectCard = styled(SideCard)`
  flex: 1;
  min-height: 212px;
`

const ProtectRow = styled.div`
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 11px;
  line-height: 16px;
  color: ${lb.muted2};
  margin-top: 8px;
`

const BENEFITS = [
  {
    Icon: ShieldCheck,
    title: 'You keep LP ownership',
    body: 'LP tokens remain assigned to your configured owner.',
  },
  {
    Icon: BrainCircuit,
    title: 'Full AI by default',
    body: 'The recommended strategy adapts within fixed safety limits.',
  },
  {
    Icon: BadgePercent,
    title: 'Success-based fee',
    body: 'The fee applies only to quote assets actually acquired.',
  },
] as const

const PROTECTIONS = [
  'Controlled decision frequency',
  'Maximum budget limits',
  'Slippage and price-impact protection',
  'Automatic anomaly pause',
  'No human execution wallet',
] as const

export function LbIntroView({ onStartSetup }: { onStartSetup: () => void }) {
  const [howOpen, setHowOpen] = useState(false)

  return (
    <Grid data-testid="lb-intro-view">
      <Hero>
        <Eyebrow>AI-POWERED LIQUIDITY</Eyebrow>
        <Headline data-testid="lb-entry-title">Build lasting liquidity from your token reserve.</Headline>
        <Body data-testid="lb-entry-lead">
          Dedicate a token budget. Melega evaluates eligible market activity in controlled intervals
          and progressively converts that reserve into real pool liquidity.
        </Body>
        <Benefits>
          {BENEFITS.map(({ Icon, title, body }) => (
            <Benefit key={title}>
              <Icon size={19} color={lb.gold} strokeWidth={1.7} aria-hidden />
              <BenefitTitle>{title}</BenefitTitle>
              <BenefitBody>{body}</BenefitBody>
            </Benefit>
          ))}
        </Benefits>
        <CtaRow>
          <Primary type="button" data-testid="lb-primary-cta" onClick={onStartSetup}>
            Set Up Liquidity Building
            <ArrowRight size={18} strokeWidth={2} aria-hidden />
          </Primary>
          <HowLink type="button" data-testid="lb-how-it-works" onClick={() => setHowOpen((v) => !v)}>
            How it works
          </HowLink>
        </CtaRow>
        {howOpen ? (
          <HowPanel data-testid="lb-how-it-works-panel">
            You configure a token reserve and strategy. Melega reviews the configuration, then waits
            until production activation requirements are complete before any deposit or execution can
            occur. LP ownership stays with your configured owner.
          </HowPanel>
        ) : null}
      </Hero>

      <Right>
        <SideCard style={{ minHeight: 202 }}>
          <SideTitle>How the budget works</SideTitle>
          <Diagram>
            <Node>
              <Coins size={18} color={lb.gold} aria-hidden />
              <NodeLabel>Token Reserve</NodeLabel>
            </Node>
            <ArrowRight size={14} color="#555555" aria-hidden />
            <Node>
              <Activity size={18} color={lb.gold} aria-hidden />
              <NodeLabel>Eligible Activity</NodeLabel>
            </Node>
            <ArrowRight size={14} color="#555555" aria-hidden />
            <Node>
              <Droplets size={18} color={lb.gold} aria-hidden />
              <NodeLabel>Pool Liquidity</NodeLabel>
            </Node>
          </Diagram>
          <Caption>
            Only deposited budget can be used. Unused reserve remains yours according to program state.
          </Caption>
        </SideCard>

        <ProtectCard>
          <SideTitle>Built-in protections</SideTitle>
          {PROTECTIONS.map((row) => (
            <ProtectRow key={row}>
              <CircleCheck size={15} color={lb.gold} aria-hidden />
              {row}
            </ProtectRow>
          ))}
        </ProtectCard>
      </Right>
    </Grid>
  )
}
