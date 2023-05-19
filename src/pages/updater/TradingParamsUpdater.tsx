import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { useProtocolConfigStore, useTraderVariablesStore } from '@/store'
import { useOpeningMinLimitStore } from '@/store/useOpeningMinLimit'

export default function TradingParamsUpdater(): null {
  const { address } = useAccount()

  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const getOpeningMinLimit = useOpeningMinLimitStore((state) => state.getOpeningMinLimit)
  const getTraderVariables = useTraderVariablesStore((state) => state.getTraderVariables)

  // User Margin Data
  useEffect(() => {
    if (address && protocolConfig) {
      void getTraderVariables(address, protocolConfig.exchange)
    }
  }, [address, protocolConfig])

  // Minimum open position amount
  useEffect(() => {
    if (protocolConfig) {
      void getOpeningMinLimit(protocolConfig.exchange)
    }
  }, [protocolConfig])

  return null
}
