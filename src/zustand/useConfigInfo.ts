import create from 'zustand'
import { persist } from 'zustand/middleware'

import { QUOTE_TOKENS } from '@/config/tokens'
import { initial as initialProtocolConfig } from '@/hooks/useProtocolConfig'
import { ConfigInfoState, QuoteTokenState } from '@/zustand/types'
import { initialOpeningMinLimit, initialFactoryConfig, initialOpeningMaxLimit } from '@/hooks/helper'
import { MarginToken, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

const useConfigInfo = create<ConfigInfoState>((set) => ({
  brokerParams: { burnLimitAmount: '0', burnLimitPerDay: '0' },
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
      name: 'QUOTE_TOKEN'
    }
  )
)

export { useConfigInfo, useQuoteToken }
