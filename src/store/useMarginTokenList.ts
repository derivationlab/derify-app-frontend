import { orderBy } from 'lodash'
import { create } from 'zustand'

import { getMarginAddressList, getMarginTokenList } from '@/api'
import { MarginTokenListState } from '@/store/types'

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
  marginAddressList: [],
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
  },
  getMarginAddressList: async () => {
    const { data } = await getMarginAddressList()

    if (data.length) {
      set({
        marginAddressList: data
      })
    }
  }
}))

export { useMarginTokenListStore }
