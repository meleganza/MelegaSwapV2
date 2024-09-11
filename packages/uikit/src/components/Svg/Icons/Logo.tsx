import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <img src="/images/melega.png" {...props} alt="Melega" />
  );
};

export default Icon;
