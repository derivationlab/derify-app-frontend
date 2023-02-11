import { ThunkAction } from 'redux-thunk'
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'

import { MarginTokenKeys, MarginTokenWithContract, MarginTokenWithQuote } from '@/typings'

export interface RpcState {
  rpc: string
  fetch: () => Promise<void>
}

export interface TraderState {
  trader: Record<string, any>
  broker: Record<string, any>
  brokerBound: Record<string, any>
  brokerLoaded: boolean
  brokerBoundLoaded: boolean
}

export interface ContractState {
  pairs: Record<string, any>[]
  myOrders: Record<string, any>[]
  myPositions: Record<string, any>[]
  currentPair: string
  pairsLoaded: boolean
  myOrdersLoaded: boolean
  myPositionsLoaded: boolean
}

export interface ConstantState {
  DRFPool: string
  bBUSDPool: string
  indicator: Record<string, any>
  posFeeRatio: Record<string, any>
}

export interface ShareMessageState {
  shareMessage: any
}

export interface ConfigState {
  marginToken: MarginTokenKeys
  factoryConfig: MarginTokenWithQuote
  protocolConfig: MarginTokenWithContract
  factoryConfigLoaded: boolean
  protocolConfigLoaded: boolean
}

export interface State {
  config: ConfigState
  trader: TraderState
  contract: ContractState
  constant: ConstantState
  shareMessage: ShareMessageState
}

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export type AppThunkDispatch = ThunkDispatch<State, unknown, AnyAction>

export type AppGetState = () => State
