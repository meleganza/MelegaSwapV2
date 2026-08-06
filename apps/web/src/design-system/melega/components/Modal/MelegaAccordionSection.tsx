/**
 * Compact accordion section for Melega creation modals.
 */
import React from 'react'
import styled from 'styled-components'
import { uxRebuildColors, uxRebuildFont } from '../../tokens/uxRebuild'

const Root = styled.div<{ $open: boolean }>`
  border-radius: 12px;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(244, 196, 48, 0.35)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $open }) => ($open ? 'rgba(244, 196, 48, 0.05)' : 'rgba(255, 255, 255, 0.02)')};
  overflow: hidden;
  font-family: ${uxRebuildFont};
  transition: border-color 150ms ease, background 150ms ease;
`

const Trigger = styled.button`
  appearance: none;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 10px 14px;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  color: ${uxRebuildColors.text};
`

const Label = styled.span`
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.02em;
`

const Meta = styled.span`
  font-size: 12px;
  color: ${uxRebuildColors.secondary};
  margin-left: 8px;
  font-weight: 600;
`

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 12px;
  color: ${uxRebuildColors.gold};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  transition: transform 150ms ease;
`

const Panel = styled.div`
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export type MelegaAccordionSectionProps = {
  id: string
  title: string
  summary?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
  testId?: string
}

export const MelegaAccordionSection: React.FC<MelegaAccordionSectionProps> = ({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
  testId,
}) => (
  <Root $open={open} data-melega-accordion={id} data-open={open ? 'true' : 'false'} data-testid={testId}>
    <Trigger type="button" aria-expanded={open} onClick={onToggle} data-testid={testId ? `${testId}-trigger` : undefined}>
      <span>
        <Label>{title}</Label>
        {summary ? <Meta>{summary}</Meta> : null}
      </span>
      <Chevron $open={open} aria-hidden>
        ▾
      </Chevron>
    </Trigger>
    {open && children != null ? <Panel>{children}</Panel> : null}
  </Root>
)

export default MelegaAccordionSection
