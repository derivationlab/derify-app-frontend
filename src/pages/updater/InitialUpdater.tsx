import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

import { useMinimumGrant } from '@/hooks/useDashboard'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithContract, PubSubEvents } from '@/typings'
import { useConfigInfoStore, useQuoteTokenStore, useBalancesStore, useTraderInfoStore } from '@/store'
import { getFactoryConfig, getMarginTokenPrice, getOpeningMinLimit, getTraderVariables } from '@/hooks/helper'
import { useMarginListStore } from '@/store/useMarginToken'

export default function InitialUpdater(): null {
  const { address } = useAccount()
  const { pathname } = useLocation()

  const { marginData, brokerData, isLoading } = useProtocolConfig()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const fetchBalances = useBalancesStore((state) => state.fetch)
  const resetBalances = useBalancesStore((state) => state.reset)
  const getMarginList = useMarginListStore((state) => state.getMarginList)
  const resetVariables = useTraderInfoStore((state) => state.reset)
  const updateVariables = useTraderInfoStore((state) => state.updateVariables)
  const updateBrokerParams = useConfigInfoStore((state) => state.updateBrokerParams)
  const updateMTokenPrices = useConfigInfoStore((state) => state.updateMTokenPrices)
  const updateMinimumGrant = useConfigInfoStore((state) => state.updateMinimumGrant)
  const updateFactoryConfig = useConfigInfoStore((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfoStore((state) => state.updateProtocolConfig)
  const updateOpeningMinLimit = useConfigInfoStore((state) => state.updateOpeningMinLimit)

  const marginToken = useMemo(() => {
    const find = MARGIN_TOKENS.find((m) => pathname.includes(m.symbol))
    return find?.symbol ?? DEFAULT_MARGIN_TOKEN.symbol
  }, [pathname]) as MarginTokenKeys

  const { data: minimumGrant, refetch } = useMinimumGrant(marginData?.[marginToken])

  useEffect(() => {
    void getMarginList()
  }, [])

  useEffect(() => {
    if (!address) {
      void resetBalances()
    } else {
      void fetchBalances(address)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_BALANCE, () => {
      console.info('UPDATE_BALANCE')
      if (address) void fetchBalances(address)
    })
  }, [address])

  useEffect(() => {
    if (!isLoading) {
      if (brokerData) updateBrokerParams(brokerData)
      if (marginData) {
        void refetch()

        updateProtocolConfig(marginData)
      }
    }
  }, [isLoading])

  useEffect(() => {
    resetVariables()
  }, [marginToken])

  useEffect(() => {
    updateMinimumGrant(minimumGrant)
  }, [minimumGrant])

  useEffect(() => {
    const func = async (marginData: MarginTokenWithContract) => {
      const data0 = await getFactoryConfig(marginData)
      const data1 = await getOpeningMinLimit(marginData)
      const data2 = await getMarginTokenPrice(marginData)

      updateFactoryConfig(data0)
      updateOpeningMinLimit(data1)
      updateMTokenPrices(data2)
    }

    if (!isLoading && marginData) void func(marginData)
  }, [isLoading, marginData])

  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (address && !isLoading && marginData) {
      void func(address, marginData)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_TRADER_VARIABLES, () => {
      console.info('UPDATE_TRADER_VARIABLES')
      if (address && !isLoading && marginData) {
        void func(address, marginData)
      }
    })
  }, [isLoading, marginData, address, marginToken, quoteToken])

  return null
}
