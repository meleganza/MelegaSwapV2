/**
 * Compact next-action strip for page headers.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const Strip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 0 0 12px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
  color: #cfcfcf;
`

const Label = styled.span`
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 10px;
`

const Cta = styled(Link)`
  color: #f2c84c;
  font-weight: 750;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

const Secondary = styled(Link)`
  color: #9ec9ff;
  font-weight: 650;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`

export type PageNextActionProps = {
  here: string
  nextLabel: string
  nextHref: string
  secondaryLabel?: string
  secondaryHref?: string
  testId?: string
}

export const PageNextAction: React.FC<PageNextActionProps> = ({
  here,
  nextLabel,
  nextHref,
  secondaryLabel,
  secondaryHref,
  testId = 'page-next-action',
}) => (
  <Strip data-testid={testId} role="navigation" aria-label="Page next action">
    <Label>Here</Label>
    <span data-testid={`${testId}-here`}>{here}</span>
    <Label>Next</Label>
    <Cta href={nextHref} data-testid={`${testId}-next`}>
      {nextLabel}
    </Cta>
    {secondaryLabel && secondaryHref ? (
      <Secondary href={secondaryHref} data-testid={`${testId}-secondary`}>
        {secondaryLabel}
      </Secondary>
    ) : null}
  </Strip>
)

export default PageNextAction
