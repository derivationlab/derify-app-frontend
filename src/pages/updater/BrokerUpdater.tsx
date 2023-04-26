import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useMarginTokenStore, useBrokerInfoStore } from '@/store'

export default function BrokerUpdater(): null {
  const { address, status } = useAccount()

  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfoStore((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfoStore((state) => state.resetBrokerBound)

  const marginToken = useMarginTokenStore((state) => state.marginToken)

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

  return null
}
