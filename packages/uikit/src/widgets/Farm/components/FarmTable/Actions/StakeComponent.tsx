import { useTranslation } from "@pancakeswap/localization";
import { StyledActionContainer, ActionContent, ActionTitles } from "./styles";
import { Text } from "../../../../../components/Text";
import { Button } from "../../../../../components/Button";

interface StakeComponentProps {
  lpSymbol: string;
  isStakeReady: boolean;
  onPresentDeposit: () => void;
  isTokenOnly: boolean;
}

const StakeComponent: React.FunctionComponent<React.PropsWithChildren<StakeComponentProps>> = ({
  lpSymbol,
  isStakeReady,
  onPresentDeposit,
  isTokenOnly
}) => {
  const { t } = useTranslation();

  return (
    <StyledActionContainer>
      <ActionTitles>
        <Text bold textTransform="uppercase" color="textSubtle" fontSize="12px" pr="4px">
          {t("Stake")}
        </Text>
        <Text bold color="secondary" fontSize="12px">
          {lpSymbol}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button width="100%" onClick={onPresentDeposit} variant="secondary" disabled={isStakeReady}>
            {
              isTokenOnly ? 'Stake ' + lpSymbol : t('Stake LP')
            }
        </Button>
      </ActionContent>
    </StyledActionContainer>
  );
};

export default StakeComponent;
