import { create } from 'zustand'

import { MarginListState } from '@/store/types'
import { getMarginTokenList } from '@/api'

const getMarginList = async (index = 0, offset = 30) => {
  const { data } = await getMarginTokenList(index, offset)

  return data ? data?.records : []
}

const useMarginListStore = create<MarginListState>((set) => ({
  marginList: [],
  marginListLoaded: false,
  getMarginList: async (index = 0) => {
    const data = await getMarginList(index)
    console.info(data)
    set({ marginList: data, marginListLoaded: true })
  }
}))

export { useMarginListStore }
