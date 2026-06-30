import React, { useState } from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Wrap = styled.div`
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  background: ${tokens.surface};
  overflow: hidden;
`

const Toggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: ${tokens.fontDisplay};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${tokens.gold};
  text-align: left;

  &:hover {
    color: ${tokens.goldHighlight};
  }
`

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 12px;
  color: ${tokens.textSecondary};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0')});
  transition: transform ${tokens.transition};
`

const Content = styled.div`
  padding: 0 18px 18px;
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
  border-top: 1px solid ${tokens.border};
`

export interface EconomicDetailToggleProps {
  title?: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export const EconomicDetailToggle: React.FC<EconomicDetailToggleProps> = ({
  title = 'Technical details',
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Wrap>
      <Toggle type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <Chevron $open={open}>▼</Chevron>
      </Toggle>
      {open && <Content>{children}</Content>}
    </Wrap>
  )
}

export default EconomicDetailToggle
