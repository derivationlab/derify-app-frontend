import React, { useEffect } from 'react'

import { usePairsInfo } from '@/zustand'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { getPCFAndSpotPrice } from '@/hooks/helper'
import { MarginTokenWithQuote } from '@/typings'
import { useConfigInfo, useMarginToken } from '@/zustand/useConfigInfo'

export default function Updater(): null {
  const marginToken = useMarginToken((state) => state.marginToken)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)

  // for quote token indicators
  useEffect(() => {
    if (!indicatorDATIsLoading && indicatorDAT) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDATIsLoading])

  // for pcf and spot price
  useEffect(() => {
    const func = async (factoryConfig: MarginTokenWithQuote) => {
      const { data1, data2 } = await getPCFAndSpotPrice(factoryConfig)
      updatePCFRatios(data1)
      updateSpotPrices(data2)
    }

    if (factoryConfigLoaded && factoryConfig) void func(factoryConfig)
  }, [factoryConfigLoaded, factoryConfig])

  return null
}
