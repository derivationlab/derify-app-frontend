import { isEmpty } from 'lodash'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { useMarginIndicators } from '@/hooks/useMarginIndicators'
import {
  useBalancesStore,
  useBrokerInfoStore,
  useDerivativeListStore,
  useMarginTokenListStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useQuoteTokenStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useMarginIndicatorsStore } from '@/store/useMarginIndicators'
import { PubSubEvents } from '@/typings'

export default function GlobalUpdater(): null {
  const { address } = useAccount()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const resetBalances = useBalancesStore((state) => state.reset)
  const getTokenBalances = useBalancesStore((state) => state.getTokenBalances)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const updateMarginIndicators = useMarginIndicatorsStore((state) => state.updateMarginIndicators)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const { data: marginIndicators } = useMarginIndicators(marginToken.address)

  // Margin token balances
  useEffect(() => {
    if (address) {
      void resetBalances()
      if (marginTokenList.length) void getTokenBalances(address, marginTokenList)
    }

    PubSub.unsubscribe(PubSubEvents.UPDATE_BALANCE)
    PubSub.subscribe(PubSubEvents.UPDATE_BALANCE, () => {
      if (address && marginTokenList.length) void getTokenBalances(address, marginTokenList)
    })
  }, [address, marginTokenList])

  // Margin token indicators
  useEffect(() => {
    if (marginIndicators) {
      updateMarginIndicators(marginIndicators)
    }
  }, [marginIndicators])

  // User broker info
  useEffect(() => {
    if (address) {
      void fetchBrokerInfo(address, marginToken.address)
      void fetchBrokerBound(address)
    }

    PubSub.unsubscribe(PubSubEvents.UPDATE_BROKER_DAT)
    PubSub.unsubscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT)
    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      if (address) void fetchBrokerInfo(address, marginToken.address)
    })
    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT, () => {
      if (address) void fetchBrokerBound(address)
    })
  }, [address, marginToken])

  // Initialize margin token with protocol config
  useEffect(() => {
    if (marginToken) void getProtocolConfig(marginToken.address)
  }, [marginToken])

  // Get trading pair data
  useEffect(() => {
    if (protocolConfig) void getDerivativeList(marginToken.address, protocolConfig.factory)
  }, [protocolConfig])

  // Initialize quote token default information
  useEffect(() => {
    if (!isEmpty(derivativeList)) {
      if (quoteToken.margin !== marginToken.symbol) {
        console.info(quoteToken.margin, marginToken.symbol)
        console.info(derivativeList[0])
        const { name, token, price_decimals: decimals, derivative } = derivativeList[0]
        updateQuoteToken({ name, token, decimals, derivative, margin: marginToken.symbol })
      }
    }
  }, [derivativeList])

  return null
}
