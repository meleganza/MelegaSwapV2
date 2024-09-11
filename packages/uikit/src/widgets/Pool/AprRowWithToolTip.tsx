import React, { ReactNode } from "react";
import { VaultKey } from "state/types";
import { useTranslation } from "@pancakeswap/localization";
import { Flex } from "../../components/Box";
import { TooltipText } from "../../components/Text";
import { useTooltip } from "../../hooks";

export const AprRowWithToolTip: React.FC<
  React.PropsWithChildren<{
    pool: any;
    questionTooltip?: ReactNode;
  }>
> = ({ children, pool, questionTooltip }) => {
  const { t } = useTranslation();

  const apyTooltipContent = t(
    "APY includes compounding, APR doesn’t. This pool’s MARCO is compounded automatically, so we show APY."
  );
  const aprTooltipContent = t("This pool’s rewards aren’t compounded automatically, so we show APR.");
  const tooltipContent = pool.vaultKey === VaultKey.CakeVault ? apyTooltipContent : aprTooltipContent;

  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipContent, { placement: "bottom-start" });

  return (
    <Flex alignItems="center" justifyContent="space-between">
      {tooltipVisible && tooltip}
      <Flex>
        <TooltipText ref={targetRef}>{`${pool.vaultKey === VaultKey.CakeVault ? t("APY") : t("APR")}:`}</TooltipText>
        {questionTooltip}
      </Flex>
      {children}
    </Flex>
  );
};
