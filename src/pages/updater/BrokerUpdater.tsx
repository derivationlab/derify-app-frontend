import PubSub from 'pubsub-js'
import { useEffect } from 'react'

import { findToken } from '@/config/tokens'
import { PubSubEvents } from '@/typings'
import { useMarginTokenStore, useBrokerInfoStore, useWalletStore } from '@/store'

export default function BrokerUpdater(): null {
  const address = useWalletStore((state) => state.account)
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
  }, [address])

  return null
}
