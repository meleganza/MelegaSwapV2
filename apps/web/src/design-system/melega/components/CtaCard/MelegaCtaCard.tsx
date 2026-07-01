import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors, typography, radius } from '../../tokens'
import { media } from '../../theme'
import { MelegaButton } from '../Button'

export interface MelegaCtaCardProps {
  visual?: React.ReactNode
  title: string
  description: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; href?: string; onClick?: () => void }
  disabled?: boolean
  loading?: boolean
}

const Card = styled.div`
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 24px;
  align-items: center;
  min-height: 190px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.16), #111111 42%, #080808 100%);
  border: 1px solid rgba(212, 175, 55, 0.42);
  border-radius: 18px;
  box-shadow: none;

  ${media.mobile} {
    grid-template-columns: 84px 1fr;
    gap: 14px;
    padding: 16px;
    min-height: auto;
    border-radius: 18px;
  }
`

const Visual = styled.div`
  width: 120px;
  height: 120px;
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
  margin: 0 0 6px;
  font-family: ${typography.fontFamily.body};
  font-size: 26px;
  font-weight: ${typography.fontWeight.heavy};
  color: ${colors.textPrimary};
  line-height: 1.1;

  ${media.mobile} {
    font-size: 18px;
  }
`

const Desc = styled.p`
  margin: 0;
  font-size: 15px;
  color: #c8c8c8;
  line-height: 1.45;
  max-width: 520px;

  ${media.mobile} {
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;

  ${media.mobile} {
    flex-direction: column;
  }
`

const ActionLink = styled(Link)`
  text-decoration: none;

  ${media.mobile} {
    width: 100%;
  }
`

const PrimaryBtn = styled(MelegaButton)`
  width: 170px;
  height: 44px;
  min-height: 44px;
  border-radius: 12px;
  font-size: 14px;

  ${media.mobile} {
    width: 100%;
  }
`

const SecondaryBtn = styled(MelegaButton)`
  width: 210px;
  height: 44px;
  min-height: 44px;
  border-radius: 12px;
  font-size: 14px;

  ${media.mobile} {
    width: 100%;
  }
`

export const MelegaCtaCard: React.FC<MelegaCtaCardProps> = ({
  visual,
  title,
  description,
  primaryAction,
  secondaryAction,
  disabled,
  loading,
}) => (
  <Card style={{ opacity: disabled ? 0.45 : 1 }}>
    {visual && <Visual>{visual}</Visual>}
    <Body>
      <Title>{title}</Title>
      <Desc>{description}</Desc>
      <Actions>
        {primaryAction &&
          (primaryAction.href ? (
            <ActionLink href={primaryAction.href}>
              <PrimaryBtn variant="primary" disabled={disabled} loading={loading} as="span">
                {primaryAction.label}
              </PrimaryBtn>
            </ActionLink>
          ) : (
            <PrimaryBtn variant="primary" disabled={disabled} loading={loading} onClick={primaryAction.onClick}>
              {primaryAction.label}
            </PrimaryBtn>
          ))}
        {secondaryAction &&
          (secondaryAction.href ? (
            <ActionLink href={secondaryAction.href}>
              <SecondaryBtn variant="secondary" disabled={disabled} loading={loading} as="span">
                {secondaryAction.label}
              </SecondaryBtn>
            </ActionLink>
          ) : (
            <SecondaryBtn
              variant="secondary"
              disabled={disabled}
              loading={loading}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </SecondaryBtn>
          ))}
      </Actions>
    </Body>
  </Card>
)

export default MelegaCtaCard
