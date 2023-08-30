import { dataRecordInit } from '@/typings'

interface ActionType {
  type: 'SET_FILTER_CONDITION' | 'SET_OUTPUT_DATA'
  payload: any
}

interface StateType {
  outputData: typeof dataRecordInit
  filterCondition: { data: Record<string, any>[]; loaded: boolean; current: string }
}

const stateInit: StateType = {
  outputData: { ...dataRecordInit, loaded: false },
  filterCondition: { data: [], loaded: true, current: '' }
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_OUTPUT_DATA':
      return { ...state, outputData: { ...state.outputData, ...action.payload } }
    case 'SET_FILTER_CONDITION':
      return { ...state, filterCondition: { ...state.filterCondition, ...action.payload } }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export { stateInit, reducer }
