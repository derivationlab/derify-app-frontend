import { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { useAppDispatch } from '@/store'
import { useBlockNum } from '@/hooks/useBlockNumber'
import { getMarginTokenContractConfigAsync } from '@/store/config'
import { getBrokerBoundDataAsync, getBrokerDataAsync } from '@/store/trader'
import { getEventsDataAsync, getTokenSpotPriceAsync } from '@/store/contract'
import { getIndicatorDataAsync, getPositionChangeFeeRatioDataAsync } from '@/store/constant'

export const useInitialEffect = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { isConnected } = useConnect()
  const { blockNumber } = useBlockNum()

  useEffect(() => {
    if (isConnected && account?.address) {
      dispatch(getBrokerDataAsync(account?.address))
      dispatch(getBrokerBoundDataAsync(account?.address))
    }
  }, [isConnected, account?.address, dispatch])

  useEffect(() => {
    if (blockNumber) {
      dispatch(getTokenSpotPriceAsync())
      // dispatch(getEventsDataAsync())
      dispatch(getPositionChangeFeeRatioDataAsync())
    }
  }, [blockNumber, dispatch])

  useEffect(() => {
    // dispatch(getIndicatorDataAsync())
    dispatch(getMarginTokenContractConfigAsync())
  }, [dispatch])
}
