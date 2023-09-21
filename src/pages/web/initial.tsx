import { useSetAtom } from 'jotai'
import { isEmpty } from 'lodash-es'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { asyncUserBrokerBoundAtom, asyncWhetherUserIsBrokerAtom } from '@/atoms/useBrokerData'
import { useMarginIndicators } from '@/hooks/useMarginIndicators'
import {
  useBalancesStore,
  useDerivativeListStore,
  useMarginTokenListStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useQuoteTokenStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { useMarginIndicatorsStore } from '@/store/useMarginIndicators'
import { PubSubEvents } from '@/typings'

export default function Initial(): null {
  const { address } = useAccount()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const resetBalances = useBalancesStore((state) => state.reset)
  const getTokenBalances = useBalancesStore((state) => state.getTokenBalances)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const updateMarginIndicators = useMarginIndicatorsStore((state) => state.updateMarginIndicators)
  const asyncUserBrokerBound = useSetAtom(asyncUserBrokerBoundAtom(address))
  const asyncWhetherUserIsBroker = useSetAtom(asyncWhetherUserIsBrokerAtom(address))
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
        const { name, token, price_decimals: decimals, derivative } = derivativeList[0]
        updateQuoteToken({ name, token, decimals, derivative, margin: marginToken.symbol })
      }
    }
  }, [derivativeList])

  /**
   * 1. Whether the user is a broker
   * 2. Broker bound
   */
  useEffect(() => {
    if (address) {
      void asyncUserBrokerBound()
      void asyncWhetherUserIsBroker()
    }
  }, [address])

  return null
}
