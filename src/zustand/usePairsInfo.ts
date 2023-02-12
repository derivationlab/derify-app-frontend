import create from 'zustand'

import { PairsInfoState, Rec } from '@/zustand/types'
import { initial as initialPCFRatios } from '@/hooks/usePCFAndSpotPrice'
import { initial as initialIndicator } from '@/hooks/usePairIndicator'

const usePairsInfo = create<PairsInfoState>((set) => ({
  pcfRatios: initialPCFRatios(),
  spotPrices: initialPCFRatios(),
  indicators: initialIndicator(),
  pcfRatiosLoaded: false,
  indicatorsLoaded: false,
  spotPricesLoaded: false,
  updateSpotPrices: (data: Rec) =>
    set(() => {
      console.info('updateSpotPrices:')
      console.info(data)
      return { spotPrices: data, spotPricesLoaded: true }
    }),
  updateIndicators: (data: Rec) =>
    set(() => {
      console.info('updateIndicators:')
      console.info(data)
      return { indicators: data, indicatorsLoaded: true }
    }),
  updatePCFRatios: (data: Rec) =>
    set(() => {
      console.info('updatePCFRatios:')
      console.info(data)
      return { pcfRatios: data, pcfRatiosLoaded: true }
    })
}))

export { usePairsInfo }

/**
 DRF:{
  BTC:{
    long:0,
    short:0,
    twoWay:0,
  }
 }
 */
