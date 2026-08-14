import { m as motion, Variants } from "framer-motion";
import styled from "styled-components";
import { background, border, layout, position, space } from "styled-system";
import { BoxProps } from "./types";

export { AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
export type MotionVariants = Variants;

const MotionBox = styled(motion.div)<BoxProps>`
  ${background}
  ${border}
  ${layout}
  ${position}
  ${space}
`;

export default MotionBox;
