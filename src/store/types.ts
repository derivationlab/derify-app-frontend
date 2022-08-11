import { ThunkAction } from 'redux-thunk'
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'

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
  bDRFPool: string
  DRFPool: string
  positions: Record<string, any>[]
  posFeeRatio: Record<string, any>
  indicator: Record<string, any>
}

export interface ShareMessageState {
  shareMessage: any
}

export interface State {
  contract: ContractState
  trader: TraderState
  constant: ConstantState
  shareMessage: ShareMessageState
}

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, AnyAction>

export type AppThunkDispatch = ThunkDispatch<State, unknown, AnyAction>

export type AppGetState = () => State
