import { create } from 'zustand'

import { TokenSpotPricesState, Rec } from '@/store/types'

const useTokenSpotPricesStore = create<TokenSpotPricesState>((set) => ({
  tokenSpotPrices: null,
  tokenSpotPricesLoaded: false,
  updateTokenSpotPrices: (data: Rec) =>
    set(() => {
      return { tokenSpotPrices: data, tokenSpotPricesLoaded: true }
    })
}))

export { useTokenSpotPricesStore }
