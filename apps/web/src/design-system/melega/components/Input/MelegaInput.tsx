import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { focusRing, layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaInputProps extends MelegaLayoutProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
}

const Field = styled.div<{
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing[2]};
  width: 100%;
  ${({ $margin }) => $margin && layoutStyles({ margin: $margin })}
`

const Label = styled.label`
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.textSecondary};
`

const Surface = styled.div<{
  $radius?: MelegaLayoutProps['radius']
  $error?: boolean
  $disabled?: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: ${spacing[1]};
  padding: ${spacing[3]} ${spacing[4]};
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid ${({ $error }) => ($error ? colors.red : colors.border)};
  border-radius: ${({ $radius }) => ($radius ? radius[$radius] : radius.lg)};
  transition: border-color ${animation.hover};
  box-shadow: none;

  &:focus-within {
    border-color: ${({ $error }) => ($error ? colors.red : colors.borderStrong)};
  }

  ${({ $disabled }) => $disabled && 'opacity: 0.45; pointer-events: none;'}
`

const InputEl = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.textPrimary};
  line-height: 1;
  width: 100%;
  box-shadow: none;

  &::placeholder {
    color: ${colors.textMuted};
  }

  ${focusRing}
`

const Hint = styled.span<{ $error?: boolean }>`
  font-size: ${typography.fontSize.sm};
  color: ${({ $error }) => ($error ? colors.red : colors.textMuted)};
`

export const MelegaInput: React.FC<MelegaInputProps> = ({
  label,
  hint,
  error,
  disabled,
  loading,
  padding,
  margin,
  radius: radiusToken,
  ...rest
}) => (
  <Field $margin={margin}>
    {label && <Label>{label}</Label>}
    <Surface $radius={radiusToken} $error={!!error} $disabled={disabled || loading}>
      <InputEl disabled={disabled || loading} aria-invalid={!!error} {...rest} />
      {(error || hint) && <Hint $error={!!error}>{error || hint}</Hint>}
    </Surface>
  </Field>
)

export default MelegaInput
