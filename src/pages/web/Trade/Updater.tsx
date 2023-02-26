import { useEffect } from 'react'

import { usePairsInfo } from '@/zustand'
import { useConfigInfo } from '@/zustand/useConfigInfo'
import { getOpeningMaxLimit } from '@/hooks/helper'
import { usePCFAndSpotPrice } from '@/hooks/usePCFAndSpotPrice'
import { MarginTokenWithContract } from '@/typings'

export default function Updater(): null {
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfo((state) => state.updateOpeningMaxLimit)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)

  const {
    data1: pcfDAT,
    data2: spotPriceDAT,
    isLoading: pcfAndSpotPriceDATIsLoading
  } = usePCFAndSpotPrice(factoryConfig)

  // for pcf and spot price
  useEffect(() => {
    if (!pcfAndSpotPriceDATIsLoading && pcfDAT && spotPriceDAT) {
      updatePCFRatios(pcfDAT)
      updateSpotPrices(spotPriceDAT)
    }
  }, [pcfAndSpotPriceDATIsLoading, pcfDAT, spotPriceDAT])

  useEffect(() => {
    const func = async (protocolConfig: MarginTokenWithContract) => {
      const data = await getOpeningMaxLimit(protocolConfig)
      updateOpeningMaxLimit(data)
    }

    if (protocolConfigLoaded && protocolConfig) void func(protocolConfig)
  }, [protocolConfigLoaded, protocolConfig])

  return null
}
