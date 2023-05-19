import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { PubSubEvents } from '@/typings'
import { MarginTokenState } from '@/store/types'
import { useMarginTokenStore, useBrokerInfoStore, useWalletStore } from '@/store'

export default function BrokerUpdater(): null {
  const address = useWalletStore((state) => state.account)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfoStore((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfoStore((state) => state.resetBrokerBound)

  useEffect(() => {
    if (address) {
      void fetchBrokerInfo(address, marginToken.address)
      void fetchBrokerBound(address)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      resetBrokerInfo()
      if (address) void fetchBrokerInfo(address, marginToken.address)
    })

    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT, () => {
      resetBrokerBound()
      if (address) void fetchBrokerBound(address)
    })
  }, [address, marginToken])

  return null
}
