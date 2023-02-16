import { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { useAppDispatch } from '@/store'
import { getBrokerBoundDataAsync, getBrokerDataAsync } from '@/store/trader'

// todo rewrite
export const useInitialEffect = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { isConnected } = useConnect()

  useEffect(() => {
    if (isConnected && account?.address) {
      dispatch(getBrokerDataAsync(account?.address))
      dispatch(getBrokerBoundDataAsync(account?.address))
    }
  }, [isConnected, account?.address, dispatch])
}
