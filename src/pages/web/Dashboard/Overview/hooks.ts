import { getMarginTransactionEquity } from '@/api'
import { useMarginTokenListStore } from '@/store'
import { useBoundPools } from '@/hooks/useBoundPools'
import { useAllCurrentTrading } from '@/hooks/useAllCurrentTrading'
import { useAllMarginIndicators } from '@/hooks/useMarginIndicators'
import { useFactoryConfig, useMarginPosVolume, useTradingAddresses } from '@/hooks/useMarginPosVolume'
import { usePriceDecimals, useTokenSpotPrices } from '@/hooks/useTokenSpotPrices'
import { Rec } from '@/typings'
import { useState, useEffect } from 'react'
import { useAllMarginPrice, useMarginPriceFeed } from '@/hooks/useAllMarginPrice'

export const useInitData = () => {
  const [equityValues, setEquityValues] = useState<Rec[]>([])

  const pagingParams = useMarginTokenListStore((state) => state.pagingParams)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const allMarginTokenList = useMarginTokenListStore((state) => state.allMarginTokenList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)
  const { data: boundPools } = useBoundPools(allMarginTokenList)
  const { data: tradingVol } = useAllCurrentTrading(allMarginTokenList)
  const { data: indicators } = useAllMarginIndicators(allMarginTokenList)
  const { data: allPositions } = useMarginPosVolume()
  const { factoryConfig } = useFactoryConfig(allPositions)
  const { addresses } = useTradingAddresses(factoryConfig, allPositions)
  const { decimals } = usePriceDecimals(addresses)
  const { spotPrices } = useTokenSpotPrices(addresses, decimals)
  const { priceFeed } = useMarginPriceFeed(allMarginTokenList)
  const { data: prices } = useAllMarginPrice(priceFeed)

  const _getMarginTransactionEquity = async () => {
    /**
     {
    "trading_net_value": "1337251894.6796877714711729",
    "margin_token": "0x6744e566f2C9E97d4aA6CbeedAb231f7Ea135640"
}
     */
    const { data } = await getMarginTransactionEquity()
    setEquityValues(data ?? [])
  }

  useEffect(() => {
    void _getMarginTransactionEquity()
  }, [])

  return {
    prices,
    decimals,
    addresses,
    spotPrices,
    indicators,
    boundPools,
    tradingVol,
    equityValues,
    allPositions,
    pagingParams,
    factoryConfig,
    marginTokenList,
    allMarginTokenList,
    marginTokenListLoaded
  }
}