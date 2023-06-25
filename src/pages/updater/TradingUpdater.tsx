import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { usePriceDecimals, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import {
  useDerivativeListStore,
  usePositionLimitStore,
  useProtocolConfigStore,
  useQuoteTokenStore,
  useTokenSpotPricesStore,
  useTraderVariablesStore
} from '@/store'
import { QuoteTokenState } from '@/store/types'
import { useOpeningMinLimitStore } from '@/store/useOpeningMinLimit'
import { PubSubEvents } from '@/typings'

export default function TradingUpdater(): null {
  const { address } = useAccount()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const getPosMaxLeverage = useDerivativeListStore((state) => state.getPosMaxLeverage)
  const getOpeningMinLimit = useOpeningMinLimitStore((state) => state.getOpeningMinLimit)
  const getPositionLimit = usePositionLimitStore((state) => state.getPositionLimit)
  const getTraderVariables = useTraderVariablesStore((state) => state.getTraderVariables)
  const resetTraderVariables = useTraderVariablesStore((state) => state.reset)
  const updateTokenSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPrices)
  const { priceDecimals } = usePriceDecimals(derAddressList)
  const { data: tokenSpotPrices } = useTokenSpotPrices(derAddressList, priceDecimals)

  // Spot price
  useEffect(() => {
    if (tokenSpotPrices) {
      updateTokenSpotPrices(tokenSpotPrices)
    }
  }, [tokenSpotPrices])

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

  // Minimum open position amount
  useEffect(() => {
    if (protocolConfig) void getPositionLimit(protocolConfig.exchange, quoteToken)
  }, [quoteToken, protocolConfig])

  // Trading pairs opening max leverage
  useEffect(() => {
    void getPosMaxLeverage()
  }, [derAddressList])

  return null
}
