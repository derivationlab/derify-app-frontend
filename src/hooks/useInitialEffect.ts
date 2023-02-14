import { isEmpty } from 'lodash'
import { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { useAppDispatch } from '@/store'
import { useBlockNum } from '@/hooks/useBlockNumber'
import { getConfigFromFactory, getConfigFromProtocol } from '@/store/config'
import { getBrokerBoundDataAsync, getBrokerDataAsync } from '@/store/trader'
import { useContractConfig } from '@/store/config/hooks'

export const useInitialEffect = () => {
  const dispatch = useAppDispatch()
  const { data: account } = useAccount()
  const { isConnected } = useConnect()
  const { protocolConfig, protocolConfigLoaded } = useContractConfig()

  useEffect(() => {
    if (isConnected && account?.address) {
      dispatch(getBrokerDataAsync(account?.address))
      dispatch(getBrokerBoundDataAsync(account?.address))
    }
  }, [isConnected, account?.address, dispatch])

  useEffect(() => {
    // dispatch(getIndicatorDataAsync())
    dispatch(getConfigFromProtocol())
  }, [dispatch])

  useEffect(() => {
    if (protocolConfigLoaded && !isEmpty(protocolConfig)) {
      dispatch(getConfigFromFactory())
    }
  }, [protocolConfig, protocolConfigLoaded])
}
