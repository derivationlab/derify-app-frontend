import { create } from 'zustand'

import { MarginIndicatorsState } from '@/store/types'
import { Rec } from '@/typings'

const useMarginIndicatorsStore = create<MarginIndicatorsState>((set) => ({
  marginIndicators: null,
  marginIndicatorsLoaded: false,
  updateMarginIndicators: (data: Rec) =>
    set(() => {
      return { marginIndicators: data, marginIndicatorsLoaded: true }
    })
}))

export { useMarginIndicatorsStore }
