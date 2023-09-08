import { useAtomValue } from 'jotai'

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
  const { decimals } = usePriceDecimals(data, [quoteToken, ...traderFavorite])
  const { spotPrices } = useTokenSpotPrices(data, decimals, [quoteToken, ...traderFavorite])
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
