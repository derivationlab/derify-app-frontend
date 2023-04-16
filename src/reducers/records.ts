interface ActionType {
  type: 'SET_RECORDS' | 'SET_PAGE_INDEX'
  payload: any
}

interface StateType {
  records: { records: any[]; totalItems: number; loaded: boolean }
  pageIndex: number
}

const stateInit: StateType = {
  records: { records: [], totalItems: 0, loaded: true },
  pageIndex: 0
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
