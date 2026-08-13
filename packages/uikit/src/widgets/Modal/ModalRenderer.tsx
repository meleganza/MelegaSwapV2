import { AnimatePresence, domMax, LazyMotion, m } from "framer-motion";
import React, { useRef } from "react";
import styled from "styled-components";
import { Overlay } from "../../components/Overlay";
import { animationHandler, animationMap, animationVariants } from "../../util/animationToolkit";
import { modalWrapperStyles } from "./ModalWrapper";
import { Handler } from "./types";

const AnimatedModalWrapper = styled(m.div)`
  ${modalWrapperStyles}
`;

interface ModalRendererProps {
  isOpen: boolean;
  modalNode: React.ReactNode;
  onDismiss: Handler;
  closeOnOverlayClick: boolean;
}

const ModalRenderer: React.FC<ModalRendererProps> = ({ isOpen, modalNode, onDismiss, closeOnOverlayClick }) => {
  const animationRef = useRef<HTMLDivElement>(null);

  const handleOverlayDismiss = () => {
    if (closeOnOverlayClick) {
      onDismiss();
    }
  };

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isOpen && (
          <AnimatedModalWrapper
            ref={animationRef}
            onAnimationStart={() => animationHandler(animationRef.current)}
            {...animationMap}
            variants={animationVariants}
            transition={{ duration: 0.3 }}
          >
            <Overlay onClick={handleOverlayDismiss} />
            {React.isValidElement(modalNode) &&
              React.cloneElement(modalNode, {
                // @ts-ignore
                onDismiss,
              })}
          </AnimatedModalWrapper>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default ModalRenderer;
