export type Rec = Record<string, any>

export interface RpcState {
  rpc: string
  fetch: () => Promise<void>
}

export interface PriceState {
  prices: Rec
  loaded: boolean
  updatePrices: (data: Rec) => void
}

export interface TickerState {
  ticker: Rec
  loaded: boolean
  updateTicker: (data: Rec) => void
}

export interface PosDATState {
  orders: any[]
  loaded: boolean
  fetch: (account: string, quote: string) => Promise<void>
}

export interface BalancesState {
  balances: Rec
  loaded: boolean
  fetch: (p: string) => Promise<void>
  reset: () => void
}

export interface ParameterState {
  lpPrice: number
  fundingRate: number
  executionFee: number
  fundingInterval: number
  positionPrecision: number
  fundingPrecision: number
  maxLeverage: number
  minCollateral: number
  insuranceOdds: number
  marginRate: number
  burnLDRate: number
  openingRate: number
  clearingRate: number
  cumulativeFundingRate: number
  updateParameter: (data: Rec) => void
  loaded: boolean
}

export interface TemporaryDataState {
  temporaryData: Rec
  clearTemporaryData: () => void
  updateTemporaryData: (data: Rec) => void
}

export interface OrdDATState extends PosDATState {}
