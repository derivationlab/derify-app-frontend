import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { usePositionLimitStore, useProtocolConfigStore, useQuoteTokenStore, useTraderVariablesStore } from '@/store'
import { QuoteTokenState } from '@/store/types'
import { useOpeningMinLimitStore } from '@/store/useOpeningMinLimit'
import { PubSubEvents } from '@/typings'

export default function TradingUpdater(): null {
  const { address } = useAccount()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getPositionLimit = usePositionLimitStore((state) => state.getPositionLimit)
  const getOpeningMinLimit = useOpeningMinLimitStore((state) => state.getOpeningMinLimit)
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

  // Minimum open position amount
  useEffect(() => {
    if (protocolConfig) void getOpeningMinLimit(protocolConfig.exchange)
  }, [protocolConfig])

  // The system limits the opening amount
  useEffect(() => {
    if (protocolConfig) void getPositionLimit(protocolConfig.exchange, quoteToken)
  }, [quoteToken, protocolConfig])

  return null
}
