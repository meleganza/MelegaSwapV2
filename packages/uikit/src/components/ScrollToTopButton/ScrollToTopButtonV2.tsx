import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { Button } from "../Button";
import { ArrowUpIcon } from "../Svg";

const FixedContainer = styled.div`
  position: fixed;
  right: 16px;
  bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  z-index: 180;
  transition: opacity 160ms ease, transform 160ms ease;
  pointer-events: none;

  @media (min-width: 1024px) {
    bottom: 32px;
    right: 24px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Fab = styled(Button)<{ $visible: boolean }>`
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(8px)")};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
`

const ScrollToTopButtonV2 = () => {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const scrollingDown = useRef(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const delta = y - lastY.current;
      scrollingDown.current = delta > 4;
      lastY.current = y;

      if (y <= 420) {
        setVisible(false);
        return;
      }

      if (scrollingDown.current) {
        setVisible(false);
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          if ((window.scrollY || 0) > 420) setVisible(true);
        }, 280);
        return;
      }

      setVisible(true);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(settleTimer);
    };
  }, []);

  return (
    <FixedContainer data-testid="scroll-to-top-fab" data-fab-visible={visible ? "1" : "0"}>
      <Fab
        $visible={visible}
        aria-label="Back to top"
        title="Back to top"
        endIcon={<ArrowUpIcon color="invertedContrast" style={{ marginLeft: 0 }} />}
        onClick={scrollToTop}
      />
    </FixedContainer>
  );
};

export default ScrollToTopButtonV2;
