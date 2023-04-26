import { useEffect } from 'react'

import { usePCFAndPrice } from '@/hooks/usePairIndicator'
import { getOpeningMaxLimit } from '@/hooks/helper'
import { MarginTokenWithContract } from '@/typings'
import { useConfigInfoStore, usePairsInfoStore } from '@/store'

export default function TradingUpdater(): null {
  const factoryConfig = useConfigInfoStore((state) => state.factoryConfig)
  const protocolConfig = useConfigInfoStore((state) => state.protocolConfig)
  const updatePCFRatios = usePairsInfoStore((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfoStore((state) => state.updateSpotPrices)
  const protocolConfigLoaded = useConfigInfoStore((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfoStore((state) => state.updateOpeningMaxLimit)

  // for pcf and spot price
  const { data1: pcfDAT, data2: spotPriceDAT } = usePCFAndPrice(factoryConfig)

  useEffect(() => {
    updatePCFRatios(pcfDAT)
    updateSpotPrices(spotPriceDAT)
  }, [pcfDAT, spotPriceDAT])

  useEffect(() => {
    const func = async (protocolConfig: MarginTokenWithContract) => {
      const data = await getOpeningMaxLimit(protocolConfig)
      updateOpeningMaxLimit(data)
    }

    if (protocolConfigLoaded && protocolConfig) void func(protocolConfig)
  }, [protocolConfigLoaded, protocolConfig])

  return null
}
