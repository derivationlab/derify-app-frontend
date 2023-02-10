import React, { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { useSpotPrice } from '@/hooks/useSpotPrice'
import { useConfigInfo } from '@/zustand/useConfigInfo'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useBalancesStore, usePairsInfo } from '@/zustand'
import { usePCFRatios } from '@/hooks/usePCFRatios'

export default function Updater(): null {
  const { data } = useAccount()
  const { isConnected } = useConnect()

  const marginToken = useConfigInfo((state) => state.marginToken)
  const resetBalances = useBalancesStore((state) => state.reset)
  const fetchBalances = useBalancesStore((state) => state.fetch)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const getFactoryConfig = useConfigInfo((state) => state.getFactoryConfig)
  const getProtocolConfig = useConfigInfo((state) => state.getProtocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)

  usePCFRatios(factoryConfig)
  const { data: spotPriceDAT, isLoading: spotPriceDATIsLoading } = useSpotPrice(factoryConfig)
  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)

  useEffect(() => {
    if (!data?.address) void resetBalances()
    else {
      void fetchBalances(data?.address)
    }
  }, [isConnected, data?.address])

  useEffect(() => {
    void getProtocolConfig()
  }, [])

  useEffect(() => {
    if (protocolConfigLoaded) {
      void getFactoryConfig()
    }
  }, [protocolConfigLoaded])

  useEffect(() => {
    if (!spotPriceDATIsLoading && spotPriceDAT) {
      updateSpotPrices(spotPriceDAT)
    }
  }, [spotPriceDATIsLoading, spotPriceDAT])

  useEffect(() => {
    if (!indicatorDATIsLoading && indicatorDAT) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDATIsLoading, indicatorDAT])

  return null
}
