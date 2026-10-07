import { useMemo } from 'react'
import { ButtonProps } from '@pancakeswap/uikit';
import 'config/constants/pools';

// import ExtendDurationModal from '../Modals/ExtendDurationModal'
import { ExtendDurationButtonPropsType } from '../types'

const ExtendDurationButton: React.FC<React.PropsWithChildren<ExtendDurationButtonPropsType & ButtonProps>> = ({
  modalTitle,
  stakingToken,
  currentLockedAmount,
  currentBalance,
  lockEndTime,
  lockStartTime,
  children,
  isRenew,
  ...rest
}) => {
  const nowInSeconds = Math.floor(Date.now() / 1000)
  useMemo(() => Number(lockEndTime) - Number(lockStartTime), [lockEndTime, lockStartTime]);
  useMemo(() => Math.max(Number(lockEndTime) - nowInSeconds, 0), [lockEndTime, nowInSeconds]);

  // const [openExtendDurationModal] = useModal(
  //   <ExtendDurationModal
  //     modalTitle={modalTitle}
  //     stakingToken={stakingToken}
  //     lockStartTime={lockStartTime}
  //     currentBalance={currentBalance}
  //     currentLockedAmount={currentLockedAmount}
  //     currentDuration={currentDuration}
  //     currentDurationLeft={currentDurationLeft}
  //     isRenew={isRenew}
  //   />,
  //   true,
  //   true,
  //   'ExtendDurationModal',
  // )

  return (
    // <Button
    //   disabled={Number.isFinite(currentDurationLeft) && MAX_LOCK_DURATION - currentDurationLeft < ONE_WEEK_DEFAULT}
    //   onClick={openExtendDurationModal}
    //   width="100%"
    //   {...rest}
    // >
    //   {children}
    // </Button>
    <></>
  )
}

export default ExtendDurationButton
