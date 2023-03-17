interface ActionType {
  type: 'SET_MARKET_DAT' | 'SET_PAGE_INDEX'
  payload: any
}

interface StateType {
  marketData: { records: any[]; totalItems: number; isLoaded: boolean }
  pageIndex: number
}

const stateInit: StateType = {
  marketData: { records: [], totalItems: 0, isLoaded: true },
  pageIndex: 0
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_MARKET_DAT':
      return { ...state, marketData: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
