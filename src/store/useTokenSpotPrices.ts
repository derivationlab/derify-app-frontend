import { create } from 'zustand'

import { TokenSpotPricesState } from '@/store/types'
import { Rec } from '@/typings'

const useTokenSpotPricesStore = create<TokenSpotPricesState>((set) => ({
  tokenSpotPrices: null,
  /**
   The position data needs a full amount of trading pairs as query conditions,
   not every trading pair has a position,
   only need to monitor the price of the currency with a position
   */
  tokenSpotPricesForPosition: null,
  /**
   * The bottom of the trading pair is loaded,
   * and the price is queried according to the current data of the trading pair
   */
  tokenSpotPricesForTrading: null,
  tokenSpotPricesLoaded: false,
  updateTokenSpotPrices: (data: Rec) =>
    set(() => {
      return { tokenSpotPrices: data, tokenSpotPricesLoaded: true }
    }),
  updateTokenSpotPricesForTrading: (data: Rec) =>
    set(() => {
      return { tokenSpotPricesForTrading: data }
    }),
  updateTokenSpotPricesForPosition: (data: Rec) =>
    set(() => {
      return { tokenSpotPricesForPosition: data }
    })
}))

export { useTokenSpotPricesStore }
