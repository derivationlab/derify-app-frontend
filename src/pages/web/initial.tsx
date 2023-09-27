import { useSetAtom } from 'jotai'
import { isEmpty } from 'lodash-es'
import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { asyncUserBrokerBoundAtom, asyncWhetherUserIsBrokerAtom } from '@/atoms/useBrokerData'
import {
  useBalancesStore,
  useDerivativeListStore,
  useMarginTokenListStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useQuoteTokenStore
} from '@/store'
import { MarginTokenState, QuoteTokenState } from '@/store/types'
import { PubSubEvents } from '@/typings'

export default function Initial(): null {
  const { address } = useAccount()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const getTokenBalances = useBalancesStore((state) => state.getTokenBalances)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const getDerivativeList = useDerivativeListStore((state) => state.getDerivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getProtocolConfig = useProtocolConfigStore((state) => state.getProtocolConfig)
  const updateQuoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.updateQuoteToken)
  const asyncUserBrokerBound = useSetAtom(asyncUserBrokerBoundAtom(address))
  const asyncWhetherUserIsBroker = useSetAtom(asyncWhetherUserIsBrokerAtom(address))

  // user margin token balances
  useEffect(() => {
    const account = address ?? ''
    void getTokenBalances(account, marginTokenList)
    PubSub.unsubscribe(PubSubEvents.UPDATE_BALANCE)
    PubSub.subscribe(PubSubEvents.UPDATE_BALANCE, () => {
      void getTokenBalances(account, marginTokenList)
    })
  }, [address, marginTokenList])

  // Initialize margin token with protocol config
  useEffect(() => {
    void getProtocolConfig(marginToken.address)
  }, [marginToken])

  // Get trading pair data
  useEffect(() => {
    const factory = protocolConfig?.factory ?? ''
    void getDerivativeList(marginToken.address, factory)
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
