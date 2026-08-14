import React from "react";
import styled from "styled-components";
import Flex from "../../components/Box/Flex";
import Box from "../../components/Box/Box";
import { ArrowBackIcon, CloseIcon } from "../../components/Svg";
import { IconButton } from "../../components/Button";
import { ModalProps } from "./types";

export const mobileFooterHeight = 73;

export const ModalHeader = styled.div<{ background?: string }>`
  align-items: center;
  background: transparent;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  padding: 16px 12px 12px 20px;
  touch-action: none;

  ${({ theme }) => theme.mediaQueries.md} {
    background: ${({ background }) => background || "transparent"};
  }
`;

export const ModalTitle = styled(Flex)`
  align-items: center;
  flex: 1;
`;

export const ModalBrandLockup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
  flex-shrink: 0;
`;

export const ModalBrandMark = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(244, 196, 48, 0.42);
  background: #080808 url("/images/melega.png") center / cover no-repeat;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const ModalBrandText = styled.span`
  display: inline-flex;
  align-items: baseline;
  font-size: 13px;
  line-height: 16px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.92);
  white-space: nowrap;

  strong {
    color: #f4c430;
    font-size: inherit;
    font-weight: 800;
  }
`;

export const ModalBody = styled(Flex)`
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(90vh - ${mobileFooterHeight}px);
  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    max-height: 90vh;
  }
`;

export const ModalCloseButton: React.FC<React.PropsWithChildren<{ onDismiss: ModalProps["onDismiss"] }>> = ({
  onDismiss,
}) => {
  return (
    <IconButton variant="text" onClick={onDismiss} aria-label="Close the dialog">
      <CloseIcon color="primary" />
    </IconButton>
  );
};

export const ModalBackButton: React.FC<React.PropsWithChildren<{ onBack: ModalProps["onBack"] }>> = ({ onBack }) => {
  return (
    <IconButton variant="text" onClick={onBack} area-label="go back" mr="8px">
      <ArrowBackIcon color="primary" />
    </IconButton>
  );
};

export const ModalContainer = styled(Box)<{ $minWidth: string }>`
  overflow: hidden;
  background: ${({ theme }) => theme.modal.background};
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.56), 0 0 0 1px rgba(244, 196, 48, 0.04);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 22px 22px 0px 0px;
  width: 100%;
  max-height: calc(var(--vh, 1vh) * 100);
  z-index: ${({ theme }) => theme.zIndices.modal};
  position: absolute;
  min-width: ${({ $minWidth }) => $minWidth};
  bottom: 0;
  max-width: none !important;
  min-height: 300px;
  backdrop-filter: blur(20px) saturate(125%);
  -webkit-backdrop-filter: blur(20px) saturate(125%);

  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    position: relative;
    bottom: auto;
    border-radius: 22px;
    max-height: 100vh;
  }
`;

export const ModalContainerForLaunchpad = styled(Box)<{ $minWidth: string }>`
  overflow: hidden;
  background: ${({ theme }) => theme.modal.background};
  box-shadow: 0px 20px 36px -8px rgba(14, 14, 44, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 32px 32px 0px 0px;
  width: 100%;
  // max-height: 150px;
  z-index: ${({ theme }) => theme.zIndices.modal};
  position: absolute;
  min-width: ${({ $minWidth }) => $minWidth};
  bottom: 0;
  max-width: none !important;
  min-height: 150px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: auto;
    position: relative;
    bottom: auto;
    // border-radius: 32px;
    border-radius: 8px;
    // max-height: 150px;
  }
`;
