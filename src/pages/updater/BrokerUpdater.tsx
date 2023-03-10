import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

import { useBrokerInfo } from '@/zustand/useBrokerInfo'
import { useBrokerParams } from '@/hooks/useBroker'
import { useConfigInfo } from '@/zustand'
import { PubSubEvents } from '@/typings'

export default function BrokerUpdater(): null {
  const { data } = useAccount()

  const { data: brokerParams, isLoading: brokerParamsIsLoading } = useBrokerParams()

  const fetchBrokerInfo = useBrokerInfo((state) => state.fetchBrokerInfo)
  const fetchBrokerBound = useBrokerInfo((state) => state.fetchBrokerBound)
  const updateBrokerParams = useConfigInfo((state) => state.updateBrokerParams)

  // for broker info
  useEffect(() => {
    if (data?.address) {
      void fetchBrokerInfo(data?.address)
      void fetchBrokerBound(data?.address)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      if (data?.address) {
        void fetchBrokerInfo(data.address)
      }
    })
  }, [data?.address])

  useEffect(() => {
    if (!brokerParamsIsLoading && brokerParams) {
      updateBrokerParams(brokerParams)
    }
  }, [brokerParams, brokerParamsIsLoading])

  return null
}
