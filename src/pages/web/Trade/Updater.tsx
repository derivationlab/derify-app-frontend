import React, { useEffect } from 'react'
import { useAccount, useConnect } from 'wagmi'

import { usePCFAndSpotPrice } from '@/hooks/usePCFAndSpotPrice'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useFactoryConfig } from '@/hooks/useFactoryConfig'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { useOpeningMinLimit } from '@/hooks/useOpeningMinLimit'
import { useConfigInfo, useMarginToken } from '@/zustand/useConfigInfo'
import { useBalancesStore, usePairsInfo } from '@/zustand'

export default function Updater(): null {
  const { data } = useAccount()
  const { isConnected } = useConnect()

  const marginToken = useMarginToken((state) => state.marginToken)
  const resetBalances = useBalancesStore((state) => state.reset)
  const fetchBalances = useBalancesStore((state) => state.fetch)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const updateFactoryConfig = useConfigInfo((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfo((state) => state.updateProtocolConfig)
  const updateOpeningMinLimit = useConfigInfo((state) => state.updateOpeningMinLimit)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)

  const {
    data1: pcfRatiosDAT,
    data2: spotPriceDAT,
    isLoading: pcfAndSpotPriceDATIsLoading
  } = usePCFAndSpotPrice(factoryConfig)
  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)
  const { data: factoryConfDAT, isLoading: factoryConfDATIsLoading } = useFactoryConfig(protocolConfig)
  const { data: protocolConfDAT, isLoading: protocolConfDATIsLoading } = useProtocolConfig()
  const { data: openingMinLimitDAT, isLoading: openingMinLimitDATIsLoading } = useOpeningMinLimit(protocolConfig)

  useEffect(() => {
    if (!data?.address) void resetBalances()
    else {
      void fetchBalances(data?.address)
    }
  }, [isConnected, data?.address])

  useEffect(() => {
    if (!pcfAndSpotPriceDATIsLoading && spotPriceDAT && pcfRatiosDAT) {
      updateSpotPrices(spotPriceDAT)
      updatePCFRatios(pcfRatiosDAT)
    }
  }, [pcfAndSpotPriceDATIsLoading])

  useEffect(() => {
    if (!openingMinLimitDATIsLoading && openingMinLimitDAT) {
      updateOpeningMinLimit(openingMinLimitDAT)
    }
  }, [openingMinLimitDATIsLoading])

  useEffect(() => {
    if (!factoryConfDATIsLoading && factoryConfDAT) {
      updateFactoryConfig(factoryConfDAT)
    }
  }, [factoryConfDATIsLoading])

  useEffect(() => {
    if (!protocolConfDATIsLoading && protocolConfDAT) {
      updateProtocolConfig(protocolConfDAT)
    }
  }, [protocolConfDATIsLoading])

  useEffect(() => {
    if (!indicatorDATIsLoading && indicatorDAT) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDATIsLoading])

  return null
}
