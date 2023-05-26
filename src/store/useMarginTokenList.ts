import { orderBy } from 'lodash'
import { create } from 'zustand'

import { getMarginTokenList } from '@/api'
import { MarginTokenListState } from '@/store/types'

/**
 {
    "margin_token": "0x0839DbD1B5F33E6eAF3ed08C9b93630b37440584",
    "name": "Pig Finance",
    "symbol": "PIG",
    "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/8829.png",
    "cmc": "https://coinmarketcap.com/currencies/pig-finance/",
    "open": 1,
    "buyback_period": 1300,
    "buyback_sllipage": "0.020",
    "update_time": "2023-05-15T09:21:06.000Z",
    "max_pm_apy": 0
}
 */

const _getMarginTokenList = async (): Promise<(typeof marginTokenList)[]> => {
  const { data } = await getMarginTokenList()
  return data ? data?.records : []
}

export const marginTokenList = {
  open: 0,
  logo: '',
  name: '',
  symbol: '',
  max_pm_apy: 0,
  margin_token: ''
}

const useMarginTokenListStore = create<MarginTokenListState>((set) => ({
  marginTokenList: [],
  marginTokenSymbol: [],
  marginTokenListLoaded: false,
  getMarginTokenList: async () => {
    const data = await _getMarginTokenList()

    if (data.length) {
      const _ = orderBy(data, ['max_pm_apy', 'open'], 'desc')
      set({
        marginTokenList: _,
        marginTokenSymbol: _.map((margin) => margin.symbol),
        marginTokenListLoaded: true
      })
    }
  }
}))

export { useMarginTokenListStore }
