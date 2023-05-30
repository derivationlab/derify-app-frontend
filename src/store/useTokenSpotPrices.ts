import { create } from 'zustand'

import { TokenSpotPricesState } from '@/store/types'
import { Rec } from '@/typings'

const useTokenSpotPricesStore = create<TokenSpotPricesState>((set) => ({
  tokenSpotPrices: null,
  tokenSpotPricesLoaded: false,
  updateTokenSpotPrices: (data: Rec) =>
    set(() => {
      return { tokenSpotPrices: data, tokenSpotPricesLoaded: true }
    })
}))

export { useTokenSpotPricesStore }
