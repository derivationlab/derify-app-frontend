interface ActionType {
  type: 'SET_FILTER_CONDITION' | 'SET_FILTER_CONDITIONS' | 'SET_RECORDS' | 'SET_PAGE_INDEX'
  payload: any
}

interface StateType {
  records: { records: any[]; totalItems: number; loaded: boolean }
  pageIndex: number
  filterCondition: string
  filterConditions: Record<string, any>[] | null
}

const stateInit: StateType = {
  records: { records: [], totalItems: 0, loaded: false },
  pageIndex: 0,
  filterCondition: '',
  filterConditions: null
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload }
    case 'SET_FILTER_CONDITION':
      return { ...state, filterCondition: action.payload }
    case 'SET_FILTER_CONDITIONS':
      return { ...state, filterConditions: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
