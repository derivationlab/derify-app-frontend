import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MarginTokenState } from '@/store/types'

export const marginToken = { logo: '', symbol: '', address: '' }

const useMarginTokenStore = create(
  persist<MarginTokenState>(
    (set) => ({
      marginToken: marginToken,
      updateMarginToken: (data: typeof marginToken) => set({ marginToken: data })
    }),
    {
      name: 'marginToken'
    }
  )
)

export { useMarginTokenStore }
