import create from 'zustand'

import { PairsInfoState, Rec } from '@/store/types'
import { initialPCFAndSpotPrice } from '@/hooks/useSpotPrices'
import { initial as initialIndicator } from '@/hooks/usePairIndicator'

const usePairsInfo = create<PairsInfoState>((set) => ({
  pcfRatios: initialPCFAndSpotPrice(),
  spotPrices: initialPCFAndSpotPrice(),
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

export { usePairsInfo }
