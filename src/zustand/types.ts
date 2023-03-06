import { MarginToken, MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'
import { InitialTraderVariablesType } from '@/hooks/helper'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'

export type Rec = Record<string, any>

export interface RpcState {
  rpc: string
  fetch: () => Promise<void>
}

export interface BalancesState {
  loaded: boolean
  balances: Rec
  bMarginToken: string
  fetch: (account: string) => Promise<void>
  fetchBalance: (account: string, address: string) => Promise<void>
  reset: () => void
}

export interface ConfigInfoState {
  brokerParams: { burnLimitAmount: string; burnLimitPerDay: string }
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
  updateBrokerParams: (p: Rec) => void
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
  closingType: string
  closingAmount: string
  openingPrice: string
  openingAmount: string
  leverageNow: number
  openingType: OpeningType
  maxVolumeLoaded: boolean
  updateClosingType: (p: MarginTokenKeys) => void
  updateOpeningType: (p: OpeningType) => void
  updateLeverageNow: (p: number) => void
  updateOpeningPrice: (p: string) => void
  updateOpeningAmount: (p: string) => void
  updateClosingAmount: (p: string) => void
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

export interface DashboardDATState {
  dashboardDAT: Rec
  updateDashboardDAT: (p: Rec) => void
}

export interface PoolsInfoState {
  drfPoolBalance: string
  bondPoolBalance: string
  updateDrfPoolBalance: (p: string) => void
  updateBondPoolBalance: (p: string) => void
}

export interface BrokerInfoState {
  brokerInfo: Rec
  brokerBound: Rec
  brokerAssets: Rec
  brokerBoundLoaded: boolean
  brokerInfoLoaded: boolean
  brokerAssetsLoaded: boolean
  updateBrokerAssets: (p: Rec) => void
  fetchBrokerInfo: (account: string) => Promise<void>
  fetchBrokerBound: (account: string) => Promise<void>
}
