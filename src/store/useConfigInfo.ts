import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { initialOpeningMinLimit, initialFactoryConfig, initialOpeningMaxLimit } from '@/hooks/helper'
import { minimumGrantInit } from '@/hooks/useDashboard'
import { initial as initialProtocolConfig } from '@/hooks/useProtocolConfig'
import { ConfigInfoState, QuoteTokenState, MarginTokenState } from '@/store/types'
import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

const useConfigInfoStore = create<ConfigInfoState>((set) => ({
  minimumGrant: minimumGrantInit,
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
  updateMinimumGrant: (data: typeof minimumGrantInit) =>
    set(() => {
      return { minimumGrant: data }
    })
}))

export { useConfigInfoStore }
