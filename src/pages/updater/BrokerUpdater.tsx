import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useBrokerParams } from '@/hooks/useBroker'
import { useConfigInfoStore, useMarginTokenStore, useBrokerInfoStore } from '@/store'

export default function BrokerUpdater(): null {
  const { address, status } = useAccount()

  const { data: brokerParams, isLoading: brokerParamsIsLoading } = useBrokerParams()

  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfoStore((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfoStore((state) => state.resetBrokerBound)
  const updateBrokerParams = useConfigInfoStore((state) => state.updateBrokerParams)

  const marginToken = useMarginTokenStore((state) => state.marginToken)

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
  }, [address, status])

  useEffect(() => {
    if (!brokerParamsIsLoading && brokerParams) {
      updateBrokerParams(brokerParams)
    }
  }, [brokerParams, brokerParamsIsLoading])

  return null
}
