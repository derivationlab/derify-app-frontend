import { create } from 'zustand'

import { initialPCFAndPrice } from '@/hooks/usePairIndicator'
import { initial3 as initialIndicator } from '@/hooks/useQueryApi'
import { PairsInfoState, Rec } from '@/store/types'

const usePairsInfoStore = create<PairsInfoState>((set) => ({
  pcfRatios: initialPCFAndPrice(),
  spotPrices: initialPCFAndPrice(),
  indicators: initialIndicator(),
  pcfRatiosLoaded: false,
  indicatorsLoaded: false,
  spotPricesLoaded: false,
  updateSpotPrices: (data: Rec) =>
    set(() => {
      // console.info('updateSpotPrices:')
      // console.info(data)
      return { spotPrices: data, spotPricesLoaded: true }
    }),
  updateIndicators: (data: Rec) =>
    set(() => {
      // console.info('updateIndicators:')
      // console.info(data)
      return { indicators: data, indicatorsLoaded: true }
    }),
  updatePCFRatios: (data: Rec) =>
    set(() => {
      // console.info('updatePCFRatios:')
      // console.info(data)
      return { pcfRatios: data, pcfRatiosLoaded: true }
    })
}))

export { usePairsInfoStore }
