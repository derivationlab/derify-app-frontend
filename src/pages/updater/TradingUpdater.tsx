import { useEffect } from 'react'

import { usePairsInfo } from '@/store'
import { useSpotPrices } from '@/hooks/useSpotPrices'
import { useConfigInfo } from '@/store/useConfigInfo'
import { getOpeningMaxLimit } from '@/hooks/helper'
import { MarginTokenWithContract } from '@/typings'

export default function TradingUpdater(): null {
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfo((state) => state.updateOpeningMaxLimit)

  // for pcf and spot price
  const { data1: pcfDAT, data2: spotPriceDAT, refetch: refetchSpotPrices } = useSpotPrices(factoryConfig)

  useEffect(() => {
    if (factoryConfig && factoryConfigLoaded) void refetchSpotPrices()
  }, [factoryConfig, factoryConfigLoaded])

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
