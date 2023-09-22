import { getAddress } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { uniqBy } from 'lodash-es'

import { useMemo } from 'react'

import { traderFavoriteAtom } from '@/atoms/useTraderFavorite'
import { useTokenProtect } from '@/hooks/useTokenProtect'
import { usePriceDecimals, useTokenSpotPrice, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import { useMarginIndicatorsStore, useMarginTokenStore, useProtocolConfigStore, useTokenSpotPricesStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'

export const useInitData = (data: Rec[]) => {
  const indicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const updateSpotPrices = useTokenSpotPricesStore((state) => state.updateTokenSpotPricesForTrading)
  const traderFavorite = useAtomValue(traderFavoriteAtom)
  const { checking, quoteToken, derivativeList, updateQuoteToken } = useTokenProtect()
  const { decimals } = usePriceDecimals(uniqBy([...data, quoteToken, ...traderFavorite], 'token'))
  const { spotPrices } = useTokenSpotPrices(uniqBy([...data, quoteToken, ...traderFavorite], 'token'), decimals)
  const { spotPrice } = useTokenSpotPrice(spotPrices, quoteToken.name)

  return {
    checking,
    spotPrice,
    quoteToken,
    spotPrices,
    indicators,
    marginToken,
    derivativeList,
    traderFavorite,
    protocolConfig,
    updateSpotPrices,
    updateQuoteToken
  }
}

export const useIndicator = (quoteToken: Rec) => {
  const indicators = useMarginIndicatorsStore((state) => state.marginIndicators)
  const indicator = useMemo(() => {
    if (indicators) {
      const find = Object.keys(indicators).find((key) => getAddress(key) === getAddress(quoteToken.token))
      return find ? indicators[find]?.price_change_rate ?? 0 : 0
    }
    return 0
  }, [quoteToken, indicators])
  return { indicator }
}
