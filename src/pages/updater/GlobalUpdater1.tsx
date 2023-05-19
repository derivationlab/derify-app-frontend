import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PubSubEvents } from '@/typings'
import { MarginTokenState } from '@/store/types'
import { useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import { useMarginIndicators } from '@/hooks/useMarginIndicators'
import { useMarginIndicatorsStore } from '@/store/useMarginIndicators'
import {
  useBalancesStore,
  useDerivativeListStore,
  useMarginPriceStore, useMarginTokenListStore,
  useMarginTokenStore,
  useProtocolConfigStore,
  useTokenSpotPricesStore
} from '@/store'


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

  const { data: tokenSpotPrices } = useTokenSpotPrices(derAddressList)
  const { data: marginIndicators } = useMarginIndicators(marginToken.address)

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

  return null
}
