import PubSub from 'pubsub-js'
import { useAccount } from 'wagmi'
import { useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

import { useMinimumGrant } from '@/hooks/useMinimumGrant'
import { useProtocolConfig } from '@/hooks/useProtocolConfig'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithContract, PubSubEvents } from '@/typings'
import { useConfigInfoStore, useQuoteTokenStore, useBalancesStore, useTraderInfoStore } from '@/store'
import { getFactoryConfig, getMarginTokenPrice, getOpeningMinLimit, getTraderVariables } from '@/hooks/helper'

export default function InitialUpdater(): null {
  const { address } = useAccount()
  const { pathname } = useLocation()

  const { data: protocolConfDAT, isLoading: protocolConfDATIsLoading } = useProtocolConfig()

  const quoteToken = useQuoteTokenStore((state) => state.quoteToken)
  const fetchBalances = useBalancesStore((state) => state.fetch)
  const resetBalances = useBalancesStore((state) => state.reset)
  const resetVariables = useTraderInfoStore((state) => state.reset)
  const updateVariables = useTraderInfoStore((state) => state.updateVariables)
  const updateMTokenPrices = useConfigInfoStore((state) => state.updateMTokenPrices)
  const updateMinimumGrant = useConfigInfoStore((state) => state.updateMinimumGrant)
  const updateFactoryConfig = useConfigInfoStore((state) => state.updateFactoryConfig)
  const updateProtocolConfig = useConfigInfoStore((state) => state.updateProtocolConfig)
  const updateOpeningMinLimit = useConfigInfoStore((state) => state.updateOpeningMinLimit)

  const marginToken = useMemo(() => {
    const find = MARGIN_TOKENS.find((m) => pathname.includes(m.symbol))
    return find?.symbol ?? DEFAULT_MARGIN_TOKEN.symbol
  }, [pathname]) as MarginTokenKeys

  const { data: minimumGrant, refetch } = useMinimumGrant(protocolConfDAT?.[marginToken])

  // for tokens balance
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

  // for trader variables
  useEffect(() => {
    const func = async (account: string, protocolConfig: MarginTokenWithContract) => {
      const data = await getTraderVariables(account, protocolConfig[marginToken].exchange)
      updateVariables(data)
    }

    if (address && !protocolConfDATIsLoading && protocolConfDAT) {
      void func(address, protocolConfDAT)
    }

    PubSub.subscribe(PubSubEvents.UPDATE_TRADER_VARIABLES, () => {
      console.info('UPDATE_TRADER_VARIABLES')
      if (address && !protocolConfDATIsLoading && protocolConfDAT) {
        void func(address, protocolConfDAT)
      }
    })
  }, [protocolConfDATIsLoading, protocolConfDAT, address, marginToken, quoteToken])

  // switch margin token need reset trader variables
  useEffect(() => {
    resetVariables()
  }, [marginToken])

  // for add grant config
  useEffect(() => {
    if (!protocolConfDATIsLoading && protocolConfDAT) void refetch()
  }, [protocolConfDATIsLoading, protocolConfDAT])

  // for add grant config
  useEffect(() => {
    updateMinimumGrant(minimumGrant)
  }, [minimumGrant])

  return null
}
