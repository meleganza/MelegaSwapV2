import React from "react";
import { createPortal } from "react-dom";
import { BoxProps } from "../../components/Box";
import { Overlay } from "../../components/Overlay";
import getPortalRoot from "../../util/getPortalRoot";
import StyledModalWrapper from "./ModalWrapper";

export interface ModalV2Props {
  isOpen?: boolean;
  onDismiss?: () => void;
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
}

export function ModalV2({ isOpen, onDismiss, closeOnOverlayClick, children, ...props }: ModalV2Props & BoxProps) {
  const handleOverlayDismiss = () => {
    if (closeOnOverlayClick) {
      onDismiss?.();
    }
  };
  const portal = getPortalRoot();

  if (portal) {
    return createPortal(
      isOpen ? (
        <StyledModalWrapper {...props} className={["appear", props.className].filter(Boolean).join(" ")}>
          <Overlay onClick={handleOverlayDismiss} />
          {children}
        </StyledModalWrapper>
      ) : null,
      portal
    );
  }

  return null;
}
