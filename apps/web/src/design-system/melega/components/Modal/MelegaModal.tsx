/**
 * Canonical Melega modal shell — shared radius, shadow, spacing, header, close, animation.
 * Premium Web3 glass/dark surface. No business logic.
 */
import React, { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { uxRebuildColors, uxRebuildFont, uxRebuildRadius, uxRebuildShadow } from '../../tokens/uxRebuild'

export const melegaModalTokens = {
  radius: uxRebuildRadius.panel, // 20px
  shadow: uxRebuildShadow.elevated,
  overlay: 'rgba(0, 0, 0, 0.72)',
  surface:
    'linear-gradient(165deg, rgba(22, 22, 22, 0.97) 0%, rgba(12, 12, 12, 0.98) 55%, rgba(10, 10, 10, 0.99) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  headerPad: '18px 20px 14px',
  bodyPad: '0 20px 20px',
  closeSize: '36px',
  maxWidthSm: '440px',
  maxWidthMd: '720px',
  maxWidthLg: '960px',
  zIndex: 10040,
} as const

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${melegaModalTokens.zIndex};
  background: ${melegaModalTokens.overlay};
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 14px;
  overflow-y: auto;
  animation: ${fadeIn} 160ms ease-out;
  font-family: ${uxRebuildFont};
`

const Panel = styled.div<{ $maxWidth: string; $flush?: boolean }>`
  width: min(${({ $maxWidth }) => $maxWidth}, 100%);
  margin: auto;
  position: relative;
  border-radius: ${melegaModalTokens.radius};
  border: ${melegaModalTokens.border};
  background: ${melegaModalTokens.surface};
  box-shadow: ${melegaModalTokens.shadow};
  color: ${uxRebuildColors.text};
  overflow: hidden;
  animation: ${riseIn} 180ms ease-out;
  box-sizing: border-box;

  ${({ $flush }) =>
    $flush
      ? ''
      : `
    display: flex;
    flex-direction: column;
    max-height: min(92vh, 900px);
  `}
`

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: ${melegaModalTokens.headerPad};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-right: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 17px;
  line-height: 22px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: ${uxRebuildColors.secondary};
`

const CloseBtn = styled.button`
  appearance: none;
  cursor: pointer;
  flex-shrink: 0;
  width: ${melegaModalTokens.closeSize};
  height: ${melegaModalTokens.closeSize};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: ${uxRebuildColors.text};
  font-size: 18px;
  line-height: 1;
  font-weight: 500;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;

  &:hover {
    border-color: rgba(244, 196, 48, 0.45);
    background: rgba(244, 196, 48, 0.1);
  }

  &:active {
    transform: scale(0.96);
  }
`

const Body = styled.div<{ $flush?: boolean }>`
  padding: ${({ $flush }) => ($flush ? '0' : melegaModalTokens.bodyPad)};
  overflow-y: auto;
  min-height: 0;
  flex: 1;
`

export type MelegaModalSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<MelegaModalSize, string> = {
  sm: melegaModalTokens.maxWidthSm,
  md: melegaModalTokens.maxWidthMd,
  lg: melegaModalTokens.maxWidthLg,
}

export type MelegaModalProps = {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  size?: MelegaModalSize
  /** Hide built-in header; caller owns chrome (still shows close if showClose). */
  hideHeader?: boolean
  showClose?: boolean
  closeLabel?: string
  /** When true, body has no padding and panel does not constrain height flex. */
  flush?: boolean
  testId?: string
  ariaLabel?: string
  closeTestId?: string
  zIndex?: number
}

export const MelegaModal: React.FC<MelegaModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideHeader = false,
  showClose = true,
  closeLabel = 'Close',
  flush = false,
  testId,
  ariaLabel,
  closeTestId,
  zIndex,
}) => {
  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const labelledBy = typeof title === 'string' ? undefined : undefined

  return (
    <Overlay
      role="presentation"
      style={zIndex != null ? { zIndex } : undefined}
      onClick={onClose}
      data-melega-modal-overlay="true"
    >
      <Panel
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        aria-labelledby={labelledBy}
        $maxWidth={SIZE_MAP[size]}
        $flush={flush}
        data-testid={testId}
        data-melega-modal="true"
        data-melega-modal-size={size}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (title || showClose) ? (
          <Header data-melega-modal-header="true">
            <TitleBlock>
              {title ? <Title data-melega-modal-title="true">{title}</Title> : null}
              {subtitle ? <Subtitle data-melega-modal-subtitle="true">{subtitle}</Subtitle> : null}
            </TitleBlock>
            {showClose ? (
              <CloseBtn
                type="button"
                aria-label={closeLabel}
                data-testid={closeTestId}
                data-melega-modal-close="true"
                onClick={onClose}
              >
                ×
              </CloseBtn>
            ) : null}
          </Header>
        ) : showClose && hideHeader ? (
          <CloseBtn
            type="button"
            aria-label={closeLabel}
            data-testid={closeTestId}
            data-melega-modal-close="true"
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
          >
            ×
          </CloseBtn>
        ) : null}
        <Body $flush={flush} data-melega-modal-body="true">
          {children}
        </Body>
      </Panel>
    </Overlay>
  )
}

export default MelegaModal
