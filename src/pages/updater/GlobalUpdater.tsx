import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { useMarginIndicators } from '@/hooks/useMarginIndicators'
import { useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import {
  useBalancesStore,
  useBrokerInfoStore,
  useDerivativeListStore,
  useMarginTokenListStore,
  useMarginTokenStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { useMarginIndicatorsStore } from '@/store/useMarginIndicators'
import { PubSubEvents } from '@/typings'

export default function GlobalUpdater(): null {
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const getTokenBalances = useBalancesStore((state) => state.getTokenBalances)
  const resetBalances = useBalancesStore((state) => state.reset)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const updateMarginIndicators = useMarginIndicatorsStore((state) => state.updateMarginIndicators)
  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfoStore((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfoStore((state) => state.resetBrokerBound)
  const updateTokenSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPrices)
  const { data: tokenSpotPrices } = useTokenSpotPrices(derAddressList)
  const { data: marginIndicators } = useMarginIndicators(marginToken.address)

  // Token balances
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

  // Spot price
  useEffect(() => {
    if (tokenSpotPrices) {
      updateTokenSpotPrices(tokenSpotPrices)
    }
  }, [tokenSpotPrices])

  // Margin indicators
  useEffect(() => {
    if (marginIndicators) {
      updateMarginIndicators(marginIndicators)
    }
  }, [marginIndicators])

  // User broker info
  useEffect(() => {
    if (address) {
      resetBrokerInfo()
      resetBrokerBound()
      void fetchBrokerInfo(address, marginToken.address)
      void fetchBrokerBound(address)
    }

    PubSub.unsubscribe(PubSubEvents.UPDATE_BROKER_DAT)
    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_DAT, () => {
      if (address) void fetchBrokerInfo(address, marginToken.address)
    })
    PubSub.unsubscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT)
    PubSub.subscribe(PubSubEvents.UPDATE_BROKER_BOUND_DAT, () => {
      if (address) void fetchBrokerBound(address)
    })
  }, [address, marginToken])

  return null
}
