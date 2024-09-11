import BigNumber from "bignumber.js";
import { getBalanceNumber } from "@pancakeswap/utils/formatBalance";
import { useTranslation } from "@pancakeswap/localization";
import { Balance, Skeleton } from "../../components";
import { StatWrapper } from "./StatWrapper";

export const TotalToken = ({
  total,
  tokenDecimals,
  decimalsToShow,
  symbol,
}: {
  total: BigNumber;
  tokenDecimals: number;
  decimalsToShow: number;
  symbol: string;
}) => {
  if (total && total.gte(0)) {
    return (
      <Balance small value={getBalanceNumber(total, tokenDecimals)} decimals={decimalsToShow} unit={` ${symbol}`} />
    );
  }
  return <Skeleton width="90px" height="21px" />;
};

export const TotalStaked: React.FC<
  React.PropsWithChildren<{ totalStaked: BigNumber; tokenDecimals: number; decimalsToShow: number; symbol: string }>
> = ({ totalStaked, tokenDecimals, decimalsToShow, symbol }) => {
  const { t } = useTranslation();

  return (
    <StatWrapper label={<span style={{ fontSize: "14px" }}>{t("Total staked")}:</span>}>
      <TotalToken total={totalStaked} tokenDecimals={tokenDecimals} decimalsToShow={decimalsToShow} symbol={symbol} />
    </StatWrapper>
  );
};
