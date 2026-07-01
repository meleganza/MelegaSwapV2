import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { media } from '../../theme'
import { disabledStyles, focusRing, layoutStyles, loadingStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export type MelegaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'disabled'

export interface MelegaButtonProps extends MelegaLayoutProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: MelegaButtonVariant
  fullWidth?: boolean
  active?: boolean
  children: React.ReactNode
  as?: React.ElementType
}

const variantStyles: Record<MelegaButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: linear-gradient(180deg, ${colors.goldHover} 0%, ${colors.gold} 100%);
    color: ${colors.canvas};
    border: 1px solid ${colors.gold};

    &:hover:not(:disabled) {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
  `,
  secondary: css`
    background: transparent;
    color: ${colors.gold};
    border: 1px solid rgba(212, 175, 55, 0.55);

    &:hover:not(:disabled) {
      border-color: ${colors.gold};
      background: ${colors.goldSoft};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${colors.textSecondary};
    border: 1px solid ${colors.border};

    &:hover:not(:disabled) {
      color: ${colors.textPrimary};
      border-color: ${colors.borderStrong};
      background: rgba(255, 255, 255, 0.04);
    }
  `,
  danger: css`
    background: rgba(239, 68, 68, 0.12);
    color: ${colors.red};
    border: 1px solid rgba(239, 68, 68, 0.45);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: ${colors.red};
    }
  `,
  disabled: css`
    background: ${colors.surface3};
    color: ${colors.textMuted};
    border: 1px solid ${colors.border};
  `,
}

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['$variant', '$fullWidth', '$active', '$loading', '$disabled', '$padding', '$margin', '$radius'].includes(prop),
})<{
  $variant: MelegaButtonVariant
  $fullWidth?: boolean
  $active?: boolean
  $loading?: boolean
  $disabled?: boolean
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing[2]};
  min-height: 40px;
  padding: 0 ${spacing[5]};
  border-radius: ${radius.md};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.bold};
  line-height: ${typography.lineHeight.tight};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background ${animation.hover},
    border-color ${animation.hover},
    color ${animation.hover},
    transform ${animation.hover};
  box-shadow: none;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $active }) =>
    $active &&
    css`
      border-color: ${colors.gold};
      background: ${colors.goldSoft};
    `}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}
  ${({ $loading }) => $loading && loadingStyles}
  ${({ $disabled, $variant }) => ($disabled || $variant === 'disabled') && disabledStyles}
  ${focusRing}

  &:active:not(:disabled) {
    transform: scale(0.985);
  }

  ${media.mobile} {
    min-height: 44px;
    font-size: ${typography.fontSize.lg};
  }
`

export const MelegaButton: React.FC<MelegaButtonProps> = ({
  variant = 'primary',
  fullWidth,
  active,
  disabled,
  loading,
  padding,
  margin,
  radius: radiusToken,
  children,
  as,
  ...rest
}) => (
  <StyledButton
    as={as}
    type={as ? undefined : 'button'}
    $variant={disabled ? 'disabled' : variant}
    $fullWidth={fullWidth}
    $active={active}
    $loading={loading}
    $disabled={disabled}
    $padding={padding}
    $margin={margin}
    $radius={radiusToken}
    disabled={disabled || loading || variant === 'disabled'}
    {...rest}
  >
    {loading ? '…' : children}
  </StyledButton>
)

export default MelegaButton
