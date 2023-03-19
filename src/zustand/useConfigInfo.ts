import create from 'zustand'
import { persist } from 'zustand/middleware'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { initial as initialProtocolConfig } from '@/hooks/useProtocolConfig'
import { ConfigInfoState, QuoteTokenState, MarginTokenState } from '@/zustand/types'
import { initialOpeningMinLimit, initialFactoryConfig, initialOpeningMaxLimit } from '@/hooks/helper'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

const useConfigInfo = create<ConfigInfoState>((set) => ({
  minimumGrant: ['0', '0', '0'],
  brokerParams: { burnLimitAmount: '0', burnLimitPerDay: '0' },
  mTokenPrices: initialOpeningMinLimit(),
  factoryConfig: initialFactoryConfig(),
  protocolConfig: initialProtocolConfig(),
  openingMinLimit: initialOpeningMinLimit(),
  openingMaxLimit: initialOpeningMaxLimit(),
  mTokenPricesLoaded: false,
  factoryConfigLoaded: false,
  protocolConfigLoaded: false,
  openingMinLimitLoaded: false,
  openingMaxLimitLoaded: false,
  updateFactoryConfig: (data: MarginTokenWithQuote) =>
    set(() => {
      // console.info('updateFactoryConfig:')
      // console.info(data)
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
    }),
  updateBrokerParams: (data: any) =>
    set((state) => {
      return { brokerParams: { ...state.brokerParams, ...data } }
    }),
  updateMinimumGrant: (data: any) =>
    set(() => {
      return { minimumGrant: data }
    })
}))

const useQuoteToken = create(
  persist<QuoteTokenState>(
    (set) => ({
      quoteToken: QUOTE_TOKENS[0].symbol as QuoteTokenKeys,
      updateQuoteToken: (data: QuoteTokenKeys) =>
        set(() => {
          // console.info('updateQuoteToken:')
          // console.info(data)
          return { quoteToken: data }
        })
    }),
    {
      name: 'quoteToken'
    }
  )
)

const useMarginToken = create(
  persist<MarginTokenState>(
    (set) => ({
      marginToken: MARGIN_TOKENS[0].symbol as MarginTokenKeys,
      updateMarginToken: (data: MarginTokenKeys) =>
        set(() => {
          // console.info('updateMarginToken:')
          // console.info(data)
          return { marginToken: data }
        })
    }),
    {
      name: 'marginToken'
    }
  )
)

export { useConfigInfo, useQuoteToken, useMarginToken }
