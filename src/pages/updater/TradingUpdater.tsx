import { useEffect } from 'react'
import { useInterval } from 'react-use'

import { usePairsInfo } from '@/store'
import { useConfigInfo } from '@/store/useConfigInfo'
import { getOpeningMaxLimit, getPCFAndSpotPrice } from '@/hooks/helper'
import { MarginTokenWithContract, MarginTokenWithQuote } from '@/typings'

export default function TradingUpdater(): null {
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfo((state) => state.updateOpeningMaxLimit)

  useEffect(() => {
    const func = async (protocolConfig: MarginTokenWithContract) => {
      const data = await getOpeningMaxLimit(protocolConfig)
      updateOpeningMaxLimit(data)
    }

    if (protocolConfigLoaded && protocolConfig) void func(protocolConfig)
  }, [protocolConfigLoaded, protocolConfig])

  // for pcf and spot price
  const _getPCFAndSpotPrice = async (factoryConfig: MarginTokenWithQuote) => {
    const { data1: pcfDAT, data2: spotPriceDAT } = await getPCFAndSpotPrice(factoryConfig)
    updatePCFRatios(pcfDAT)
    updateSpotPrices(spotPriceDAT)
  }

  // for pcf and spot price
  useInterval(() => {
    if (factoryConfig && factoryConfigLoaded) void _getPCFAndSpotPrice(factoryConfig)
  }, 3000)

  return null
}
