import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

import { findToken } from '@/config/tokens'
import { usePoolsInfo } from '@/zustand/usePoolsInfo'
import { useTraderInfo } from '@/zustand/useTraderInfo'
import { usePairIndicator } from '@/hooks/usePairIndicator'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { useCurrentIndexDAT, useCurrentPositionsAmount } from '@/hooks/useQueryApi'
import { MarginTokenWithContract, PubSubEvents } from '@/typings'
import { useConfigInfo, useMarginToken, usePairsInfo, useQuoteToken, useTokenBalances } from '@/zustand'
import { getFactoryConfig, getMarginTokenPrice, getOpeningMinLimit, getTraderVariables } from '@/hooks/helper'
import { useDashboardDAT } from '@/zustand/useDashboardDAT'

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
  const updateDashboardDAT = useDashboardDAT((state) => state.updateDashboardDAT)

  const { data: indicatorDAT, isLoading: indicatorDATIsLoading } = usePairIndicator(marginToken)
  const {
    data: positionsDAT,
    isLoading: positionsDATIsLoading,
    refetch: positionsDATRefetch
  } = useCurrentPositionsAmount(findToken(quoteToken).tokenAddress, findToken(marginToken).tokenAddress)
  const {
    data: currentIndexDAT,
    isLoading: currentIndexDATIsLoading,
    refetch: currentIndexDATRefetch
  } = useCurrentIndexDAT(findToken(marginToken).tokenAddress)

  useEffect(() => {
    void positionsDATRefetch()
  }, [quoteToken, marginToken])

  useEffect(() => {
    void currentIndexDATRefetch()
  }, [marginToken])

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
  }, [positionsDATIsLoading, positionsDAT])

  useEffect(() => {
    if (!currentIndexDATIsLoading && currentIndexDAT) {
      updateDashboardDAT(currentIndexDAT.data)
    }
  }, [currentIndexDATIsLoading, currentIndexDAT])

  // for trader variables
  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (data?.address && protocolConfigLoaded && protocolConfig) void func(data.address, protocolConfig)
  }, [protocolConfigLoaded, protocolConfig, data?.address, marginToken, quoteToken])

  useEffect(() => {
    PubSub.subscribe(PubSubEvents.UPDATE_BALANCE, () => {
      console.info('PubSubEvents.UPDATE_BALANCE')
      if (data?.address) void fetchBalances(data.address)
    })

    return () => {
      PubSub.clearAllSubscriptions()
    }
  }, [])
}
