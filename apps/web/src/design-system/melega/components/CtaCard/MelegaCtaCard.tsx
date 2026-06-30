import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { media } from '../../theme'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'
import { MelegaButton } from '../Button'

export interface MelegaCtaCardProps extends MelegaLayoutProps {
  visual?: React.ReactNode
  title: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
}

const Card = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: flex;
  align-items: center;
  gap: ${spacing[6]};
  min-height: 138px;
  padding: ${spacing[6]};
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.16), ${colors.surface2} 42%, ${colors.surface1});
  border: 1px solid rgba(212, 175, 55, 0.48);
  border-radius: ${radius.xl};
  box-shadow: none;

  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  ${media.mobile} {
    display: grid;
    grid-template-columns: 82px 1fr;
    gap: ${spacing[4]};
    padding: ${spacing[4]};
    min-height: auto;
  }
`

const Visual = styled.div`
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.mobile} {
    width: 82px;
    height: 82px;
  }
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 ${spacing[2]};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
  line-height: ${typography.lineHeight.tight};

  ${media.mobile} {
    font-size: ${typography.fontSize.xl};
  }
`

const Desc = styled.p`
  margin: 0;
  font-size: ${typography.fontSize.base};
  color: ${colors.textSecondary};
  line-height: ${typography.lineHeight.normal};
  max-width: 470px;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[3]};
  margin-top: ${spacing[4]};
`

const ActionLink = styled(Link)`
  text-decoration: none;
`

export const MelegaCtaCard: React.FC<MelegaCtaCardProps> = ({
  visual,
  title,
  description,
  primaryAction,
  secondaryAction,
  padding,
  margin,
  radius: radiusToken,
  disabled,
  loading,
}) => (
  <Card $padding={padding} $margin={margin} $radius={radiusToken} style={{ opacity: disabled ? 0.45 : 1 }}>
    {visual && <Visual>{visual}</Visual>}
    <Body>
      <Title>{title}</Title>
      <Desc>{description}</Desc>
      <Actions>
        {primaryAction &&
          (primaryAction.href ? (
            <ActionLink href={primaryAction.href}>
              <MelegaButton variant="primary" disabled={disabled} loading={loading} as="span">
                {primaryAction.label}
              </MelegaButton>
            </ActionLink>
          ) : (
            <MelegaButton variant="primary" disabled={disabled} loading={loading} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </MelegaButton>
          ))}
        {secondaryAction &&
          (secondaryAction.href ? (
            <ActionLink href={secondaryAction.href}>
              <MelegaButton variant="secondary" disabled={disabled} loading={loading} as="span">
                {secondaryAction.label}
              </MelegaButton>
            </ActionLink>
          ) : (
            <MelegaButton
              variant="secondary"
              disabled={disabled}
              loading={loading}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </MelegaButton>
          ))}
      </Actions>
    </Body>
  </Card>
)

export default MelegaCtaCard
