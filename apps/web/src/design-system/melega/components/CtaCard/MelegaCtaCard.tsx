import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
import { media } from '../../theme'
import { MelegaButton } from '../Button'

export interface MelegaCtaCardProps {
  visual?: React.ReactNode
  title: string
  description: string
  /** When set, the entire card (including visual) navigates to this href — no separate CTA row. */
  href?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  disabled?: boolean
  loading?: boolean
}

const cardStyles = `
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 14px;
  align-items: center;
  min-height: 136px;
  max-height: 136px;
  padding: 10px 18px;
  background: linear-gradient(90deg, rgba(244, 196, 48, 0.14) 0%, #101010 45%, #0b0b0b 100%);
  border: 1px solid rgba(244, 196, 48, 0.28);
  border-radius: 20px;
  box-shadow: none;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  transition:
    border-color 150ms ease,
    transform 150ms ease,
    filter 150ms ease;

  ${media.mobile} {
    grid-template-columns: 84px 1fr;
    gap: 14px;
    padding: 16px;
    min-height: auto;
    max-height: none;
    border-radius: 18px;
  }
`

const Card = styled.div`
  ${cardStyles}
`

const CardLink = styled(Link)<{ $interactive?: boolean }>`
  ${cardStyles}
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};

  ${({ $interactive }) =>
    $interactive &&
    `
    &:hover {
      border-color: rgba(244, 196, 48, 0.55);
      transform: translateY(-1px);
      filter: brightness(1.03);
    }
  `}
`

const Visual = styled.div`
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.mobile} {
    width: 84px;
    height: 84px;
  }
`

const Body = styled.div`
  min-width: 0;
`

const Title = styled.h3`
  margin: 0 0 2px;
  font-family: ${typography.fontFamily.body};
  font-size: 30px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1.1;

  ${media.mobile} {
    font-size: 18px;
  }
`

const Desc = styled.p`
  margin: 0;
  font-size: 14px;
  color: #b3b3b3;
  line-height: 1.45;
  max-width: 520px;

  ${media.mobile} {
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;

  ${media.mobile} {
    flex-direction: column;
  }
`

const ActionLink = styled(Link)<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  width: auto;
  min-width: ${({ $variant }) => ($variant === 'secondary' ? '220px' : '190px')};
  max-width: 100%;
  padding: 0 20px;
  height: 44px;
  min-height: 44px;
  border-radius: 12px;
  font-family: ${typography.fontFamily.body};
  font-size: 14px;
  font-weight: ${typography.fontWeight.bold};
  white-space: nowrap;
  box-sizing: border-box;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    filter 150ms ease,
    transform 150ms ease;

  ${({ $variant }) =>
    $variant === 'secondary'
      ? `
    background: transparent;
    color: ${colors.gold};
    border: 1px solid rgba(244, 196, 48, 0.55);

    &:hover {
      border-color: ${colors.gold};
      background: ${colors.goldSoft};
    }
  `
      : `
    background: linear-gradient(180deg, ${colors.goldHover} 0%, ${colors.gold} 100%);
    color: ${colors.canvas};
    border: 1px solid ${colors.gold};

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
  `}

  ${media.mobile} {
    width: 100%;
  }
`

const CardContent: React.FC<{
  visual?: React.ReactNode
  title: string
  description: string
  showActions: boolean
  primaryAction?: MelegaCtaCardProps['primaryAction']
  secondaryAction?: MelegaCtaCardProps['secondaryAction']
  disabled?: boolean
  loading?: boolean
}> = ({
  visual,
  title,
  description,
  showActions,
  primaryAction,
  secondaryAction,
  disabled,
  loading,
}) => (
  <>
    {visual && <Visual>{visual}</Visual>}
    <Body>
      <Title>{title}</Title>
      <Desc>{description}</Desc>
      {showActions && (
        <Actions>
          {primaryAction &&
            (primaryAction.href ? (
              <ActionLink href={primaryAction.href} $variant="primary">
                {primaryAction.label}
              </ActionLink>
            ) : (
              <MelegaButton variant="primary" disabled={disabled} loading={loading} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </MelegaButton>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <ActionLink href={secondaryAction.href} $variant="secondary">
                {secondaryAction.label}
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
      )}
    </Body>
  </>
)

export const MelegaCtaCard: React.FC<MelegaCtaCardProps> = ({
  visual,
  title,
  description,
  href,
  primaryAction,
  secondaryAction,
  disabled,
  loading,
}) => {
  const cardStyle = { opacity: disabled ? 0.45 : 1 }

  if (href && !disabled) {
    return (
      <CardLink href={href} $interactive style={cardStyle} data-melega-cta-card-link>
        <CardContent visual={visual} title={title} description={description} showActions={false} />
      </CardLink>
    )
  }

  return (
    <Card style={cardStyle}>
      <CardContent
        visual={visual}
        title={title}
        description={description}
        showActions={Boolean(primaryAction || secondaryAction)}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        disabled={disabled}
        loading={loading}
      />
    </Card>
  )
}

export default MelegaCtaCard
