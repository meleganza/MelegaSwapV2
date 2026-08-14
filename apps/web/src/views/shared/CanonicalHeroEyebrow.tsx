import React from 'react'
import styled from 'styled-components'

export type CanonicalHeroIcon = 'swap' | 'liquidity' | 'bridge' | 'farms' | 'pools' | 'discover'

const Row = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  color: #f4c430;
  font-size: 11px;
  line-height: 16px;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Mark = styled.svg`
  width: 14px;
  height: 14px;
  flex: 0 0 14px;
  overflow: visible;
  color: currentColor;
`

function HeroMark({ icon }: { icon: CanonicalHeroIcon }) {
  if (icon === 'swap') {
    return (
      <Mark viewBox="0 0 16 16" aria-hidden="true">
        <path d="M9.4 1.5 4.2 8h3.2l-.8 6.5L11.8 8H8.6l.8-6.5Z" fill="currentColor" />
      </Mark>
    )
  }
  if (icon === 'liquidity') {
    return (
      <Mark viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 1.4c2.5 3 4.3 5.2 4.3 8A4.3 4.3 0 1 1 3.7 9.4c0-2.8 1.8-5 4.3-8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5.7 10.2c.5 1.1 1.3 1.6 2.5 1.6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
      </Mark>
    )
  }
  if (icon === 'bridge') {
    return (
      <Mark viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M2 5h10m0 0L9.5 2.5M12 5 9.5 7.5M14 11H4m0 0 2.5-2.5M4 11l2.5 2.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </Mark>
    )
  }
  if (icon === 'farms') {
    return (
      <Mark viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M8 14V7.5M8 8C6.7 5 4.8 3.7 2.3 4c.3 2.8 2.1 4.4 5.7 4ZM8 10c1.2-2.8 3.1-4.2 5.7-4-.3 2.8-2.2 4.3-5.7 4Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </Mark>
    )
  }
  if (icon === 'pools') {
    return (
      <Mark viewBox="0 0 16 16" aria-hidden="true">
        <ellipse cx="8" cy="4" rx="5" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M3 4v4c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V4M3 8v4c0 1.2 2.2 2.2 5 2.2s5-1 5-2.2V8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </Mark>
    )
  }
  return (
    <Mark viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.5 9.2 5 12.5 6.2 9.2 7.4 8 11 6.8 7.4 3.5 6.2 6.8 5 8 1.5ZM13 10l.5 1.5L15 12l-1.5.5L13 14l-.5-1.5L11 12l1.5-.5L13 10Z"
        fill="currentColor"
      />
    </Mark>
  )
}

export const CanonicalHeroEyebrow: React.FC<React.PropsWithChildren<{ icon: CanonicalHeroIcon }>> = ({
  icon,
  children,
}) => (
  <Row>
    <HeroMark icon={icon} />
    <span>{children}</span>
  </Row>
)

export default CanonicalHeroEyebrow
