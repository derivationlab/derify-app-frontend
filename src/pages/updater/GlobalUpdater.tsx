import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { useMinimumGrant } from '@/hooks/useDashboard'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithContract, PubSubEvents } from '@/typings'
import { useConfigInfoStore, useQuoteTokenStore, useTraderInfoStore } from '@/store'
import { getFactoryConfig, getMarginTokenPrice, getTraderVariables } from '@/hooks/helper'

export default function GlobalUpdater(): null {
  const { address } = useAccount()
  const { pathname } = useLocation()

  const { marginData, brokerData, isLoading } = useProtocolConfig()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const resetVariables = useTraderInfoStore((state) => state.reset)
  const updateVariables = useTraderInfoStore((state) => state.updateVariables)
  const updateBrokerParams = useConfigInfoStore((state) => state.updateBrokerParams)
  const updateMTokenPrices = useConfigInfoStore((state) => state.updateMTokenPrices)
  const updateMinimumGrant = useConfigInfoStore((state) => state.updateMinimumGrant)
  const updateFactoryConfig = useConfigInfoStore((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfoStore((state) => state.updateProtocolConfig)

  const marginToken = useMemo(() => {
    const find = MARGIN_TOKENS.find((m) => pathname.includes(m.symbol))
    return find?.symbol ?? DEFAULT_MARGIN_TOKEN.symbol
  }, [pathname]) as MarginTokenKeys

  const { data: minimumGrant, refetch } = useMinimumGrant(marginData?.[marginToken])

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
      const data2 = await getMarginTokenPrice(marginData)

      updateFactoryConfig(data0)
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
