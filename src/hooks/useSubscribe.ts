import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useAppDispatch } from '@/store'
import { getTraderDataAsync } from '@/store/trader'
import { useMarginInfo } from '@/hooks/useMarginInfo'

export const useSubscribe = () => {
  const dispatch = useAppDispatch()

  const { data } = useAccount()
  const { config, loaded } = useMarginInfo()

  useEffect(() => {
    if (data?.address && loaded) {
      dispatch(getTraderDataAsync({ trader: data?.address, contract: config.derifyExchange }))
    }
  }, [data, config, loaded, dispatch])
}
