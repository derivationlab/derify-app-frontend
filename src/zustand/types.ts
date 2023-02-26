import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'
import { InitialTraderVariablesType } from '@/hooks/helper'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'

export type Rec = Record<string, any>

export interface BalancesState {
  balances: Rec
  loaded: boolean
  fetch: (p: string) => Promise<void>
  reset: () => void
}

export interface ConfigInfoState {
  mTokenPrices: MarginToken
  openingMinLimit: MarginToken
  openingMaxLimit: MarginTokenWithQuote
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  openingMinLimitLoaded: boolean
  openingMaxLimitLoaded: boolean
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  mTokenPricesLoaded: boolean
  updateFactoryConfig: (p: MarginTokenWithQuote) => void
  updateProtocolConfig: (p: MarginTokenWithContract) => void
  updateOpeningMinLimit: (p: MarginToken) => void
  updateMTokenPrices: (p: MarginToken) => void
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
  fetch: (trader: string, factoryConfig: Rec) => Promise<void>
}

export interface VolumeState {
  tfr: number
  maxVolume: Rec
  closingType: MarginTokenKeys
  closingAmount: number
  openingPrice: number
  openingAmount: number
  leverageNow: number
  openingType: OpeningType
  updateClosingType: (p: MarginTokenKeys) => void
  updateOpeningType: (p: OpeningType) => void
  updateLeverageNow: (p: number) => void
  updateOpeningPrice: (p: number) => void
  updateOpeningAmount: (p: number) => void
  updateClosingAmount: (p: number) => void
  fetchMaxVolume: (
    quoteTokenAddress: string,
    trader: string,
    price: string,
    exchange: string,
    marginToken: MarginTokenKeys
  ) => Promise<void>
}

export interface TraderInfoState {
  rewardsInfo: Rec
  stakingInfo: Rec
  variables: InitialTraderVariablesType
  variablesLoaded: boolean
  updateVariables: (p: InitialTraderVariablesType) => void
  updateStakingInfo: (p: Rec) => void
  updateRewardsInfo: (p: Rec) => void
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

export interface PoolsInfoState {
  drfPoolBalance: string
  bondPoolBalance: string
  positionsAmount: Rec
  updateDrfPoolBalance: (p: string) => void
  updateBondPoolBalance: (p: string) => void
  updatePositionsAmount: (p: Rec) => void
}
