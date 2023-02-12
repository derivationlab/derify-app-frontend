import React, { useEffect } from 'react'

import { usePairsInfo } from '@/zustand'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useConfigInfo, useMarginToken } from '@/zustand/useConfigInfo'
import { usePCFAndSpotPrice } from '@/hooks/usePCFAndSpotPrice'
import { MarginTokenWithContract } from '@/typings'
import { getFactoryConfig, getTraderVariables } from '@/hooks/helper'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { useAccount } from 'wagmi'

export default function Updater(): null {
  const { data } = useAccount()

  const marginToken = useMarginToken((state) => state.marginToken)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)
  const updateVariables = useTraderInfo((state) => state.updateVariables)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)
  const { data1: pcfDAT, data2: spotPriceDAT, isLoading: pcfAndSpotPriceDATIsLoading } = usePCFAndSpotPrice(factoryConfig)

  // for quote token indicators
  useEffect(() => {
    if (!indicatorDATIsLoading && indicatorDAT) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDATIsLoading])

  // for pcf and spot price
  useEffect(() => {
    if (!pcfAndSpotPriceDATIsLoading && pcfDAT && spotPriceDAT) {
      updatePCFRatios(pcfDAT)
      updateSpotPrices(spotPriceDAT)
    }
  }, [pcfAndSpotPriceDATIsLoading, pcfDAT, spotPriceDAT])

  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (data?.address && protocolConfigLoaded && protocolConfig) void func(data.address, protocolConfig)
  }, [protocolConfigLoaded, protocolConfig, data?.address, marginToken, ])

  return null
}
