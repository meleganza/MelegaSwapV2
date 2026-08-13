import React, { PropsWithChildren, useRef } from "react";
import { useTheme } from "styled-components";
import Heading from "../../components/Heading/Heading";
import getThemeValue from "../../util/getThemeValue";
import {
  ModalBody,
  ModalHeader,
  ModalTitle,
  ModalContainer,
  ModalCloseButton,
  ModalBackButton,
  ModalBrandLockup,
  ModalBrandMark,
  ModalBrandText,
} from "./styles";
import { ModalProps, ModalWrapperProps } from "./types";
import { useMatchBreakpoints } from "../../contexts";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

interface ModalWrapperInternalProps extends Omit<ModalWrapperProps, "minWidth"> {
  minWidth?: string;
  Container?: typeof ModalContainer;
}

export const ModalWrapper = ({
  children,
  onDismiss,
  minWidth = "320px",
  hideCloseButton,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  Container = ModalContainer,
  ...props
}: PropsWithChildren<ModalWrapperInternalProps>) => {
  const { isMobile } = useMatchBreakpoints();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startY: number; startAt: number } | null>(null);
  const dragEnabled = isMobile && !hideCloseButton;

  const resetDragPosition = () => {
    if (!wrapperRef.current) return;
    wrapperRef.current.style.transition = "transform 180ms ease-out";
    wrapperRef.current.style.transform = "translateY(0)";
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (!dragEnabled || event.defaultPrevented || !event.isPrimary) return;
    if (!(event.target instanceof Element) || !event.target.closest("[data-modal-drag-handle]")) return;
    dragStateRef.current = { pointerId: event.pointerId, startY: event.clientY, startAt: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (wrapperRef.current) wrapperRef.current.style.transition = "none";
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !wrapperRef.current) return;
    const offset = Math.max(0, event.clientY - dragState.startY);
    wrapperRef.current.style.transform = `translateY(${offset}px)`;
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.type === "pointercancel") onPointerCancel?.(event);
    else onPointerUp?.(event);

    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const elapsedSeconds = Math.max((performance.now() - dragState.startAt) / 1000, 0.001);
    const velocityY = (event.clientY - dragState.startY) / elapsedSeconds;
    if (velocityY > MODAL_SWIPE_TO_CLOSE_VELOCITY && onDismiss) {
      onDismiss();
      return;
    }
    resetDragPosition();
  };

  return (
    <Container
      ref={wrapperRef}
      $minWidth={minWidth}
      {...props}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {children}
    </Container>
  );
};

const Modal: React.FC<React.PropsWithChildren<ModalProps>> = ({
  title,
  onDismiss,
  onBack,
  children,
  hideCloseButton = false,
  bodyPadding = "24px",
  headerBackground = "transparent",
  minWidth = "320px",
  ...props
}) => {
  const theme = useTheme();
  const normalizedMinWidth = typeof minWidth === "string" ? minWidth : "320px";
  return (
    <ModalWrapper minWidth={normalizedMinWidth} onDismiss={onDismiss} hideCloseButton={hideCloseButton} {...props}>
      <ModalHeader
        data-modal-drag-handle
        background={getThemeValue(theme, `colors.${headerBackground}`, headerBackground)}
      >
        <ModalTitle>
          {onBack && <ModalBackButton onBack={onBack} />}
          <ModalBrandLockup aria-label="Melega DEX">
            <ModalBrandMark aria-hidden />
            <ModalBrandText>
              Melega<strong>DEX</strong>
            </ModalBrandText>
          </ModalBrandLockup>
          <Heading>{title}</Heading>
        </ModalTitle>
        {!hideCloseButton && <ModalCloseButton onDismiss={onDismiss} />}
      </ModalHeader>
      <ModalBody p={bodyPadding}>{children}</ModalBody>
    </ModalWrapper>
  );
};

export default Modal;
