import { DerAddressList, derivativeList } from '@/store/useDerivativeList'
import { marginToken } from '@/store/useMarginToken'
import { marginTokenList, pagingParams } from '@/store/useMarginTokenList'
import { quoteToken } from '@/store/useQuoteToken'
import { SharingEvents } from '@/store/useSharing'
import { InitialTraderVariablesType } from '@/store/useTraderVariables'
import { ChainId, ProtocolConfig, PositionOrderTypes, Rec } from '@/typings'

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
  closingType: string
  closingAmount: string
  openingPrice: string
  openingAmount: string
  leverageNow: number
  openingType: PositionOrderTypes
  updateClosingType: (p: string) => void
  updateOpeningType: (p: PositionOrderTypes) => void
  updateLeverageNow: (p: number) => void
  updateOpeningPrice: (p: string) => void
  updateOpeningAmount: (p: string) => void
  updateClosingAmount: (p: string) => void
}

export interface SharingState {
  sharing: SharingEvents | undefined
  updateSharing: (data: SharingEvents | undefined) => void
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
  brokerInfo: Rec
  brokerBound: Rec
  brokerBoundLoaded: boolean
  brokerInfoLoaded: boolean
  fetchBrokerInfo: (account: string, marginToken: string) => Promise<void>
  fetchBrokerBound: (account: string) => Promise<void>
  resetBrokerInfo: () => void
  resetBrokerBound: () => void
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
  marginTokenSymbol: string[]
  marginAddressList: string[]
  marginTokenListLoaded: boolean
  getMarginTokenList: (index?: number) => Promise<void>
  getMarginAddressList: () => Promise<void>
}

export interface DerivativeListState {
  derAddressList: DerAddressList | null
  posMaxLeverage: { [key: string]: string } | null
  derivativeList: (typeof derivativeList)[]
  derivativeListOrigin: (typeof derivativeList)[]
  derivativeListLoaded: boolean
  posMaxLeverageLoaded: boolean
  derAddressListLoaded: boolean
  getDerivativeList: (marginTokenAddress: string, page?: number, size?: number) => Promise<void>
  getDerAddressList: (address: string) => Promise<void>
  getPosMaxLeverage: () => Promise<void>
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

export interface TraderVariablesState {
  variables: InitialTraderVariablesType
  variablesLoaded: boolean
  getTraderVariables: (address: string, exchange: string) => Promise<void>
  reset: () => void
}

export interface OpeningMaxLimitState {
  openingMaxLimit: Rec | null
  openingMaxLimitLoaded: boolean
  getOpeningMaxLimit: (address: string, list: typeof quoteToken) => Promise<void>
}
