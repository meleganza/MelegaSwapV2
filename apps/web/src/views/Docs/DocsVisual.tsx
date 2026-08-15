import React from 'react'
import styled from 'styled-components'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

export type DocsVisualVariant =
  | 'hub'
  | 'swap'
  | 'bridge'
  | 'liquidity'
  | 'farms'
  | 'pools'
  | 'projects'
  | 'boost'
  | 'payments'
  | 'overview'
  | 'steps'
  | 'reserve'
  | 'goals'
  | 'strategies'
  | 'execution'
  | 'fees'
  | 'safety'
  | 'examples'

const COPY: Record<DocsVisualVariant, { eyebrow: string; title: string; nodes: string[] }> = {
  hub: { eyebrow: 'Knowledge center', title: 'Build deeper markets', nodes: ['Pair', 'Reserve', 'Strategy'] },
  swap: { eyebrow: 'Smart Swap', title: 'Quote → review → sign', nodes: ['Choose pair', 'Review route', 'Confirm wallet'] },
  bridge: { eyebrow: 'MARCO Bridge', title: 'Tracked cross-chain delivery', nodes: ['Choose networks', 'Review quote', 'Track delivery'] },
  liquidity: { eyebrow: 'Liquidity', title: 'Manage an AMM position', nodes: ['Choose pair', 'Enter amounts', 'Confirm once'] },
  farms: { eyebrow: 'Farms', title: 'Stake LP tokens', nodes: ['Choose farm', 'Stake LP', 'Track rewards'] },
  pools: { eyebrow: 'Pools', title: 'Stake and earn', nodes: ['Choose pool', 'Stake token', 'Harvest'] },
  projects: { eyebrow: 'Projects', title: 'From discovery to market', nodes: ['Discover', 'Verify identity', 'Trade'] },
  boost: { eyebrow: 'Boost your project', title: 'Verified paid visibility', nodes: ['Select service', 'Pay', 'Activate'] },
  payments: { eyebrow: 'MARCO Pay', title: 'Verified service checkout', nodes: ['Quote', 'Wallet approval', 'Receipt'] },
  overview: { eyebrow: 'Overview', title: 'Token → liquidity', nodes: ['Token', 'Program', 'LP'] },
  steps: { eyebrow: 'Workflow', title: 'Seven guided steps', nodes: ['Select', 'Configure', 'Activate'] },
  reserve: {
    eyebrow: 'Token reserve',
    title: 'Founder-controlled allocation',
    nodes: ['Deposit', 'Available', 'Deploy'],
  },
  goals: { eyebrow: 'Liquidity goals', title: 'Choose market intent', nodes: ['Steady', 'Deeper', 'Launch'] },
  strategies: { eyebrow: 'Strategies', title: 'Control execution', nodes: ['Careful', 'Balanced', 'Dynamic'] },
  execution: { eyebrow: 'Execution', title: 'Rules become actions', nodes: ['Review', 'Execute', 'Monitor'] },
  fees: { eyebrow: 'Fees', title: 'Transparent fee path', nodes: ['Program', 'Fee sink', 'Treasury'] },
  safety: { eyebrow: 'Risk & safety', title: 'Pause remains available', nodes: ['Monitor', 'Review', 'Pause'] },
  examples: { eyebrow: 'Examples', title: 'From setup to market', nodes: ['Launch', 'Grow', 'Deepen'] },
}

const Shell = styled.div`
  position: relative;
  min-height: 210px;
  overflow: hidden;
  padding: 24px;
  border: 1px solid rgba(221, 185, 47, 0.2);
  border-radius: ${uxRebuildRadius.card};
  background: radial-gradient(circle at 82% 18%, rgba(221, 185, 47, 0.2), transparent 32%),
    linear-gradient(145deg, rgba(25, 27, 29, 0.96), rgba(7, 8, 9, 0.98));

  &::after {
    position: absolute;
    width: 190px;
    height: 190px;
    right: -74px;
    bottom: -96px;
    border: 1px solid rgba(221, 185, 47, 0.22);
    border-radius: 50%;
    content: '';
  }
`

const Eyebrow = styled.div`
  color: ${uxRebuildColors.gold};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`

const Title = styled.div`
  max-width: 260px;
  margin-top: 8px;
  color: ${uxRebuildColors.text};
  font-size: 22px;
  font-weight: 720;
  line-height: 1.15;
`

const Flow = styled.div`
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
`

const Node = styled.div`
  min-width: 0;
  padding: 9px 8px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 9px;
  color: ${uxRebuildColors.secondary};
  background: rgba(255, 255, 255, 0.035);
  font-size: 10px;
  font-weight: 650;
  text-align: center;
`

export function DocsVisual({ variant }: { variant: DocsVisualVariant }) {
  const copy = COPY[variant]
  return (
    <Shell aria-hidden="true" data-docs-visual={variant}>
      <Eyebrow>{copy.eyebrow}</Eyebrow>
      <Title>{copy.title}</Title>
      <Flow>
        {copy.nodes.map((node) => (
          <Node key={node}>{node}</Node>
        ))}
      </Flow>
    </Shell>
  )
}

export default DocsVisual
