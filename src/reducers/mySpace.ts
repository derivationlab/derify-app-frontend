interface ActionType {
  type: 'SET_MARGIN_DAT' | 'SET_PAGE_INDEX'
  payload: any
}

interface StateType {
  marginData: { records: any[]; totalItems: number; isLoaded: boolean }
  pageIndex: number
}

const stateInit: StateType = {
  marginData: { records: [], totalItems: 0, isLoaded: true },
  pageIndex: 0
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_MARGIN_DAT':
      return { ...state, marginData: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
