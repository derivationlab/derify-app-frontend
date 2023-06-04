import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { QuoteTokenState } from '@/store/types'

export const quoteToken = { symbol: '', token: '' }

const useQuoteTokenStore = create(
  persist<QuoteTokenState>(
    (set) => ({
      quoteToken: quoteToken,
      updateQuoteToken: (data: typeof quoteToken) => set({ quoteToken: data })
    }),
    {
      name: 'quoteToken'
    }
  )
)

export { useQuoteTokenStore }
