import React, { ChangeEvent, useCallback } from "react";
import styled from "styled-components";
import { Box } from "../Box";
import { BoxProps } from "../Box/types";
import {
  BunnySlider,
  BarBackground,
  BarProgress,
  BunnyButt,
  StyledInput,
  SliderLabel,
  SliderLabelContainer,
} from "./styles";
import SliderProps from "./types";

interface DiceSliderProps extends BoxProps {
  name: string;
  min: number;
  max: number;
  value: number;
  step?: number | "any";
  onValueChanged: (newValue: number) => void;
  valueLabel?: string;
  disabled?: boolean;
  pan: number;
}

interface DisabledProp {
    disabled?: boolean;
  }

const DiceBarBackground = styled.div<DisabledProp>`
  background-color: ${({ theme, disabled }) => theme.colors[disabled ? "textDisabled" : "inputSecondary"]};
  height: 10px;
  position: absolute;
  top: 18px;
  width: 98%;
`;

const DiceBarProgress = styled.div<DisabledProp>`
  background-color: ${({ theme }) => theme.colors.primary};
  filter: ${({ disabled }) => (disabled ? "grayscale(100%)" : "none")};
  height: 10px;
  position: absolute;
  top: 18px;
`;

const DiceSlider: React.FC<React.PropsWithChildren<DiceSliderProps>> = ({
  name,
  min,
  max,
  value,
  onValueChanged,
  valueLabel,
  step = "any",
  disabled = false,
  pan,
  ...props
}) => {
  const handleChange = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      onValueChanged(parseFloat(target.value));
    },
    [onValueChanged]
  );

  const progressPercentage = ((pan === 0 ? value : 103 - value) / max) * 100;
  const isMax = value === max;
  let progressWidth: string;
  if (progressPercentage <= 10) {
    progressWidth = `${pan === 0 ? progressPercentage + 0.5 : progressPercentage - 2.5}%`;
  } else if (progressPercentage >= 90) {
    progressWidth = `${progressPercentage - 2}%`;
  } else if (progressPercentage >= 60) {
    progressWidth = `${progressPercentage - 2.5}%`;
  } else {
    progressWidth = `${pan === 0 ? progressPercentage : progressPercentage - 2.5}%`;
  }
  const labelProgress = isMax ? "calc(100% - 12px)" : `${progressPercentage}%`;
  const displayValueLabel = isMax ? "MAX" : valueLabel;
  return (
    <Box position="relative" height="48px" {...props}>
      {/* <BunnyButt disabled={disabled} /> */}
      <BunnySlider>
        <DiceBarBackground disabled={disabled} />
        <DiceBarProgress style={{ width: progressWidth, right: pan === 0 ? "auto" : "10px"}} disabled={disabled} />
        <StyledInput
          name={name}
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={handleChange}
          isMax={isMax}
          disabled={disabled}
        />
      </BunnySlider>
      {valueLabel && (
        <SliderLabelContainer>
          <SliderLabel progress={labelProgress}>{displayValueLabel}</SliderLabel>
        </SliderLabelContainer>
      )}
    </Box>
  );
};

export default DiceSlider;
