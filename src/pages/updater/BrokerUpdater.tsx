import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useBrokerParams } from '@/hooks/useBroker'
import { useConfigInfo } from '@/zustand'
import { PubSubEvents } from '@/typings'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { findToken } from '@/config/tokens'

export default function BrokerUpdater(): null {
  const { address } = useAccount()

  const { data: brokerParams, isLoading: brokerParamsIsLoading } = useBrokerParams()

  const fetchBrokerInfo = useBrokerInfo((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfo((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfo((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfo((state) => state.resetBrokerBound)
  const updateBrokerParams = useConfigInfo((state) => state.updateBrokerParams)

  const marginToken = useMTokenFromRoute()

  // for broker info
  useEffect(() => {
    if (address) {
      void fetchBrokerInfo(address, findToken(marginToken).tokenAddress)
      void fetchBrokerBound(address)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      resetBrokerInfo()

      if (address) {
        void fetchBrokerInfo(address, findToken(marginToken).tokenAddress)
      }
    })

    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT, () => {
      resetBrokerBound()

      if (address) {
        void fetchBrokerBound(address)
      }
    })
  }, [address])

  useEffect(() => {
    if (!brokerParamsIsLoading && brokerParams) {
      updateBrokerParams(brokerParams)
    }
  }, [brokerParams, brokerParamsIsLoading])

  return null
}
