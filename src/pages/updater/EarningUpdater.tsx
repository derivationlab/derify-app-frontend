import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { useProtocolConfigStore, useTraderVariablesStore } from '@/store'
import { PubSubEvents } from '@/typings'

export default function EarningUpdater(): null {
  const { address } = useAccount()
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getTraderVariables = useTraderVariablesStore((state) => state.getTraderVariables)
  const resetTraderVariables = useTraderVariablesStore((state) => state.reset)

  // User Margin Data
  useEffect(() => {
    if (address && protocolConfig) {
      void resetTraderVariables()
      void getTraderVariables(address, protocolConfig.exchange)
    }

    PubSub.unsubscribe(PubSubEvents.UPDATE_TRADER_VARIABLES)
    PubSub.subscribe(PubSubEvents.UPDATE_TRADER_VARIABLES, () => {
      if (address && protocolConfig) {
        void getTraderVariables(address, protocolConfig.exchange)
      }
    })
  }, [address, protocolConfig])

  return null
}
