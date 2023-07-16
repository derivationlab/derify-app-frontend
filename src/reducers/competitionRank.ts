import { DataRecord, dataRecordInit } from '@/typings'

interface ActionType {
  type: 'SET_FILTER_CONDITION' | 'SET_FILTER_CONDITIONS' | 'SET_OUTPUT_DATA'
  payload: any
}

interface StateType {
  outputData: DataRecord
  filterCondition: string
  filterConditions: Record<string, any>[] | null
}

const stateInit: StateType = {
  outputData: dataRecordInit,
  filterCondition: '',
  filterConditions: null
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_OUTPUT_DATA':
      return { ...state, outputData: { ...state.outputData, ...action.payload } }
    case 'SET_FILTER_CONDITION':
      return { ...state, filterCondition: action.payload }
    case 'SET_FILTER_CONDITIONS':
      return { ...state, filterConditions: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
