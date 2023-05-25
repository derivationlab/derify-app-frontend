import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { useMarginIndicators } from '@/hooks/useMarginIndicators'
import { useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import {
  useBalancesStore,
  useBrokerInfoStore,
  useDerivativeListStore,
  useMarginPriceStore,
  useMarginTokenListStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'
import { MarginTokenState } from '@/store/types'
import { useMarginIndicatorsStore } from '@/store/useMarginIndicators'
import { PubSubEvents } from '@/typings'

export default function GlobalUpdater(): null {
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const fetchBalances = useBalancesStore((state) => state.getTokenBalances)
  const resetBalances = useBalancesStore((state) => state.reset)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getMarginPrice = useMarginPriceStore((state) => state.getMarginPrice)
  const derAddressList = useDerivativeListStore((state) => state.derAddressList)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const updateTokenSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPrices)
  const updateMarginIndicators = useMarginIndicatorsStore((state) => state.updateMarginIndicators)
  const fetchBrokerInfo = useBrokerInfoStore((state) => state.fetchBrokerInfo)
  const resetBrokerInfo = useBrokerInfoStore((state) => state.resetBrokerInfo)
  const fetchBrokerBound = useBrokerInfoStore((state) => state.fetchBrokerBound)
  const resetBrokerBound = useBrokerInfoStore((state) => state.resetBrokerBound)

  const { data: tokenSpotPrices } = useTokenSpotPrices(derAddressList)
  const { data: marginIndicators } = useMarginIndicators(marginToken.address)

  // Token balances
  useEffect(() => {
    if (!address) {
      void resetBalances()
    } else {
      if (marginTokenList.length) void fetchBalances(address, marginTokenList)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_BALANCE, () => {
      console.info('UPDATE_BALANCE')
      if (address && marginTokenList.length) void fetchBalances(address, marginTokenList)
    })
  }, [address, marginTokenList])

  // Margin price
  useEffect(() => {
    if (protocolConfig) {
      void getMarginPrice(protocolConfig.priceFeed)
    }
  }, [protocolConfig])

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
