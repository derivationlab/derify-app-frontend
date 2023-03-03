interface ActionType {
  type: 'SET_RANK_DAT' | 'SET_PAGE_INDEX'
  payload: any
}

interface StateType {
  rankData: { records: any[]; totalItems: number; isLoaded: boolean }
  pageIndex: number
}

const stateInit: StateType = {
  rankData: { records: [], totalItems: 0, isLoaded: true },
  pageIndex: 0
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_RANK_DAT':
      return { ...state, rankData: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
