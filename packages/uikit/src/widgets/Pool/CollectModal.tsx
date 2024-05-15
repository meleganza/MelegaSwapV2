import { useState } from "react";
import { useTranslation } from "@pancakeswap/localization";
import { formatNumber } from "@pancakeswap/utils/formatBalance";
import { useTheme } from "styled-components";
import {
  Modal,
  Text,
  Button,
  Heading,
  Flex,
  AutoRenewIcon,
  ButtonMenu,
  ButtonMenuItem,
  HelpIcon,
  useTooltip,
  useToast,
} from "@pancakeswap/uikit";
import getThemeValue from "../../util/getThemeValue";
import useHarvestPool from "../../../../../apps/web/src/views/Pools/hooks/useHarvestPool";
import useStakePool from "../../../../../apps/web/src/views/Pools/hooks/useStakePool";

export interface CollectModalProps {
  formattedBalance: string;
  fullBalance: string;
  earningTokenSymbol: string;
  earningTokenDecimals: number;
  earningsDollarValue: number;
  sousId: number;
  isBnbPool: boolean;
  isCompoundPool?: boolean;
  onDismiss?: () => void;
  poolAddress?: {
    [index: number]: string;
  };
  earningTokenAddress?: string;
}

export interface CollectModalWithHandlerProps extends CollectModalProps {
  handleHarvestConfirm: () => Promise<any>;
  pendingTx: boolean;
}

export function CollectModal({
  formattedBalance,
  fullBalance,
  earningTokenSymbol,
  earningTokenDecimals,
  earningsDollarValue,
  sousId,
  isBnbPool,
  isCompoundPool,
  onDismiss,
  handleHarvestConfirm,
  pendingTx,
}: CollectModalWithHandlerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { toastSuccess, toastError } = useToast();
  let sousIdtarget = 0;
  if (sousId !== undefined) {
    sousIdtarget = sousId;
  }
  const { onReward } = useHarvestPool(sousIdtarget, isBnbPool);
  const { onStake } = useStakePool(sousIdtarget, isBnbPool);
  const [shouldCompound, setShouldCompound] = useState(isCompoundPool);
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <>
      <Text mb="12px" color="black">{t("Compound: collect and restake MARCO into pool.")}</Text>
      <Text color="black">{t("Harvest: collect MARCO and send to wallet.")}</Text>
    </>,
    { placement: "bottom-end", tooltipOffset: [20, 10] }
  );

  const handleHarvestConfirmMasterChef = async () => {
    // eslint-disable-next-line no-param-reassign
    pendingTx = true;
    // compounding
    if (shouldCompound) {
      try {

        await onStake(fullBalance, earningTokenDecimals);
        toastSuccess(
          `${t("Compounded")}!`,
          t("Your %symbol% earnings have been re-invested into the pool!", { symbol: earningTokenSymbol })
        );
        // eslint-disable-next-line no-param-reassign
        pendingTx = false;
        if (onDismiss) {
          onDismiss();
        }
      } catch (e) {
        toastError(t("Error"), t("Please try again. Confirm the transaction and make sure you are paying enough gas!"));
        console.error(e);
        // eslint-disable-next-line no-param-reassign
        pendingTx = false;
      }
    } else {
      // harvesting
      try {
        await onReward();
        toastSuccess(
          `${t("Harvested")}!`,
          t("Your %symbol% earnings have been sent to your wallet!", { symbol: earningTokenSymbol })
        );
        // eslint-disable-next-line no-param-reassign
        pendingTx = false;
        if (onDismiss) {
          onDismiss();
        }
      } catch (e) {
        toastError(t("Error"), t("Please try again. Confirm the transaction and make sure you are paying enough gas!"));
        console.error(e);
        // eslint-disable-next-line no-param-reassign
        pendingTx = false;
      }
    }
  };

  const handleCollectClick = async () => {
    if (isCompoundPool) {
      await handleHarvestConfirmMasterChef();
    } else {
      await handleHarvestConfirm();
    }
  };

  return (
    <Modal
      title={`${earningTokenSymbol} ${isCompoundPool ? t("Collect") : t("Harvest")}`}
      onDismiss={onDismiss}
      headerBackground="black"
    >
      {isCompoundPool && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={shouldCompound ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => setShouldCompound(!index)}
          >
            <ButtonMenuItem as="button">{t("Compound")}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t("Harvest")}</ButtonMenuItem>
          </ButtonMenu>
          <Flex ml="10px" ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Flex>
          {tooltipVisible && tooltip}
        </Flex>
      )}

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Text>{shouldCompound ? t("Compounding") : t("Harvesting")}:</Text>
        <Flex flexDirection="column">
          <Heading>
            {formattedBalance} {earningTokenSymbol}
          </Heading>
          {earningsDollarValue > 0 && (
            <Text fontSize="12px" color="textSubtle">{`~${formatNumber(earningsDollarValue)} USD`}</Text>
          )}
        </Flex>
      </Flex>

      <Button
        mt="8px"
        onClick={handleCollectClick}
        isLoading={pendingTx}
        endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
      >
        {pendingTx ? t("Confirming") : t("Confirm")}
      </Button>
      <Button variant="text" onClick={onDismiss} pb="0px">
        {t("Close Window")}
      </Button>
    </Modal>
  );
}
