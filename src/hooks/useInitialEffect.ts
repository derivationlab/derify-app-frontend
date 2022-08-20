import { useEffect } from 'react'
import { useAccount, useBlockNumber } from 'wagmi'

import { getBrokerBoundDataAsync, getBrokerDataAsync } from '@/store/trader'
import { getEventsDataAsync, getTokenSpotPriceAsync } from '@/store/contract'
import {
  getIndicatorDataAsync,
  getCurrentPositionsAmountDataAsync,
  getPositionChangeFeeRatioDataAsync
} from '@/store/constant'
import { useAppDispatch } from '@/store'

export const useInitialEffect = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    if (account?.address) {
      dispatch(getBrokerDataAsync(account?.address))
      dispatch(getBrokerBoundDataAsync(account?.address))
    }
  }, [account?.address, dispatch])

  useEffect(() => {
    /**
     bdrfPrice: 0
     drfBurnt: 1.1903499167890368
     drfBuyBack: 4008.58768796
     drfPrice: 0
     drfStakingApy: 0
     edrfPrice: 0
     */
    dispatch(getIndicatorDataAsync())

    dispatch(getEventsDataAsync())
    dispatch(getCurrentPositionsAmountDataAsync())
    dispatch(getPositionChangeFeeRatioDataAsync())
  }, [dispatch])

  useEffect(() => {
    /**
     * spotPrice
     */
    dispatch(getTokenSpotPriceAsync())
  }, [blockNumber])
}
