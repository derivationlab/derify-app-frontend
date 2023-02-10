import { MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote } from '@/typings'

export type Rec = Record<string, any>

export interface BalancesState {
  balances: Rec
  loaded: boolean
  fetch: (p: string) => Promise<void>
  reset: () => void
}

export interface ConfigInfoState {
  marginToken: MarginTokenKeys
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  getFactoryConfig: () => Promise<void>
  getProtocolConfig: () => Promise<void>
  setMarginToken: (p: MarginTokenKeys) => void
}

export interface PairsInfoState {
  spotPrices: Rec
  indicators: Rec
  indicatorsLoaded: boolean
  spotPricesLoaded: boolean
  updateSpotPrices: (p: Rec) => void
  updateIndicators: (p: Rec) => void
}