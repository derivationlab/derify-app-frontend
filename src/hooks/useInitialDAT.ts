import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { findToken } from '@/config/tokens'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { MarginTokenWithContract } from '@/typings'
import { useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { useConfigInfo, useMarginToken, usePairsInfo, useQuoteToken, useTokenBalances } from '@/zustand'
import { getFactoryConfig, getMarginTokenPrice, getOpeningMinLimit, getTraderVariables } from '@/hooks/helper'

export const useInitialDAT = () => {
  const { data } = useAccount()

  const { data: protocolConfDAT, isLoading: protocolConfDATIsLoading } = useProtocolConfig()

  const quoteToken = useQuoteToken((state) => state.quoteToken)
  const marginToken = useMarginToken((state) => state.marginToken)
  const fetchBalances = useTokenBalances((state) => state.fetch)
  const resetBalances = useTokenBalances((state) => state.reset)
  const updateFactoryConfig = useConfigInfo((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfo((state) => state.updateProtocolConfig)
  const updateOpeningMinLimit = useConfigInfo((state) => state.updateOpeningMinLimit)
  const updateMTokenPrices = useConfigInfo((state) => state.updateMTokenPrices)
  const updateIndicators = usePairsInfo((state) => state.updateIndicators)
  const updatePositionsAmount = usePoolsInfo((state) => state.updatePositionsAmount)
  const updateVariables = useTraderInfo((state) => state.updateVariables)
  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)
  const { data: positionsDAT, isLoading: positionsDATIsLoading } = useCurrentPositionsAmount(findToken(quoteToken).tokenAddress, findToken(marginToken).tokenAddress)

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

  useEffect(() => {
    if (!positionsDATIsLoading && positionsDAT) {
      updatePositionsAmount(positionsDAT.data)
    }
  }, [positionsDATIsLoading])

  // for trader variables
  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (
      data?.address &&
      protocolConfigLoaded &&
      protocolConfig
    )
      void func(data.address, protocolConfig)
  }, [protocolConfigLoaded, protocolConfig, data?.address, marginToken, quoteToken])
}
