import { useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { asyncTraderVariablesAtom } from '@/atoms/useTraderVariables'
import { useProtocolConfigStore } from '@/store'
import emitter, { EventTypes } from '@/utils/emitter'

export default function TradingUpdater(): null {
  const { address } = useAccount()
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const asyncTraderVariables = useSetAtom(
    asyncTraderVariablesAtom({
      userAccount: address,
      exchange: protocolConfig?.exchange
    })
  )

  // User Margin Data
  useEffect(() => {
    if (address && protocolConfig) void asyncTraderVariables()
    emitter.removeAllListeners(EventTypes.updateTraderVariables)
    emitter.addListener(EventTypes.updateTraderVariables, () => {
      void asyncTraderVariables()
    })
  }, [address, protocolConfig])

  return null
}
