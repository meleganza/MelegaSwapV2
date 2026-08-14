/**
 * Canonical Melega Modal Design System V3 — premium compact popup shell.
 * Shared by Create Farm, Create Pool, Network Switch, and product modals.
 * Width 680–760px (md) · max-height min(82vh, 760px) · brand header · sticky footer · focus trap.
 */
import React, { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components'
import { MelegaLogoSvg } from '../BrandLockup/MelegaLogoSvg'
import { uxRebuildColors, uxRebuildFont, uxRebuildRadius, uxRebuildShadow } from '../../tokens/uxRebuild'
import { melegaZIndex } from '../../tokens/melegaZIndex'

export const melegaModalTokens = {
  radius: uxRebuildRadius.panel,
  shadow: `${uxRebuildShadow.elevated}, 0 0 0 1px rgba(221, 185, 47, 0.06), 0 24px 48px rgba(0, 0, 0, 0.55)`,
  overlay: 'rgba(0, 0, 0, 0.74)',
  surface:
    'radial-gradient(ellipse 90% 55% at 12% -10%, rgba(221, 185, 47, 0.09), transparent 52%), linear-gradient(165deg, rgba(22, 22, 22, 0.98) 0%, rgba(12, 12, 12, 0.99) 55%, rgba(8, 8, 8, 1) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  headerPad: '12px 14px 10px',
  bodyPad: '0 14px 12px',
  footerPad: '10px 14px 12px',
  closeSize: '36px',
  /** Compact dialogs (network). */
  maxWidthSm: '480px',
  /** Premium create / workflow modals — 680–760px band. */
  maxWidthMd: '740px',
  maxWidthLg: '760px',
  maxHeight: 'min(82vh, 760px)',
  /** Canonical overlay layer — must portal outside header/ticker stacking contexts. */
  zIndex: melegaZIndex.overlay,
} as const

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const riseIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`

const sheetIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
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
  padding: 16px 12px;
  overflow: hidden;
  animation: ${fadeIn} 160ms ease-out;
  font-family: ${uxRebuildFont};
  ${reducedMotion}

  @media (max-width: 639px) {
    align-items: flex-end;
    padding: 0;
  }
`

const Panel = styled.div<{ $maxWidth: string }>`
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
  display: flex;
  flex-direction: column;
  max-height: ${melegaModalTokens.maxHeight};
  outline: none;
  ${reducedMotion}

  @media (max-width: 639px) {
    width: 100%;
    max-width: 100%;
    margin: 0;
    max-height: min(92vh, 760px);
    border-radius: 18px 18px 0 0;
    animation: ${sheetIn} 200ms ease-out;
  }
`

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: ${melegaModalTokens.headerPad};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(180deg, rgba(18, 18, 18, 0.98), rgba(14, 14, 14, 0.96));
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
  min-width: 0;
`

const BrandRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  flex: 1;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  padding-right: 4px;
`

const BrandLabel = styled.span`
  display: inline-flex;
  align-items: baseline;
  margin-bottom: 1px;
  font-size: 12px;
  line-height: 15px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.9);

  strong {
    color: #f4c430;
    font-weight: 800;
  }
`

const BrandMark = styled.div`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 20px;
  font-weight: 750;
  color: ${uxRebuildColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  color: ${uxRebuildColors.secondary};
`

const CloseBtn = styled.button`
  appearance: none;
  cursor: pointer;
  flex-shrink: 0;
  width: ${melegaModalTokens.closeSize};
  height: ${melegaModalTokens.closeSize};
  min-width: 44px;
  min-height: 44px;
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
  ${reducedMotion}

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
    background: rgba(221, 185, 47, 0.1);
  }

  &:active {
    transform: scale(0.96);
  }
`

const Body = styled.div<{ $flush?: boolean }>`
  padding: ${({ $flush }) => ($flush ? '0' : melegaModalTokens.bodyPad)};
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  flex: 1;
  -webkit-overflow-scrolling: touch;
`

const Footer = styled.footer`
  flex-shrink: 0;
  padding: ${melegaModalTokens.footerPad};
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(0deg, rgba(10, 10, 10, 0.98), rgba(14, 14, 14, 0.94));
  position: sticky;
  bottom: 0;
  z-index: 2;
`

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
`

const StepDot = styled.span<{ $active?: boolean; $done?: boolean }>`
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  border: 1px solid
    ${({ $active, $done }) =>
      $active ? 'rgba(221, 185, 47, 0.5)' : $done ? 'rgba(109, 220, 140, 0.35)' : 'rgba(255,255,255,0.1)'};
  color: ${({ $active, $done }) =>
    $active ? uxRebuildColors.gold : $done ? uxRebuildColors.positive : uxRebuildColors.secondary};
  background: ${({ $active }) => ($active ? 'rgba(221, 185, 47, 0.1)' : 'transparent')};
`

export type MelegaModalSize = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<MelegaModalSize, string> = {
  sm: melegaModalTokens.maxWidthSm,
  md: melegaModalTokens.maxWidthMd,
  lg: melegaModalTokens.maxWidthLg,
}

export type MelegaModalStep = {
  id: string
  label: string
  done?: boolean
  active?: boolean
}

export type MelegaModalProps = {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children: React.ReactNode
  /** Sticky footer actions — always visible inside the panel. */
  footer?: React.ReactNode
  /** Optional step chips under the subtitle. */
  steps?: MelegaModalStep[]
  /** Optional contextual identity or action aligned opposite the modal brand. */
  headerAccessory?: React.ReactNode
  size?: MelegaModalSize
  showBrand?: boolean
  hideHeader?: boolean
  showClose?: boolean
  closeLabel?: string
  flush?: boolean
  /** When false, backdrop click does not close (e.g. pending irreversible op). */
  closeOnBackdrop?: boolean
  /** When false, Escape does not close. */
  closeOnEscape?: boolean
  testId?: string
  ariaLabel?: string
  closeTestId?: string
  zIndex?: number
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
}

export const MelegaModal: React.FC<MelegaModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  steps,
  headerAccessory,
  size = 'md',
  showBrand = true,
  hideHeader = false,
  showClose = true,
  closeLabel = 'Close',
  flush = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  testId,
  ariaLabel,
  closeTestId,
  zIndex,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current
      if (!panel) return
      const focusables = getFocusable(panel)
      const closeBtn = panel.querySelector<HTMLElement>('[data-melega-modal-close="true"]')
      ;(focusables[0] || closeBtn || panel).focus()
    }, 20)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation()
        requestClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = getFocusable(panelRef.current)
      if (focusables.length === 0) {
        e.preventDefault()
        panelRef.current.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus?.()
    }
  }, [open, closeOnEscape, requestClose])

  if (!open) return null

  const portalTarget = typeof document !== 'undefined' ? document.getElementById('portal-root') ?? document.body : null

  const modalTree = (
    <Overlay
      role="presentation"
      style={{ zIndex: zIndex ?? melegaModalTokens.zIndex }}
      onClick={() => {
        if (closeOnBackdrop) requestClose()
      }}
      data-melega-modal-overlay="true"
      data-melega-layer="overlay"
    >
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        $maxWidth={SIZE_MAP[size]}
        data-testid={testId}
        data-melega-modal="true"
        data-melega-modal-size={size}
        data-melega-modal-system="v3"
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (title || showClose) ? (
          <Header data-melega-modal-header="true">
            <BrandRow>
              {showBrand ? (
                <BrandMark data-melega-modal-brand="true" aria-hidden>
                  <MelegaLogoSvg size={28} />
                </BrandMark>
              ) : null}
              <TitleBlock>
                {showBrand ? (
                  <BrandLabel data-melega-modal-brand-label="true">
                    Melega<strong>DEX</strong>
                  </BrandLabel>
                ) : null}
                {title ? (
                  <Title id={titleId} data-melega-modal-title="true">
                    {title}
                  </Title>
                ) : null}
                {subtitle ? <Subtitle data-melega-modal-subtitle="true">{subtitle}</Subtitle> : null}
                {steps && steps.length > 0 ? (
                  <StepRow data-melega-modal-steps="true" aria-label="Progress">
                    {steps.map((s) => (
                      <StepDot key={s.id} $active={s.active} $done={s.done}>
                        {s.label}
                      </StepDot>
                    ))}
                  </StepRow>
                ) : null}
              </TitleBlock>
            </BrandRow>
            {headerAccessory || showClose ? (
              <HeaderActions data-melega-modal-header-actions="true">
                {headerAccessory}
                {showClose ? (
                  <CloseBtn
                    type="button"
                    aria-label={closeLabel}
                    data-testid={closeTestId}
                    data-melega-modal-close="true"
                    onClick={requestClose}
                  >
                    ×
                  </CloseBtn>
                ) : null}
              </HeaderActions>
            ) : null}
          </Header>
        ) : showClose && hideHeader ? (
          <CloseBtn
            type="button"
            aria-label={closeLabel}
            data-testid={closeTestId}
            data-melega-modal-close="true"
            onClick={requestClose}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}
          >
            ×
          </CloseBtn>
        ) : null}
        <Body $flush={flush} data-melega-modal-body="true">
          {children}
        </Body>
        {footer ? <Footer data-melega-modal-footer="true">{footer}</Footer> : null}
      </Panel>
    </Overlay>
  )

  // Portal escapes header/ticker stacking contexts (backdrop-filter containing blocks).
  return portalTarget ? createPortal(modalTree, portalTarget) : modalTree
}

/** Sticky footer action row for MelegaModal. */
export const MelegaModalFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`

export const MelegaModalFooterMeta = styled.div`
  font-size: 11px;
  color: ${uxRebuildColors.secondary};
  line-height: 1.35;
  min-width: 0;
  flex: 1;
`

export const MelegaModalFooterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-left: auto;
`

/** Compact sticky preview shell for create funnels. */
export const MelegaModalPreview = styled.aside`
  position: sticky;
  top: 8px;
  min-width: 0;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(221, 185, 47, 0.22);
  background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(221, 185, 47, 0.08), transparent 55%),
    rgba(255, 255, 255, 0.02);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);

  @media (max-width: 1023px) {
    position: relative;
    top: 0;
  }
`

export const MelegaModalStatus = styled.div<{ $tone?: 'ok' | 'warn' | 'bad' | 'mute' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok'
        ? 'rgba(109,220,140,0.35)'
        : $tone === 'warn'
        ? 'rgba(240,180,60,0.4)'
        : $tone === 'bad'
        ? 'rgba(240,80,80,0.4)'
        : 'rgba(255,255,255,0.1)'};
  color: ${({ $tone }) =>
    $tone === 'ok'
      ? uxRebuildColors.positive
      : $tone === 'warn'
      ? uxRebuildColors.warning
      : $tone === 'bad'
      ? uxRebuildColors.error
      : uxRebuildColors.secondary};
  background: rgba(0, 0, 0, 0.25);
`

export default MelegaModal
