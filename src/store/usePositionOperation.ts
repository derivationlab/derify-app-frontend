import { create } from 'zustand'

import { PositionOperationState } from '@/store/types'
import { PositionOrderTypes } from '@/typings'

const usePositionOperationStore = create<PositionOperationState>((set, get) => ({
  openingType: PositionOrderTypes.Market,
  leverageNow: 30,
  closingType: '',
  openingPrice: '0',
  closingAmount: '0',
  openingAmount: '0',
  updateOpeningType: (data: PositionOrderTypes) =>
    set(() => {
      return { openingType: data }
    }),
  updateClosingType: (data: string) =>
    set(() => {
      return { closingType: data }
    }),
  updateLeverageNow: (data: PositionOrderTypes) =>
    set(() => {
      return { leverageNow: data }
    }),
  updateOpeningPrice: (data: string) =>
    set(() => {
      return { openingPrice: data }
    }),
  updateOpeningAmount: (data: string) =>
    set(() => {
      return { openingAmount: data }
    }),
  updateClosingAmount: (data: string) =>
    set(() => {
      return { closingAmount: data }
    })
}))

export { usePositionOperationStore }
