interface ActionType {
  type: 'SET_GRANT_DAT' | 'SET_PAGE_INDEX' | 'SET_GRANT_STATUS' | 'SET_GRANT_TYPE' | 'SET_MARGIN_TOKEN'
  payload: any
}

interface StateType {
  grantType: string
  grantData: { records: any[]; totalItems: number; isLoaded: boolean }
  pageIndex: number
  marginToken: string
  grantStatus: string
}

const stateInit: StateType = {
  grantType: '',
  grantStatus: '',
  grantData: { records: [], totalItems: 0, isLoaded: true },
  pageIndex: 0,
  marginToken: ''
}

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_GRANT_DAT':
      return { ...state, grantData: action.payload }
    case 'SET_GRANT_TYPE':
      return { ...state, grantType: action.payload }
    case 'SET_GRANT_STATUS':
      return { ...state, grantStatus: action.payload }
    case 'SET_PAGE_INDEX':
      return { ...state, pageIndex: action.payload }
    case 'SET_MARGIN_TOKEN':
      return { ...state, pageIndex: action.payload }
    default:
      return state
  }
}

export { stateInit, reducer }
