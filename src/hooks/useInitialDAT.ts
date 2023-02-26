import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { MarginTokenWithContract } from '@/typings'
import { useConfigInfo, useMarginToken, usePairsInfo, useTokenBalances } from '@/zustand'
import { getFactoryConfig, getMarginTokenPrice, getOpeningMinLimit } from '@/hooks/helper'
import { usePairIndicator } from '@/hooks/usePairIndicator'

export const useInitialDAT = () => {
  const { data } = useAccount()

  const { data: protocolConfDAT, isLoading: protocolConfDATIsLoading } = useProtocolConfig()

  const marginToken = useMarginToken((state) => state.marginToken)
  const fetchBalances = useTokenBalances((state) => state.fetch)
  const resetBalances = useTokenBalances((state) => state.reset)
  const updateFactoryConfig = useConfigInfo((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfo((state) => state.updateProtocolConfig)
  const updateOpeningMinLimit = useConfigInfo((state) => state.updateOpeningMinLimit)
  const updateMTokenPrices = useConfigInfo((state) => state.updateMTokenPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)

  // for tokens balance
  useEffect(() => {
    if (!data?.address) void resetBalances()
    else {
      void fetchBalances(data?.address)
    }
  }, [data?.address])

  // for protocol abi config
  useEffect(() => {
    if (!protocolConfDATIsLoading && protocolConfDAT) {
      updateProtocolConfig(protocolConfDAT)
    }
  }, [protocolConfDATIsLoading])

  // for factory abi config
  useEffect(() => {
    const func = async (protocolConfDAT: MarginTokenWithContract) => {
      const data = await getFactoryConfig(protocolConfDAT)
      updateFactoryConfig(data)
    }

    if (!protocolConfDATIsLoading && protocolConfDAT) void func(protocolConfDAT)
  }, [protocolConfDATIsLoading, protocolConfDAT])

  // for opening min limit config
  useEffect(() => {
    const func = async (protocolConfDAT: MarginTokenWithContract) => {
      const data1 = await getOpeningMinLimit(protocolConfDAT)
      const data2 = await getMarginTokenPrice(protocolConfDAT)
      updateOpeningMinLimit(data1)
      updateMTokenPrices(data2)
    }

    if (!protocolConfDATIsLoading && protocolConfDAT) void func(protocolConfDAT)
  }, [protocolConfDATIsLoading, protocolConfDAT])

  // for quote token indicators
  useEffect(() => {
    if (!indicatorDATIsLoading && indicatorDAT) {
      updateIndicators(indicatorDAT)
    }
  }, [indicatorDATIsLoading])
}
