import React, { PropsWithChildren } from "react";
import { useTheme } from "styled-components";
import Heading from "../../components/Heading/Heading";
import getThemeValue from "../../util/getThemeValue";
import {
  ModalBody,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBackButton,
  ModalContainerForLaunchpad,
} from "./styles";
import { ModalProps, ModalWrapperProps } from "./types";
import { ModalWrapper as NativeModalWrapper } from "./Modal";

export const MODAL_SWIPE_TO_CLOSE_VELOCITY = 300;

export const ModalWrapper = ({
  children,
  onDismiss,
  minWidth,
  hideCloseButton,
  ...props
}: PropsWithChildren<ModalWrapperProps>) => {
  const normalizedMinWidth = typeof minWidth === "string" ? minWidth : "320px";
  return (
    <NativeModalWrapper
      Container={ModalContainerForLaunchpad}
      minWidth={normalizedMinWidth}
      onDismiss={onDismiss}
      hideCloseButton={hideCloseButton}
      {...props}
    >
      {children}
    </NativeModalWrapper>
  );
};

const ModalForLaunchpad: React.FC<React.PropsWithChildren<ModalProps>> = ({
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
  return (
    <ModalWrapper minWidth={minWidth} onDismiss={onDismiss} hideCloseButton={hideCloseButton} {...props}>
      <ModalHeader
        data-modal-drag-handle
        background={getThemeValue(theme, `colors.${headerBackground}`, headerBackground)}
      >
        <ModalTitle>
          {onBack && <ModalBackButton onBack={onBack} />}
          <Heading>{title}</Heading>
        </ModalTitle>
        {!hideCloseButton && <ModalCloseButton onDismiss={onDismiss} />}
      </ModalHeader>
      <ModalBody p={bodyPadding}>{children}</ModalBody>
    </ModalWrapper>
  );
};

export default ModalForLaunchpad;
