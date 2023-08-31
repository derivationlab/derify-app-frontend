import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { QUOTE_TOKEN_KEY } from '@/config'
import { QuoteTokenState } from '@/store/types'

export const quoteToken = { name: '', token: '', margin: '', decimals: 2, derivative: '' }

const useQuoteTokenStore = create(
  persist<QuoteTokenState>(
    (set) => ({
      quoteToken: quoteToken,
      updateQuoteToken: (data: typeof quoteToken) => set({ quoteToken: data })
    }),
    {
      name: QUOTE_TOKEN_KEY
    }
  )
)

export { useQuoteTokenStore }
