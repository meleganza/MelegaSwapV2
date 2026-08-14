import styled, { css } from "styled-components";
import { mountAnimation, unmountAnimation } from "../../components/BottomDrawer/styles";
import { appearAnimation, disappearAnimation } from "../../util/animationToolkit";
import { ModalContainer } from "./styles";

export const modalWrapperStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  /* Legacy currency/settings dialogs can be opened from a Melega V3 workflow.
     Keep them above the V3 overlay (10040/10050) and below global toasts (10100). */
  z-index: 10060;
  will-change: opacity;
  opacity: 0;
  &.appear {
    animation: ${appearAnimation} 0.3s ease-in-out forwards;
    ${ModalContainer} {
      animation: ${mountAnimation} 0.3s ease-in-out forwards;
      ${({ theme }) => theme.mediaQueries.md} {
        animation: none;
      }
    }
  }
  &.disappear {
    animation: ${disappearAnimation} 0.3s ease-in-out forwards;
    ${ModalContainer} {
      animation: ${unmountAnimation} 0.3s ease-in-out forwards;
      ${({ theme }) => theme.mediaQueries.md} {
        animation: none;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms !important;
  }
`;

const StyledModalWrapper = styled.div`
  ${modalWrapperStyles}
`;

export default StyledModalWrapper;
