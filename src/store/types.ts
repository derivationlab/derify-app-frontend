import { OpeningType } from '@/store/useOpening'
import { InitialTraderVariablesType } from '@/hooks/helper'
import {
  ChainId,
  MarginToken,
  QuoteTokenKeys,
  MarginTokenKeys,
  MarginTokenWithQuote,
  MarginTokenWithContract
} from '@/typings'

export type Rec = Record<string, any>

export interface RpcNodeState {
  rpc: string
  fetch: (chainId: ChainId) => Promise<void>
}

export interface OpeningState {
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

export interface BalancesState {
  loaded: boolean
  balances: Rec
  fetch: (account: string) => Promise<void>
  reset: () => void
}

export interface PositionState {
  positionOrd: Rec[]
  profitLossOrd: Rec[]
  loaded: boolean
  fetch: (trader: string, factoryConfig: Rec) => Promise<void>
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

export interface DashboardState {
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
  brokerBoundLoaded: boolean
  brokerInfoLoaded: boolean
  fetchBrokerInfo: (account: string, marginToken: string) => Promise<void>
  fetchBrokerBound: (account: string) => Promise<void>
  resetBrokerInfo: () => void
  resetBrokerBound: () => void
}

export interface TraderInfoState {
  rewardsInfo: Rec
  stakingInfo: Rec
  variables: InitialTraderVariablesType
  variablesLoaded: boolean
  updateVariables: (p: InitialTraderVariablesType) => void
  updateStakingInfo: (p: Rec) => void
  updateRewardsInfo: (p: Rec) => void
  reset: () => void
}

export interface ConfigInfoState {
  brokerParams: { burnLimitAmount: string; burnLimitPerDay: string }
  mTokenPrices: MarginToken
  minimumGrant: string[]
  openingMinLimit: MarginToken
  openingMaxLimit: MarginTokenWithQuote
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  openingMinLimitLoaded: boolean
  openingMaxLimitLoaded: boolean
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  mTokenPricesLoaded: boolean
  updateMinimumGrant: (p: string[]) => void
  updateFactoryConfig: (p: MarginTokenWithQuote) => void
  updateProtocolConfig: (p: MarginTokenWithContract) => void
  updateOpeningMinLimit: (p: MarginToken) => void
  updateMTokenPrices: (p: MarginToken) => void
  updateOpeningMaxLimit: (p: MarginTokenWithQuote) => void
  updateBrokerParams: (p: Rec) => void
}

export interface QuoteTokenState {
  quoteToken: QuoteTokenKeys
  updateQuoteToken: (p: QuoteTokenKeys) => void
}

export interface MarginTokenState {
  marginToken: MarginTokenKeys
  updateMarginToken: (p: MarginTokenKeys) => void
}

export interface MarginTokenState {
  marginToken: MarginTokenKeys
  updateMarginToken: (p: MarginTokenKeys) => void
}
