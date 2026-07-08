import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { ChevronDownIcon, ChevronUpIcon, Flex, Text } from '@pancakeswap/uikit'
import { Currency, TradeType } from '@pancakeswap/sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'
import {
  buildCapabilityManifest,
  prepareMelegaSmartRouterSwap,
  resolveSmartRouterPolicies,
} from 'lib/melega-smart-router'

const Panel = styled.div`
  margin: 10px 16px 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
`

const ToggleRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: #b8b8b8;
  font-size: 13px;
  cursor: pointer;
  text-align: left;

  &:hover {
    color: #f2f2f2;
  }
`

const Body = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => ($open ? '800px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  overflow: hidden;
  transition: max-height 300ms ease-in-out, opacity 200ms ease-in-out;
`

const Section = styled.div`
  padding: 0 14px 12px;
`

const SectionTitle = styled(Text)`
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8f8f8f;
  margin-bottom: 6px;
`

const JsonBlock = styled.pre`
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  font-size: 10px;
  line-height: 1.4;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow: auto;
`

type Props = {
  trade?: {
    inputAmount: { currency: Currency; toSignificant: (decimals?: number) => string }
    outputAmount: { currency: Currency; toSignificant: (decimals?: number) => string }
    tradeType?: TradeType
  } | null
}

export function DexExecutionDetailsPanel({ trade }: Props) {
  const [open, setOpen] = useState(false)
  const { chainId } = useActiveChainId()

  const payload = useMemo(() => {
    if (!trade || !chainId) return null

    const plan = prepareMelegaSmartRouterSwap({
      chainId,
      tradeType: trade.tradeType ?? TradeType.EXACT_INPUT,
      inputAmount: trade.inputAmount,
      outputAmount: trade.outputAmount,
    })

    return {
      executionManifest: plan.executionManifest,
      capabilityManifest: buildCapabilityManifest(chainId),
      policies: resolveSmartRouterPolicies(chainId),
      registrySource: plan.ok
        ? {
            marco: plan.marcoRegistry.source,
            collector: plan.collectorRegistry.source,
            registryVersion: plan.executionManifest.registryVersion,
          }
        : {
            registryVersion: plan.executionManifest.registryVersion,
          },
      wrapperPhase: plan.executionManifest.smartRouterPhase,
    }
  }, [trade, chainId])

  if (!payload) return null

  return (
    <Panel data-d87-execution-details>
      <ToggleRow type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>Execution Details</span>
        <Flex alignItems="center">
          {open ? <ChevronUpIcon width="16px" /> : <ChevronDownIcon width="16px" />}
        </Flex>
      </ToggleRow>
      <Body $open={open}>
        <Section>
          <SectionTitle>Execution Manifest</SectionTitle>
          <JsonBlock>{JSON.stringify(payload.executionManifest, null, 2)}</JsonBlock>
        </Section>
        <Section>
          <SectionTitle>Capability Manifest</SectionTitle>
          <JsonBlock>{JSON.stringify(payload.capabilityManifest, null, 2)}</JsonBlock>
        </Section>
        <Section>
          <SectionTitle>Current Policies</SectionTitle>
          <JsonBlock>{JSON.stringify(payload.policies, null, 2)}</JsonBlock>
        </Section>
        <Section>
          <SectionTitle>Registry Source · Wrapper Phase</SectionTitle>
          <JsonBlock>
            {JSON.stringify(
              { registrySource: payload.registrySource, wrapperPhase: payload.wrapperPhase },
              null,
              2,
            )}
          </JsonBlock>
        </Section>
      </Body>
    </Panel>
  )
}

export default DexExecutionDetailsPanel
