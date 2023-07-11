import { getAllMarginTokenList } from '@/api'
import { DerAddressList, derivativeList } from '@/store/useDerivativeList'
import { marginToken } from '@/store/useMarginToken'
import { marginTokenList, pagingParams } from '@/store/useMarginTokenList'
import { initOpeningParams } from '@/store/usePositionOperation'
import { quoteToken } from '@/store/useQuoteToken'
import { InitialTraderVariablesType } from '@/store/useTraderVariables'
import { ChainId, ProtocolConfig, Rec } from '@/typings'

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
  openingParams: typeof initOpeningParams
  updateOpeningParams: (p: Partial<typeof initOpeningParams>) => void
}

export interface BalancesState {
  loaded: boolean
  balances: Rec | null
  getTokenBalances: (account: string, list: (typeof marginTokenList)[]) => Promise<void>
  reset: () => void
}

export interface PositionState {
  positionOrd: Rec[]
  profitLossOrd: Rec[]
  loaded: boolean
  fetch: (trader: string, factoryConfig: Rec) => Promise<void>
  reset: (data: { positionOrd?: Rec[]; profitLossOrd?: Rec[]; loaded?: boolean }) => void
}

export interface BrokerInfoState {
  brokerInfo: Rec | null | undefined
  brokerBound: Rec | null | undefined
  brokerBoundLoaded: boolean
  brokerInfoLoaded: boolean
  fetchBrokerInfo: (account: string, marginToken: string) => Promise<void>
  fetchBrokerBound: (account: string) => Promise<void>
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
  marginToken: typeof marginToken
  updateMarginToken: (data: typeof marginToken) => void
}

export interface MarginTokenListState {
  pagingParams: typeof pagingParams
  marginTokenList: (typeof marginTokenList)[]
  marginTokenListStore: (typeof marginTokenList)[]
  marginTokenSymbol: string[]
  allMarginTokenList: string[]
  marginTokenListLoaded: boolean
  getMarginTokenList: (index?: number) => Promise<void>
  getAllMarginTokenList: () => Promise<void>
  updateMarginTokenListStore: (data: (typeof marginTokenList)[]) => void
}

export interface DerivativeListState {
  derivativeList: (typeof derivativeList)[]
  derivativeListLoaded: boolean
  getDerivativeList: (marginToken: string, factory: string, page?: number, size?: number) => Promise<void>
}

export interface MarginIndicatorsState {
  marginIndicators: Rec | null
  marginIndicatorsLoaded: boolean
  updateMarginIndicators: (data: Rec) => void
}

export interface TokenSpotPricesState {
  tokenSpotPrices: Rec[] | null
  tokenSpotPricesForPosition: Rec[] | null
  tokenSpotPricesForTrading: Rec[] | null
  tokenSpotPricesLoaded: boolean
  updateTokenSpotPrices: (data: Rec[]) => void
  updateTokenSpotPricesForTrading: (data: Rec[]) => void
  updateTokenSpotPricesForPosition: (data: Rec[]) => void
}

export interface OpeningMinLimitState {
  openingMinLimit: string
  openingMinLimitLoaded: boolean
  getOpeningMinLimit: (address: string) => Promise<void>
}

export interface TraderVariablesState {
  variables: InitialTraderVariablesType
  variablesLoaded: boolean
  getTraderVariables: (address: string, exchange: string) => Promise<void>
  reset: () => void
}

export interface PositionLimitState {
  positionLimit: Rec | null
  getPositionLimit: (address: string, list: typeof quoteToken) => Promise<void>
}
