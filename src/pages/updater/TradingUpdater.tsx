import { useSetAtom } from 'jotai'
import { useAccount } from 'wagmi'

import { useEffect } from 'react'

import { asyncTraderFavoriteAtom } from '@/atoms/useTraderFavorite'
import { asyncTraderVariablesAtom } from '@/atoms/useTraderVariables'
import { useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import emitter, { EventTypes } from '@/utils/emitter'

export default function TradingUpdater(): null {
  const { address } = useAccount()
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const asyncTraderFavorite = useSetAtom(
    asyncTraderFavoriteAtom({
      trader: address,
      marginToken: marginToken.address
    })
  )
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

  // User Favorite Trade Pair
  useEffect(() => {
    if (address && marginToken) void asyncTraderFavorite()
    emitter.removeAllListeners(EventTypes.updateTraderFavorite)
    emitter.addListener(EventTypes.updateTraderFavorite, () => {
      void asyncTraderFavorite()
    })
  }, [address, marginToken])

  return null
}
