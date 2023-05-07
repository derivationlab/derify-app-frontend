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
  const factoryConfigLoaded = useConfigInfoStore((state) => state.factoryConfigLoaded)
  const protocolConfigLoaded = useConfigInfoStore((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfoStore((state) => state.updateOpeningMaxLimit)

  // for pcf and spot price
  const { data, refetch } = usePCFAndPrice(factoryConfig, factoryConfigLoaded)

  useEffect(() => {
    if (data) {
      updatePCFRatios(data.pcfs)
      updateSpotPrices(data.prices)
    }
  }, [data])

  useEffect(() => {
    if (factoryConfigLoaded && factoryConfig) void refetch()
  }, [factoryConfig, factoryConfigLoaded])

  useEffect(() => {
    const func = async (protocolConfig: MarginTokenWithContract) => {
      const data = await getOpeningMaxLimit(protocolConfig)
      updateOpeningMaxLimit(data)
    }

    if (protocolConfigLoaded && protocolConfig) void func(protocolConfig)
  }, [protocolConfig, protocolConfigLoaded])

  return null
}
