import { SharingEvents } from '@/store/useSharing'
import { InitialTraderVariablesType } from '@/hooks/helper'
import {
  ChainId,
  MarginToken,
  MarginTokenKeys,
  MarginTokenWithQuote,
  MarginTokenWithContract,
  ProtocolConfig,
  PositionOrderTypes
} from '@/typings'
import { minimumGrantInit } from '@/hooks/useDashboard'
import { marginTokenList } from '@/store/useMarginTokenList'
import { marginToken } from '@/store/useMarginToken'
import { derivativeList } from '@/store/useDerivativeList'
import { quoteToken } from '@/store/useQuoteToken'
import { getTokenBalances } from '@/store/useBalances'

export type Rec = Record<string, any>

export interface WalletState {
  loaded: boolean
  account: string
  updateAccount: (data: string) => void
}

export interface RpcNodeState {
  rpc: string
  fetch: (chainId: ChainId) => Promise<void>
}

export interface PositionOperationState {
  disposableAmount: Rec | null
  closingType: string
  closingAmount: string
  openingPrice: string
  openingAmount: string
  leverageNow: number
  openingType: PositionOrderTypes
  disposableAmountLoaded: boolean
  updateClosingType: (p: string) => void
  updateOpeningType: (p: PositionOrderTypes) => void
  updateLeverageNow: (p: number) => void
  updateOpeningPrice: (p: string) => void
  updateOpeningAmount: (p: string) => void
  updateClosingAmount: (p: string) => void
  getDisposableAmount: (
    quoteToken: Rec,
    trader: string,
    price: string,
    exchange: string,
    marginToken: Rec
  ) => Promise<void>
}

export interface SharingState {
  sharing: SharingEvents | undefined
  updateSharing: (data: SharingEvents | undefined) => void
}

export interface BalancesState {
  loaded: boolean
  balances: Rec | null
  getTokenBalances: (account: string, list: typeof marginTokenList[]) => Promise<void>
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
  minimumGrant: typeof minimumGrantInit
  openingMinLimit: MarginToken
  openingMaxLimit: MarginTokenWithQuote
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  openingMinLimitLoaded: boolean
  openingMaxLimitLoaded: boolean
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
  mTokenPricesLoaded: boolean
  updateMinimumGrant: (p: typeof minimumGrantInit) => void
  updateFactoryConfig: (p: MarginTokenWithQuote) => void
  updateProtocolConfig: (p: MarginTokenWithContract) => void
  updateOpeningMinLimit: (p: MarginToken) => void
  updateMTokenPrices: (p: MarginToken) => void
  updateOpeningMaxLimit: (p: MarginTokenWithQuote) => void
  updateBrokerParams: (p: Rec) => void
}

export interface ProtocolConfigState {
  protocolConfig: ProtocolConfig | null
  protocolConfigLoaded: boolean
  getProtocolConfig: (marginTokenAddress: string) => Promise<void>
}

export interface QuoteTokenState {
  quoteToken: typeof quoteToken
  updateQuoteToken: (data: typeof quoteToken) => void
}

export interface MarginTokenState {
  marginToken: { symbol: string; address: string }
  updateMarginToken: (data: typeof marginToken) => void
}

export interface MarginTokenListState {
  marginTokenList: (typeof marginTokenList)[]
  marginTokenSymbol: string[]
  marginTokenListLoaded: boolean
  getMarginTokenList: (index?: number) => Promise<void>
}

export interface DerivativeListState {
  derAddressList: Rec | null
  derivativeList: (typeof derivativeList)[]
  derivativeListLoaded: boolean
  getDerivativeList: (marginTokenAddress: string) => Promise<void>
  getDerAddressList: (address: string, list: (typeof derivativeList)[]) => Promise<void>
}

export interface MarginIndicatorsState {
  marginIndicators: Rec | null
  marginIndicatorsLoaded: boolean
  updateMarginIndicators: (data: Rec) => void
}

export interface TokenSpotPricesState {
  tokenSpotPrices: Rec | null
  tokenSpotPricesLoaded: boolean
  updateTokenSpotPrices: (data: Rec) => void
}

export interface OpeningMinLimitState {
  openingMinLimit: string
  openingMinLimitLoaded: boolean
  getOpeningMinLimit: (address: string) => Promise<void>
}

export interface MarginPriceState {
  marginPrice: string
  marginPriceLoaded: boolean
  getMarginPrice: (address: string) => Promise<void>
}

export interface OpeningMaxLimitState {
  openingMaxLimit: Rec | null
  openingMaxLimitLoaded: boolean
  getOpeningMaxLimit: (address: string, list: (typeof derivativeList)[]) => Promise<void>
}
