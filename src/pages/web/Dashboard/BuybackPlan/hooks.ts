import { useBlockNumber } from 'wagmi'

import { useAllMarginPrice, useMarginPriceFeed } from '@/hooks/useAllMarginPrice'
import { useBuyBackPool } from '@/hooks/useDashboard'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { useMarginTokenListStore } from '@/store'

export const useInitData = () => {
  const allMarginTokenList = useMarginTokenListStore((state) => state.allMarginTokenList)
  const { data: blockNumber = 0 } = useBlockNumber({ watch: true })
  const { priceFeed } = useMarginPriceFeed(allMarginTokenList)
  const { data: tokenPrice } = usePlatformTokenPrice()
  const { data: buyBackInfo } = useBuyBackPool(allMarginTokenList)
  const { data: marginPrices } = useAllMarginPrice(priceFeed)

  const _buyBackInfo = buyBackInfo ?? Object.create(null)
  const _marginPrices = marginPrices ?? Object.create(null)

  return {
    tokenPrice,
    blockNumber,
    buyBackInfo: _buyBackInfo,
    marginPrices: _marginPrices
  }
}
