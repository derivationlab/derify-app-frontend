import create from 'zustand'
import { persist } from 'zustand/middleware'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { initial as initialProtocolConfig } from '@/hooks/useProtocolConfig'
import { initialOpeningMinLimit, initialFactoryConfig } from '@/hooks/helper'
import { ConfigInfoState, MarginTokenState, QuoteTokenState } from '@/zustand/types'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

const useConfigInfo = create<ConfigInfoState>((set, get) => ({
  openingMinLimit: initialOpeningMinLimit(),
  factoryConfig: initialFactoryConfig(),
  protocolConfig: initialProtocolConfig(),
  openingMinLimitLoaded: false,
  factoryConfigLoaded: false,
  protocolConfigLoaded: false,
  updateFactoryConfig: (data: MarginTokenWithQuote) =>
    set(() => {
      console.info('updateFactoryConfig:')
      console.info(data)
      return { factoryConfig: data, factoryConfigLoaded: true }
    }),
  updateProtocolConfig: (data: MarginTokenWithContract) =>
    set(() => {
      console.info('updateProtocolConfig:')
      console.info(data)
      return { protocolConfig: data, protocolConfigLoaded: true }
    }),
  updateOpeningMinLimit: (data: MarginToken) =>
    set(() => {
      console.info('updateOpeningMinLimit:')
      console.info(data)
      return { openingMinLimit: data, openingMinLimitLoaded: true }
    })
}))

const useQuoteToken = create(
  persist<QuoteTokenState>(
    (set, get) => ({
      quoteToken: QUOTE_TOKENS[0].symbol as QuoteTokenKeys,
      updateQuoteToken: (data: QuoteTokenKeys) => set({ quoteToken: data })
    }),
    {
      name: 'QUOTE_TOKEN'
    }
  )
)

const useMarginToken = create(
  persist<MarginTokenState>(
    (set, get) => ({
      marginToken: MARGIN_TOKENS[0].symbol as MarginTokenKeys,
      updateMarginToken: (data: MarginTokenKeys) => set({ marginToken: data })
    }),
    {
      name: 'MARGIN_TOKEN'
    }
  )
)

export { useConfigInfo, useQuoteToken, useMarginToken }
