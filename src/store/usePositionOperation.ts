import { create } from 'zustand'

import { PositionOperationState } from '@/store/types'
import { PositionOrderTypes } from '@/typings'

export const initOpeningParams = {
  openingType: PositionOrderTypes.Market,
  leverageNow: 0,
  closingType: '',
  openingPrice: '0',
  closingAmount: '0',
  openingAmount: '0'
}

const usePositionOperationStore = create<PositionOperationState>((set) => ({
  openingParams: initOpeningParams,
  updateOpeningParams: (data: Partial<typeof initOpeningParams>) =>
    set((state) => ({ openingParams: { ...state.openingParams, ...data } }))
}))

export { usePositionOperationStore }
