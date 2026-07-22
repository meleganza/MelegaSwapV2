import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius, animation, ds001Buttons, ds001Colors } from '../../tokens'
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

/** DS001.1 §14 button variants — solid primary, no gradients. */
const variantStyles: Record<MelegaButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background: ${ds001Buttons.primary.background};
    color: ${ds001Buttons.primary.color};
    border: 1px solid ${ds001Buttons.primary.background};

    &:hover:not(:disabled) {
      background: ${ds001Buttons.primary.hoverBackground};
      border-color: ${ds001Buttons.primary.hoverBackground};
    }

    &:active:not(:disabled) {
      background: ${ds001Buttons.primary.pressedBackground};
      border-color: ${ds001Buttons.primary.pressedBackground};
    }
  `,
  secondary: css`
    background: ${ds001Buttons.secondary.background};
    color: ${colors.textPrimary};
    border: ${ds001Buttons.secondary.border};

    &:hover:not(:disabled) {
      background: ${ds001Buttons.secondary.hoverBackground};
    }
  `,
  ghost: css`
    background: ${ds001Buttons.ghost.background};
    color: ${colors.textSecondary};
    border: none;

    &:hover:not(:disabled) {
      color: ${colors.textPrimary};
      background: ${ds001Buttons.ghost.hoverBackground};
    }
  `,
  danger: css`
    background: rgba(239, 68, 68, 0.12);
    color: ${ds001Colors.danger};
    border: 1px solid rgba(239, 68, 68, 0.45);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: ${ds001Colors.danger};
    }
  `,
  disabled: css`
    background: ${ds001Buttons.primary.disabledBackground};
    color: ${ds001Buttons.primary.disabledColor};
    border: 1px solid ${ds001Colors.border};
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
  min-height: ${ds001Buttons.height};
  height: ${ds001Buttons.height};
  padding: 0 ${spacing[5]};
  border-radius: ${radius.button};
  font-family: ${typography.fontFamily.body};
  font-size: ${ds001Buttons.fontSize};
  font-weight: ${ds001Buttons.fontWeight};
  line-height: ${typography.lineHeight.tight};
  white-space: nowrap;
  cursor: pointer;
  transition:
    background ${animation.hover},
    border-color ${animation.hover},
    color ${animation.hover};
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

  ${media.mobile} {
    min-height: ${ds001Buttons.height};
    font-size: ${ds001Buttons.fontSize};
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
