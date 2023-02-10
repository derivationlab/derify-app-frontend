import create from 'zustand'

import { PairsInfoState, Rec } from '@/zustand/types'
import { initial as initialSpotPrice } from '@/hooks/useSpotPrice'
import { initial as initialIndicator } from '@/hooks/usePairIndicator'

const usePairsInfo = create<PairsInfoState>((set) => ({
  spotPrices: initialSpotPrice(),
  indicators: initialIndicator(),
  indicatorsLoaded: false,
  spotPricesLoaded: false,
  updateSpotPrices: (data: Rec) =>
    set(() => {
      // console.info(data)
      return { spotPrices: data, spotPricesLoaded: true }
    }),
  updateIndicators: (data: Rec) =>
    set(() => {
      // console.info(data)
      return { indicators: data, indicatorsLoaded: true }
    })
}))

export { usePairsInfo }
