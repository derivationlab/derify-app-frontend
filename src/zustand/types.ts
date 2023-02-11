import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

export type Rec = Record<string, any>

export interface BalancesState {
  balances: Rec
  loaded: boolean
  fetch: (p: string) => Promise<void>
  reset: () => void
}

export interface ConfigInfoState {
  marginToken: MarginTokenKeys
  openingMinLimit: MarginToken
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  openingMinLimitLoaded: boolean
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  getFactoryConfig: () => Promise<void>
  getProtocolConfig: () => Promise<void>
  getOpeningMinLimit: () => Promise<void>
  setMarginToken: (p: MarginTokenKeys) => void
}

export interface QuoteTokenState {
  quoteToken: QuoteTokenKeys
}

export interface PairsInfoState {
  spotPrices: Rec
  indicators: Rec
  pcfRatios: Rec
  pcfRatiosLoaded: boolean
  indicatorsLoaded: boolean
  spotPricesLoaded: boolean
  updateSpotPrices: (p: Rec) => void
  updateIndicators: (p: Rec) => void
  updatePCFRatios: (p: Rec) => void
}