import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { isGT } from '@/utils/tools'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { usePCFAndSpotPrice } from '@/hooks/usePCFAndSpotPrice'
import { MarginTokenWithContract } from '@/typings'
import { usePairsInfo, useQuoteToken } from '@/zustand'
import { useConfigInfo, useMarginToken } from '@/zustand/useConfigInfo'
import { getOpeningMaxLimit, getTraderVariables } from '@/hooks/helper'

export default function Updater(): null {
  const { data } = useAccount()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  const updateOpeningMaxLimit = useConfigInfo((state) => state.updateOpeningMaxLimit)
  const updatePCFRatios = usePairsInfo((state) => state.updatePCFRatios)
  const updateSpotPrices = usePairsInfo((state) => state.updateSpotPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)
  const updateVariables = useTraderInfo((state) => state.updateVariables)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)
  const {
    data1: pcfDAT,
    data2: spotPriceDAT,
    isLoading: pcfAndSpotPriceDATIsLoading
  } = usePCFAndSpotPrice(factoryConfig)

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

  // for trader variables
  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (
      data?.address &&
      protocolConfigLoaded &&
      protocolConfig &&
      spotPriceDAT &&
      isGT(spotPriceDAT[marginToken][quoteToken], 0)
    )
      void func(data.address, protocolConfig)
  }, [protocolConfigLoaded, protocolConfig, data?.address, marginToken, quoteToken, spotPriceDAT])

  useEffect(() => {
    const func = async (protocolConfig: MarginTokenWithContract) => {
      const data = await getOpeningMaxLimit(protocolConfig)
      updateOpeningMaxLimit(data)
    }

    if (protocolConfigLoaded && protocolConfig) void func(protocolConfig)
  }, [protocolConfigLoaded, protocolConfig])

  return null
}
