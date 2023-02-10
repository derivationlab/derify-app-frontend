import create from 'zustand'

import { PairsInfoState, Rec } from '@/zustand/types'
import { initial as initialPCFRatios } from '@/hooks/usePCFRatios'
import { initial as initialSpotPrice } from '@/hooks/useSpotPrice'
import { initial as initialIndicator } from '@/hooks/usePairIndicator'

const usePairsInfo = create<PairsInfoState>((set) => ({
  pcfRatios: initialPCFRatios(),
  spotPrices: initialSpotPrice(),
  indicators: initialIndicator(),
  pcfRatiosLoaded: false,
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
    }),
  updatePCFRatios: (data: Rec) =>
    set(() => {
      // console.info(data)
      return { pcfRatios: data, pcfRatiosLoaded: true }
    })
}))

export { usePairsInfo }
