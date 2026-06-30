import React, { useState } from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Wrap = styled.div<{ $variant: 'default' | 'ai' }>`
  border: 1px solid ${({ $variant }) => ($variant === 'ai' ? tokens.border : tokens.border)};
  border-radius: ${tokens.radius};
  background: ${({ $variant }) => ($variant === 'ai' ? tokens.surfaceSecondary : tokens.surface)};
  overflow: hidden;
`

const Toggle = styled.button<{ $variant: 'default' | 'ai' }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: ${tokens.fontBody};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $variant }) => ($variant === 'ai' ? tokens.textSecondary : tokens.text)};
  text-align: left;

  &:hover {
    color: ${tokens.text};
  }
`

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 11px;
  color: ${tokens.textSecondary};
  transform: rotate(${({ $open }) => ($open ? '180deg' : '0')});
  transition: transform ${tokens.transition};
`

const Content = styled.div`
  padding: 0 24px 24px;
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
  border-top: 1px solid ${tokens.border};
`

export interface EconomicDetailToggleProps {
  title?: string
  children: React.ReactNode
  defaultOpen?: boolean
  variant?: 'default' | 'ai'
}

export const EconomicDetailToggle: React.FC<EconomicDetailToggleProps> = ({
  title = 'Technical details',
  children,
  defaultOpen = false,
  variant = 'default',
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Wrap $variant={variant}>
      <Toggle type="button" $variant={variant} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <Chevron $open={open}>▼</Chevron>
      </Toggle>
      {open && <Content>{children}</Content>}
    </Wrap>
  )
}

export default EconomicDetailToggle
