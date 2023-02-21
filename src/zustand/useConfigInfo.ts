import create from 'zustand'
import { persist } from 'zustand/middleware'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { initial as initialProtocolConfig } from '@/hooks/useProtocolConfig'
import { ConfigInfoState, MarginTokenState, QuoteTokenState } from '@/zustand/types'
import { initialOpeningMinLimit, initialFactoryConfig, initialOpeningMaxLimit } from '@/hooks/helper'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

const useConfigInfo = create<ConfigInfoState>((set, get) => ({
  mTokenPrices: initialOpeningMinLimit(),
  factoryConfig: initialFactoryConfig(),
  protocolConfig: initialProtocolConfig(),
  openingMinLimit: initialOpeningMinLimit(),
  openingMaxLimit: initialOpeningMaxLimit(),
  factoryConfigLoaded: false,
  protocolConfigLoaded: false,
  openingMinLimitLoaded: false,
  openingMaxLimitLoaded: false,
  mTokenPricesLoaded: false,
  updateFactoryConfig: (data: MarginTokenWithQuote) =>
    set(() => {
      console.info('updateFactoryConfig:')
      console.info(data)
      return { factoryConfig: data, factoryConfigLoaded: true }
    }),
  updateProtocolConfig: (data: MarginTokenWithContract) =>
    set(() => {
      // console.info('updateProtocolConfig:')
      // console.info(data)
      return { protocolConfig: data, protocolConfigLoaded: true }
    }),
  updateOpeningMinLimit: (data: MarginToken) =>
    set(() => {
      // console.info('updateOpeningMinLimit:')
      // console.info(data)
      return { openingMinLimit: data, openingMinLimitLoaded: true }
    }),
  updateMTokenPrices: (data: any) =>
    set(() => {
      // console.info('updateMTokenPrices:')
      // console.info(data)
      return { mTokenPrices: data, mTokenPricesLoaded: true }
    }),
  updateOpeningMaxLimit: (data: MarginTokenWithQuote) =>
    set(() => {
      // console.info('updateOpeningMaxLimit-size:')
      // console.info(data)
      return { openingMaxLimit: data, openingMaxLimitLoaded: true }
    })
}))

const useQuoteToken = create(
  persist<QuoteTokenState>(
    (set, get) => ({
      quoteToken: QUOTE_TOKENS[0].symbol as QuoteTokenKeys,
      updateQuoteToken: (data: QuoteTokenKeys) =>
        set(() => {
          // console.info('updateQuoteToken:')
          // console.info(data)
          return { quoteToken: data }
        })
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
      updateMarginToken: (data: MarginTokenKeys) =>
        set(() => {
          // console.info('updateMarginToken:')
          // console.info(data)
          return { marginToken: data }
        })
    }),
    {
      name: 'MARGIN_TOKEN'
    }
  )
)

export { useConfigInfo, useQuoteToken, useMarginToken }
