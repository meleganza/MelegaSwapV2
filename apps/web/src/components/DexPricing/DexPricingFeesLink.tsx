import Link from 'next/link'
import styled from 'styled-components'

const StyledLink = styled(Link)`
  font-size: 12px;
  color: #d4af37;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function DexPricingFeesLink({ label = 'Pricing & Fees' }: { label?: string }) {
  return (
    <StyledLink href="/pricing-fees" data-d87-pricing-fees-link>
      {label}
    </StyledLink>
  )
}

export default DexPricingFeesLink
