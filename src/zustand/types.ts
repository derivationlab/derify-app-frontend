import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'
import { InitialTraderVariablesType } from '@/hooks/helper'
import { OpeningType } from '@/zustand/useCalcMaxVolume'

export type Rec = Record<string, any>

export interface BalancesState {
  balances: Rec
  loaded: boolean
  fetch: (p: string) => Promise<void>
  reset: () => void
}

export interface ConfigInfoState {
  openingMinLimit: MarginToken
  openingMaxLimit: MarginTokenWithQuote
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  openingMinLimitLoaded: boolean
  openingMaxLimitLoaded: boolean
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  updateFactoryConfig: (p: MarginTokenWithQuote) => void
  updateProtocolConfig: (p: MarginTokenWithContract) => void
  updateOpeningMinLimit: (p: MarginToken) => void
  updateOpeningMaxLimit: (p: MarginTokenWithQuote) => void
}

export interface MarginTokenState {
  marginToken: MarginTokenKeys
  updateMarginToken: (p: MarginTokenKeys) => void
}

export interface QuoteTokenState {
  quoteToken: QuoteTokenKeys
  updateQuoteToken: (p: QuoteTokenKeys) => void
}

export interface PosDATState {
  positionOrd: Rec[]
  profitLossOrd: Rec[]
  loaded: boolean
  fetch: (trader: string, pairAddress: string, exchange: string, spotPrice: string) => Promise<void>
}

export interface VolumeState {
  maxVolume: Rec
  openingPrice: number
  leverageNow: number
  openingType: OpeningType
  updateOpeningType: (p: OpeningType) => void
  updateLeverageNow: (p: number) => void
  updateOpeningPrice: (p: number) => void
  fetch: (
    quoteTokenAddress: string,
    trader: string,
    price: string,
    exchange: string,
    marginToken: MarginTokenKeys
  ) => Promise<void>
}

export interface TraderInfoState {
  variables: InitialTraderVariablesType
  variablesLoaded: boolean
  updateVariables: (p: InitialTraderVariablesType) => void
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
