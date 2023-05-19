import { Rec } from '@/typings'

interface ActionType {
  type: 'SET_KLINE_INIT'
  payload: any
}

interface StateType {
  kline: { data: Rec[]; loaded: boolean; timeLine: number }
}

const stateInit: StateType = {
  kline: { data: [], loaded: false, timeLine: 60 * 60 * 1000 }
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_KLINE_INIT':
      return { ...state, kline: { ...state.kline, ...action.payload } }
    default:
      return state
  }
}

export { stateInit, reducer }
