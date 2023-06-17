import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MarginTokenState } from '@/store/types'

export const marginToken = { logo: '', symbol: '', address: '', decimals: 2 }

const useMarginTokenStore = create(
  persist<MarginTokenState>(
    (set, get) => ({
      marginToken: marginToken,
      updateMarginToken: (data: typeof marginToken) => {
        if (get().marginToken.symbol !== data.symbol) {
          set({ marginToken: data })
        }
      }
    }),
    {
      name: 'marginToken'
    }
  )
)

export { useMarginTokenStore }
