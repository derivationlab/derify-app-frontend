import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useAppDispatch } from '@/store'
import { getTraderDataAsync } from '@/store/trader'
import { useMatchConfig } from '@/hooks/useMatchConfig'

export const useSubscribe = () => {
  const dispatch = useAppDispatch()

  const { data } = useAccount()
  // const { config, loaded } = useMatchConfig()
  //
  // useEffect(() => {
  //   if (data?.address && loaded) {
  //     dispatch(getTraderDataAsync({ trader: data?.address, contract: config.exchange }))
  //   }
  // }, [data, config, loaded, dispatch])
}
